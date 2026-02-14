import axios, { AxiosError, type AxiosResponse } from 'axios';
import useUserStore from '@/store/user';

const http = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});

// 请求拦截器
http.interceptors.request.use(config => {//发送时的拦截器,加上token
    const accessTokentoken = useUserStore.getState().accessToken;
    if (accessTokentoken)
        // config.headers['Authorization'] = 'Bearer ' + accessTokentoken;
        config.headers['satoken'] = accessTokentoken;
    return config;
});
// 响应拦截器
http.interceptors.response.use(//接收时的拦截器
    async (response: AxiosResponse) => {//网络上没错
        // 这里可以直接返回 response.data，视后端接口规范而定
        if (response.data.code !== 200) {
            return Promise.reject(response.data)
        }
        return response.data;
    },
    (errorInfo: AxiosError<{ message?: string }>) => {
        console.error("Request Error:", errorInfo); // Log detailed error
        return Promise.reject(errorInfo);
    }
)

export default http;
