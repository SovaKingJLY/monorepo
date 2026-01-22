import http from './http';

// ================== 类型定义区域 ==================

/** 登录参数接口 */
export interface LoginParams {
    username?: string;
    password?: string;
    [key: string]: any;
}

/** 登录响应接口 */
export interface LoginResponse {
    code: number;
    message: string;
    data: {
        access_token: string;
        [key: string]: any;
    }
}

/** 用户信息接口 */
export interface UserProfile {
    id: number;
    username: string;
    email: string;
    avatar?: string;
}

// ================== API 请求区域 ==================

/** 登录接口 */
export const login = (data: LoginParams) => {
    return http.post<any, LoginResponse>('/admin/login/', data);
};
