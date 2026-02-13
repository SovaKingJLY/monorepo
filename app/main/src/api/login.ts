import { http } from "./http";

interface loginRes {
    accessToken: string,
    message?: string,
    role: string,
}
export const loginRequest = async (params: { email: string | null, password: string | null, remember: boolean | null }): Promise<loginRes> => {
    console.log(params);
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

export const loginCheck = async (): Promise<any> => {
    return await http.post('/adminInfo/loginCheck/');
}
