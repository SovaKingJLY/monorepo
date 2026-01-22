import { http } from '@/api/http/api';

interface loginRes {
    accessToken: string,
    message?: string,
    role: string,
}
export const loginRequest = async (params: { email: string, password: string, remember: boolean }): Promise<loginRes> => {
    return await http.post('/admin/login/', params);
}

export const sendCodeAdmin = async (params: { name: string, email: string }): Promise<string> => {
    return await http.post('/admin/sendEmail/', params);
}

export const registerAdmin = async (params: { name: string, password: string, email: string, code: string }): Promise<string> => {
    return await http.post('/admin/register/', params);
}
export const logoutAdmin = async (): Promise<loginRes> => {
    return await http.post('/token/logoutToken/');
}

