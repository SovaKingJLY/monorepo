import http from './http';

// ================== 类型定义区域 ==================

/** 登录参数接口 */
export interface LoginParams {
    username?: string;
    password?: string;
    [key: string]: any;
}

/** 登录响应接口 */
export interface loginRes {
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
export const loginRequest = async (params: { email: string, password: string, remember: boolean }): Promise<loginRes> => {
    return await http.post('/admin/login/', params);
}
