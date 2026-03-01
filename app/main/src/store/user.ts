import { create } from 'zustand';
import { loginRequest, logoutAdmin, loginCheck } from '@/api/login';
import { message } from 'antd';

const TOKEN_KEY = 'token';

export interface LoginParams {
    email: string | null;
    password: string | null;
    remember: boolean | null;
}

interface UserState {
    isLogin: boolean;
    loginLoading: boolean;
    login: (params: LoginParams) => Promise<boolean>;
    logout: () => Promise<void>;
    checkLogin: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    isLogin: false,
    loginLoading: false,
    checkLogin: async () => {
        console.log("判断是否登录");
        try {
            await loginCheck();

            set({ isLogin: true });
        } catch (error) {
            set({ isLogin: false });
        }
    },
    login: async (params: LoginParams) => {
        set({ loginLoading: true });
        try {
            const res = await loginRequest(params);
            if (res?.accessToken) {
                localStorage.setItem(TOKEN_KEY, res.accessToken);
            }
            set({ isLogin: true });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            // 错误提示通常已经在全局拦截器处理，如果没有，可以在这里加
            return false;
        } finally {
            set({ loginLoading: false });
        }
    },
    logout: async () => {
        console.log("已注销");
        try {
            await logoutAdmin();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // 无论服务端注销是否成功，前端都清除状态
            localStorage.removeItem(TOKEN_KEY);
            set({ isLogin: false });
            message.success('已注销');
        }
    }
}))
