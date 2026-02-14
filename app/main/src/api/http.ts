import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { message } from "antd";

export const http = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL || ''}`,
    withCredentials: true,//跨域时是否携带cookie
    timeout: 10000,
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {//发送时的拦截器,加上token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

// 暂时未使用的刷新 Token 变量
// let isRefreshing = false;
// let requests: Function[] = [];

http.interceptors.response.use(//接收时的拦截器
    async (response: AxiosResponse) => {//网络上没错
        // 这里可以直接返回 response.data，视后端接口规范而定
        if (response.data.code !== 200) {
            return Promise.reject(response.data)
        }
        return response.data;
    },
    (errorInfo: AxiosError<{ message?: string }>) => {
        const errorMsg = errorInfo.response?.data?.message || errorInfo.message || "请求失败";
        console.error("Request Error:", errorInfo); // Log detailed error
        message.error(errorMsg);
        return Promise.reject(errorInfo);
    }
)