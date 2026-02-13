import { http } from "./http";


// 预留的登录注册接口
export interface LoginParams {
    email?: string;
    password?: string;
    remember?: boolean;
}

export interface RegisterParams {
    username?: string;
    password?: string;
    confirm?: string;
    email?: string;
}

export const login = async (values: LoginParams) => {
    // 真实接口调用
    return http.post('/auth/login', values);

    // 模拟接口 (调试用)
    // console.log('Call Login API with:', values);
    // return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const register = async (values: RegisterParams) => {
    return http.post('/auth/register', values);
};
