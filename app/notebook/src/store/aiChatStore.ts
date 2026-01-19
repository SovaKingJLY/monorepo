import { create } from "zustand";
import getStreamData from "../api/http/aiChat";
import { uploadAiChatData } from "../api/http/api";

type singleRequest = {
    chatData: chatData[]; // 这里的 chatData 应该是一个数组属性
    sessionId: string;
};
interface nowChat {
    replyBuffer: {
        role: 'assistant',
        content: string,
        reasoningContent: string
    },
    requestList: singleRequest[],
    processingList: string[],
    successList: string[],
    isStream: string,
    sessionId: string,
    parentId: number,
    init: () => string,
    newQuery: (sessionId: string) => void,
    getReply: (history: chatData[], sessionId: string, streamEnd: (sessionId: string) => void) => void,
    resetParentId: () => void,
    increaseParentId: () => void,
    setSessionId: (sessionId: string) => void,
    setParentId: (parentId: number) => void,
}

const send = (history: chatData[], sessionId: string, streamEnd: (sessionId: string) => void) => {
    // 重置 Ref 和当前流状态
    getStreamData(
        history,
        (token: any) => {
            // --- 更新逻辑 ---
            // 更新 Ref (用于逻辑真值)

            useAiChatStore.setState((state) => {
                const newBuffer = { ...state.replyBuffer };
                // 你的逻辑：content为空时是思考过程(reasoning)，否则是正文
                // 注意：请确保你的API返回结构真的是这样。通常 reasoning 在 token.reasoning 字段。
                if (token.content === '' || !token.content) {
                    newBuffer.reasoningContent += (token.reasoning || '');
                } else {
                    newBuffer.content += (token.content || '');
                }
                return { replyBuffer: newBuffer };
            });
            // 更新 State (用于触发 UI 渲染)
            // 注意：这里直接用 Ref 的值更新 State，避免了复杂的 prev 计算
        },
        async () => {
            await uploadAiChatData(useAiChatStore.getState().replyBuffer, useAiChatStore.getState().isStream);
            useAiChatStore.setState((state) => ({ successList: [...state.successList, sessionId] }));//返回完后添加到successList
            useAiChatStore.setState((state) => ({
                replyBuffer: {
                    role: 'assistant',
                    content: '',
                    reasoningContent: ''
                },
                isStream: "",
                requestList: state.requestList.slice(1)
            }));
            streamEnd(sessionId);
            // --- 成功回调 ---
            // 关键修复：从 Ref 中读取最终结果，而不是从 stale 的 state 中读取
            // setChatDatas(prev => [...prev, finalReply]);
            // await uploadAiChatData(finalReply);
        },
        (err: any) => {
            console.error("❌ 发生错误:", err);
        }
    );
};

export const useAiChatStore = create<nowChat>((set) => ({
    replyBuffer: {
        role: 'assistant',
        content: "",
        reasoningContent: "",
    },//在加入返回元素时是加入到这里
    requestList: [],//消息队列，页面中监听，如果变化了就取出一个发送消息
    processingList: [],
    successList: [],
    isStream: '',//sessionId,为哪个sessionId哪个就接受/从store中搬出数据,现在正在流式传输的会话
    replyList: [],
    sessionId: '',//当前的会话id
    parentId: 0,
    init: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 20; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        set({ sessionId: result, parentId: 0 });
        return result;
    },
    newQuery: (sessionId: string) => {
        set((state) => ({ successList: state.successList.filter((item) => item != sessionId) }));//先从成功中去除
        set((state) => ({ processingList: [...state.processingList, sessionId] }));//添加到处理中
    },
    getReply: (history: chatData[], sessionId: string, streamEnd) => {
        set(() => ({ isStream: sessionId }));
        send(history, sessionId, streamEnd);

    },

    increaseParentId: () => set((state) => ({ parentId: state.parentId + 1 })),
    resetParentId: () => set({ parentId: 0 }),
    setSessionId: (i) => set({ sessionId: i }),
    setParentId: (i) => set({ parentId: i }),
}))