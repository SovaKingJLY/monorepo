import axios, { AxiosError, type AxiosResponse } from 'axios';
import { message } from 'antd';
import useUserStore from '@/store/user';

type RetryableConfig = {
    _retry?: boolean;
    url?: string;
    headers?: Record<string, string>;
};

const shouldSkipRefresh = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('/token/renewAccessToken/') || url.includes('/admin/renewAccessToken/') || url.includes('/token/logoutToken/');
};

const http = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});

const refreshHttp = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});

// 请求拦截器
http.interceptors.request.use(config => {//发送时的拦截器,加上token
    const accessTokentoken = useUserStore.getState().accessToken;
    if (accessTokentoken)
        config.headers['satoken'] = accessTokentoken;
    return config;
});

let isRefreshing = false;
let requests: Array<(token: string | null) => void> = [];

// 响应拦截器
http.interceptors.response.use(//接收时的拦截器
    async (response: AxiosResponse) => {//网络上没错
        const code = response.data?.code;

        if (typeof code === 'number' && code < 300) {
            return response.data;
        }

        if (code === 401) {
            const config = response.config as RetryableConfig;

            // 续期接口/登出接口本身 401，不再继续续期
            if (shouldSkipRefresh(config.url)) {
                useUserStore.getState().setAccessToken('');
                useUserStore.getState().setRole('');
                useUserStore.getState().setIsLogin(false);
                return Promise.reject(response.data?.message || '登录已过期');
            }

            // 同一个请求最多重试一次，避免死循环
            if (config._retry) {
                useUserStore.getState().setAccessToken('');
                useUserStore.getState().setRole('');
                useUserStore.getState().setIsLogin(false);
                return Promise.reject(response.data?.message || '登录已过期');
            }

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await renewTokenRequest();
                    useUserStore.getState().setAccessToken(newToken);

                    requests.forEach((cb) => cb(newToken));
                    requests = [];

                    config._retry = true;
                    config.headers = config.headers || {};
                    config.headers['satoken'] = newToken;
                    return http(config);
                } catch (error) {
                    requests.forEach((cb) => cb(null));
                    requests = [];
                    message.error('登录已过期，请重新登录');
                    useUserStore.getState().setAccessToken('');
                    useUserStore.getState().setRole('');
                    useUserStore.getState().setIsLogin(false);
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve, reject) => {
                requests.push((token: string | null) => {
                    if (!token) {
                        reject('登录已过期');
                        return;
                    }
                    config._retry = true;
                    config.headers = config.headers || {};
                    config.headers['satoken'] = token;
                    resolve(http(config));
                });
            });
        }

        if (response.data) {
            return Promise.reject(response.data);
        }
        return Promise.reject('请求失败');
    },
    (errorInfo: AxiosError<{ message?: string }>) => {
        message.error(errorInfo?.response?.data?.message || '请求失败');
        return Promise.reject(errorInfo);
    }
)

const renewTokenRequest = async (): Promise<string> => {
    const res = await refreshHttp.post('/admin/renewAccessToken/');

    if (!(typeof res.data?.code === 'number' && res.data.code < 300)) {
        return Promise.reject(res.data?.message || '续期失败');
    }

    const tokenCandidate = res.data?.data;
    const accessToken = typeof tokenCandidate === 'string'
        ? tokenCandidate
        : tokenCandidate?.accessToken || tokenCandidate?.access_token;

    if (!accessToken) {
        return Promise.reject('续期失败：未返回 accessToken');
    }

    return accessToken;
};

export default http;
