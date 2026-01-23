import axios from 'axios';
import useUserStore from '@/store/user';

const http = axios.create({
    baseURL: 'http://124.221.73.180:3002',
    timeout: 10000,
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
http.interceptors.response.use(
    (response) => {
        console.log(response);
        // 这里的行为取决于你的后端返回结构，通常返回 response.data
        return response.data;
    },
    (error) => {
        console.log('Request Error:', error); // 添加错误日志
        // 可以在这里统一处理错误，例如 401 token 过期跳转登录等
        if (error.response && error.response.status === 401) {
            // 清除用户信息并跳转到登录页（可选）
            const { logout } = useUserStore.getState();
            logout();
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default http;
