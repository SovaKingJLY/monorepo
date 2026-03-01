import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { message } from "antd";

type ApiResponse<T = any> = {
    code: number;
    data: T;
    message?: string;
};

type RetryableConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const TOKEN_KEY = 'token';

const shouldSkipRefresh = (url?: string): boolean => {
    if (!url) return false;
    return (
        url.includes('/admin/renewAccessToken/') ||
        url.includes('/token/logoutToken/')
    );
};

const getToken = (): string => localStorage.getItem(TOKEN_KEY) || '';

const setToken = (token: string) => {
    if (!token) {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    localStorage.setItem(TOKEN_KEY, token);
};

const setAuthHeader = (config: InternalAxiosRequestConfig, token: string) => {
    if (!token) return;
    if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
    } else {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
};

export const http = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL || ''}`,
    withCredentials: true,//跨域时是否携带cookie
    timeout: 10000,
})

const refreshHttp = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL || ''}`,
    withCredentials: true,
    timeout: 10000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {//发送时的拦截器,加上token
    const token = getToken();
    setAuthHeader(config, token);
    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

let isRefreshing = false;
let requests: Array<(token: string | null) => void> = [];

const renewTokenRequest = async (): Promise<string> => {
    const res = await refreshHttp.post<any, AxiosResponse<ApiResponse<any>>>('/admin/renewAccessToken/');
    if (res.data.code < 300) {
        const payload = res.data.data;
        if (typeof payload === 'string') return payload;
        return payload?.accessToken || '';
    }
    return Promise.reject(res.data.message || '续期失败');
};

http.interceptors.response.use(//接收时的拦截器
    async (response: AxiosResponse<ApiResponse>) => {//网络上没错
        if (response.data.code < 300) {
            return response.data.data;
        }

        if (response.data.code === 401) {
            const config = response.config as RetryableConfig;

            // 续期接口/登出接口本身 401，不再继续套娃续期
            if (shouldSkipRefresh(config.url) || config._retry) {
                setToken('');
                return Promise.reject(response.data.message || '登录已过期');
            }

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await renewTokenRequest();
                    setToken(newToken);

                    requests.forEach((cb) => cb(newToken || null));
                    requests = [];

                    config._retry = true;
                    setAuthHeader(config, newToken);
                    return http(config);
                } catch (e) {
                    requests.forEach((cb) => cb(null));
                    requests = [];
                    setToken('');
                    message.error('登录已过期，请重新登录');
                    return Promise.reject(e);
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
                    setAuthHeader(config, token);
                    resolve(http(config));
                });
            });
        }

        const backendMsg = response.data.message || '请求失败';
        message.error(backendMsg);
        return Promise.reject(response.data);
    },
    (errorInfo: AxiosError<{ message?: string }>) => {
        const errorMsg = errorInfo.response?.data?.message || errorInfo.message || "请求失败";
        console.error("Request Error:", errorInfo);
        message.error(errorMsg);
        return Promise.reject(errorInfo);
    }
)