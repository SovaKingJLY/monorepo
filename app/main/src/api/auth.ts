// 预留的登录注册接口
export interface LoginParams {
    username?: string;
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
    console.log('Call Login API with:', values);
    // return request.post('/api/login', values);
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const register = async (values: RegisterParams) => {
    console.log('Call Register API with:', values);
    // return request.post('/api/register', values);
    return new Promise((resolve) => setTimeout(resolve, 1000));
};
