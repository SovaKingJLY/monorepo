import http from './http';

export const uploadAiChatData = async (chatData: chatData, sessionId: string, parentId: string | number): Promise<ApiResponse<string>> => {
    return await http.post('/chat/add/', {
        // 直接发送平铺的数据
        parentId: parentId,
        sessionId: sessionId,
        role: chatData.role,
        content: chatData.content,
        reasoningContent: chatData.reasoningContent,
    });
}

export const getUserSessionList = async (): Promise<session[]> => {
    return await http.post("/session/getList/");
}
export const getSessionHistory = async (sessionId: string): Promise<any> => {
    return await http.post('/session/getHistory/', {
        sessionId: sessionId
    })
}