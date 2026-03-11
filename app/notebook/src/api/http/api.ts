import axios from "axios";
import { message } from "antd";
import useUserStore from "../../store/user";
import { useAiChatStore } from "../../store/aiChatStore";

type RetryableConfig = {
    _retry?: boolean;
    _retryCount?: number;
    url?: string;
    headers?: Record<string, string>;
};

const MAX_HTTP_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldSkipRefresh = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('/token/renewAccessToken/') || url.includes('/admin/renewAccessToken/') || url.includes('/token/logoutToken/');
};

export const http = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}`,
    withCredentials: true,//跨域时是否携带cookie
    timeout: 10000,
})

const refreshHttp = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}`,
    withCredentials: true,
    timeout: 10000,
})

http.interceptors.request.use(config => {//发送时的拦截器,加上token
    const accessTokentoken = useUserStore.getState().accessToken;
    console.log(accessTokentoken, "此时发送的token");
    if (accessTokentoken)
        config.headers['Authorization'] = "Bearer " + accessTokentoken;
    return config;
});

let isRefreshing = false;
let requests: Array<(token: string | null) => void> = [];

http.interceptors.response.use(//接收时的拦截器
    async (response) => {//网络上没错
        // console.log(response);
        if (response.data.code < 300) {
            return response.data.data;
        }
        else if (response.data.code == 401) {//当accesstoken过期时
            console.log("续期accesstoken");
            const config = response.config as RetryableConfig;

            // 续期接口/登出接口本身 401，不再继续套娃续期
            if (shouldSkipRefresh(config.url)) {
                useUserStore.getState().setAccessToken("");
                useUserStore.getState().setRole("");
                useUserStore.getState().setIsLogin(false);
                return Promise.reject(response.data.message || '登录已过期');
            }

            // 同一个请求最多只重试一次，避免死循环
            if (config._retry) {
                useUserStore.getState().setAccessToken("");
                useUserStore.getState().setRole("");
                useUserStore.getState().setIsLogin(false);
                return Promise.reject(response.data.message || '登录已过期');
            }

            if (isRefreshing == false) {
                isRefreshing = true;
                try {
                    const newToken = await renewTokenRequest();
                    useUserStore.getState().setAccessToken(newToken);
                    requests.forEach((cb) => cb(newToken));//通知每个函数，执行一下
                    // 2. 清空队列
                    requests = [];
                    // 3. 重试当前请求
                    const config = response.config as RetryableConfig;
                    config._retry = true;
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = 'Bearer ' + newToken;
                    return http(config);
                } catch (e) {
                    requests.forEach((cb) => cb(null)); // 通知队列里的请求失败
                    requests = [];
                    message.error('登录已过期，请重新登录');
                    // 这里只做本地清理，避免 logout 接口再次触发 401->续期 循环
                    useUserStore.getState().setAccessToken("");
                    useUserStore.getState().setRole("");
                    useUserStore.getState().setIsLogin(false);
                    return Promise.reject(e);
                } finally {
                    isRefreshing = false;
                }

            } else {
                return new Promise((resolve, reject) => {
                    // 我们把一个“回调函数”推入队列
                    requests.push(
                        (token: string | null) => {
                            // 这个函数现在不会执行，它只是被存起来了
                            // 等到将来被调用，并且传入 token 时，它才会执行下面的代码：
                            if (!token) {
                                reject('登录已过期');
                                return;
                            }
                            config._retry = true;
                            config.headers = config.headers || {};
                            config.headers['Authorization'] = 'Bearer ' + token; // 1. 换新票
                            resolve(http(config)); // 2. 重新发请求，并把结果返回给外面的 Promise
                        }
                    );
                });
            }
        }
        else {
            return Promise.reject(response.data.message);
        }
    }, async errorInfo => {
        const config = errorInfo?.config as RetryableConfig | undefined;
        const canRetry = !!config;

        if (canRetry) {
            config._retryCount = config._retryCount ?? 0;

            if (config._retryCount < MAX_HTTP_RETRIES) {
                config._retryCount += 1;
                await sleep(300 * config._retryCount);
                return http(config);
            }
        }

        message.error(errorInfo?.response?.data?.message || '请求失败');
        return Promise.reject("error");
    }
)


const renewTokenRequest = async (): Promise<string> => {
    const res = await refreshHttp.post('/admin/renewAccessToken/');
    if (res.data.code < 300) {
        const tokenCandidate = res.data?.data;
        const accessToken = typeof tokenCandidate === 'string'
            ? tokenCandidate
            : tokenCandidate?.accessToken || tokenCandidate?.access_token;

        if (!accessToken) {
            return Promise.reject('续期失败：未返回 accessToken');
        }

        return accessToken;
    }
    else return Promise.reject(res.data.message || '续期失败');
}



// 修改后的前端代码
export const uploadAiChatData = async (chatData: chatData, sessionId: string): Promise<string> => {
    return await http.post('/chat/add/', {
        // 直接发送平铺的数据
        parentId: useAiChatStore.getState().parentId,
        sessionId: sessionId,
        role: chatData.role,
        content: chatData.content,
        reasoningContent: chatData.reasoningContent,
    });
}

export const getUserSessionList = async (): Promise<session[]> => {
    return await http.post("/session/getList/");
}
export const getSessionHistory = async (sessionId: string): Promise<chatData[]> => {
    return await http.post('/session/getHistory/', {
        sessionId: sessionId
    })
}