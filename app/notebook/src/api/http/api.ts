import axios from "axios";
import { message } from "antd";
import useUserStore from "../../store/user";
import { useAiChatStore } from "../../store/aiChatStore";


export const http = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}`,
    withCredentials: true,//跨域时是否携带cookie
    timeout: 10000,
})

http.interceptors.request.use(config => {//发送时的拦截器,加上token
    const accessTokentoken = useUserStore.getState().accessToken;
    if (accessTokentoken)
        config.headers['Authorization'] = 'Bearer ' + accessTokentoken;
    return config;
});

let isRefreshing = false;
let requests: Function[] = [];

http.interceptors.response.use(//接收时的拦截器
    async (response) => {//网络上没错
        // console.log(response);
        if (response.data.code < 300) {
            return response.data.data;
        }
        // else if (response.data.code == 401) {//当accesstoken过期时
        //     // const config = response.config;
        //     // if (isRefreshing == false) {
        //     //     isRefreshing = true;
        //     //     try {
        //     //         const res = await renewTokenRequest();
        //     //         useUserStore.getState().setAccessToken(res);
        //     //         requests.forEach((cb) => cb(res));//通知每个函数，执行一下
        //     //         // 2. 清空队列
        //     //         requests = [];
        //     //         // 3. 重试当前请求
        //     //         const config = response.config;
        //     //         config.headers['Authorization'] = 'Bearer ' + res;
        //     //         return http(config);
        //     //     } catch (e) {
        //     //         requests.forEach((cb) => cb(null)); // 通知队列里的请求失败
        //     //         requests = [];
        //     //         message.error('登录已过期，请重新登录');
        //     //         useUserStore.getState().logout(); // 假设store里有logout方法
        //     //     } finally {
        //     //         isRefreshing = false;
        //     //     }

        //     // } else {
        //     //     return new Promise((resolve) => {
        //     //         // 我们把一个“回调函数”推入队列
        //     //         requests.push(
        //     //             (token: string) => {
        //     //                 // 这个函数现在不会执行，它只是被存起来了
        //     //                 // 等到将来被调用，并且传入 token 时，它才会执行下面的代码：
        //     //                 config.headers['Authorization'] = 'Bearer ' + token; // 1. 换新票
        //     //                 resolve(http(config)); // 2. 重新发请求，并把结果返回给外面的 Promise
        //     //             }
        //     //         );
        //     //     });
        //     // }
        // }
        else {
            return Promise.reject(response.data.message);
        }
    }, errorInfo => {
        message.error(errorInfo.data);
        return Promise.reject("error");
    }
)






const renewTokenRequest = async (): Promise<string> => {
    return await http.post('/token/renewAccessToken/');
}



// 修改后的前端代码
export const uploadAiChatData = async (chatData: chatData, sessionId: string): Promise<string> => {
    return await http.post('/chat/add/', {
        // 直接发送平铺的数据
        parentId: useAiChatStore.getState().parentId,
        sessionId: sessionId,
        role: chatData.role,
        content: chatData.content,
        reasoningContent: chatData.reasoningContent,
    });
}

export const getUserSessionList = async (): Promise<session[]> => {
    return await http.post("/session/getList/");
}
export const getSessionHistory = async (sessionId: string): Promise<chatData[]> => {
    return await http.post('/session/getHistory/', {
        sessionId: sessionId
    })
}