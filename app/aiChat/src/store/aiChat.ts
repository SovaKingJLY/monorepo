import getStreamData, { type StreamUpdate } from "@/api/aiChat";
import { getSessionHistory, uploadAiChatData } from "@/api/session";
import { create } from "zustand";
import { queryClient } from "@/queryClient";
// 2. 定义单条会话的状态结构 (Single Session State)
// 注意：为了不混淆，这里指代“单个会话的数据”
interface SingleSessionData {
    chatDatas: chatData[];
    session: string;
    id: number;
    isSteamEnd: boolean;
    parentId?: number | string; // 记录这一组对话的最后一条消息ID（即下一条消息的 parentId）
}

// 3. 定义 Store 接口
interface multiChat {
    // --- 状态字段 ---

    // [修改点 1]：改成 Map 结构 (Key 是 sessionId, Value 是会话数据)
    aiChatState: Record<string, SingleSessionData>;

    curSession: string;           // 当前会话 ID
    processList: string[];        // 正在生成的会话 ID 列表
    successList: string[];        // 生成成功的会话 ID 列表
    abortControllers: Record<string, AbortController>;

    // --- Actions ---
    getChatDatas: (sessionId: string) => Promise<void>;
    sendMessage: (prompt: string) => Promise<void>;
    stopMessage: () => void;
    addProcessList: (sessionId: string) => void;
    deleteProcessList: (sessionId: string) => void;
    addSuccessList: (sessionId: string) => void;
    deleteSuccessList: (sessionId: string) => void;
    clearCurrentChat: () => void;
    // 重置当前会话ID
    resetSession: () => void;
}

const useAiChatStore = create<multiChat>()((set, get) => {
    return {
        // --- Initial State ---
        aiChatState: {}, // [修改点 2]：初始化为空对象 {}
        curSession: '',
        successList: [],
        processList: [],
        abortControllers: {},

        // --- Actions ---

        // 重置当前会话
        resetSession: () => set({ curSession: '' }),

        // 切换或初始化会话
        getChatDatas: async (sessionId: string) => {
            const { aiChatState } = get();

            // 如果已有，直接切换 ID 即可
            if (aiChatState[sessionId]) {
                set({ curSession: sessionId });
                return;
            }

            // 如果 Map 中还没有这个 Session，先初始化一个空状态
            set((state) => ({
                curSession: sessionId,
                aiChatState: {
                    ...state.aiChatState,
                    [sessionId]: {
                        session: sessionId, // 这个 session 字段其实冗余了，key 已经是 sessionId
                        id: Date.now(),
                        chatDatas: [],
                        isSteamEnd: true,
                        parentId: 0, // 初始化
                    }
                }
            }));

            try {
                // 从 API 获取历史记录
                const res = await getSessionHistory(sessionId);
                // 如果有历史记录，更新 store
                if (res.data && res.data.length > 0) {
                    // 获取最后一条消息的 ID 作为 parentId
                    // 假设返回的数据里每条消息都有 id 字段
                    const lastMsg = res.data[res.data.length - 1] as any;
                    const lastId = lastMsg.id ? lastMsg.id : 0;

                    set((state) => ({
                        aiChatState: {
                            ...state.aiChatState,
                            [sessionId]: {
                                ...state.aiChatState[sessionId],
                                chatDatas: res.data,
                                parentId: lastId
                            }
                        }
                    }));
                }
            } catch (error) {
                console.error("Failed to load session history:", error);
            }
        },

        // 清空当前会话的消息
        clearCurrentChat: () => {
            const { curSession } = get();
            if (!curSession) return;

            set((state) => ({
                aiChatState: {
                    ...state.aiChatState,
                    [curSession]: {
                        ...state.aiChatState[curSession],
                        chatDatas: []
                    }
                }
            }));
        },

        stopMessage: () => {
            const { curSession, abortControllers } = get();
            if (curSession && abortControllers[curSession]) {
                abortControllers[curSession].abort();
                const newControllers = { ...abortControllers };
                delete newControllers[curSession];
                set({ abortControllers: newControllers });
            }
        },

        // 核心：发送消息并处理流
        sendMessage: async (prompt: string) => {
            const { curSession, processList, addProcessList, deleteProcessList, addSuccessList, getChatDatas } = get();

            // 0. 校验 Session ID
            let currentSessionId = curSession;
            if (!currentSessionId) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < 20; i++) {
                    currentSessionId += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                // 初始化这个新 Session
                getChatDatas(currentSessionId);
            }

            // 1. 防止重复提交
            if (processList.includes(currentSessionId)) return;

            // 2. 准备消息
            const userMsg: chatData = { role: "user", content: prompt };
            // 3. 预先加入一个空的 Assistant 消息占位
            const assistantMsgPlaceholder: chatData = { role: "assistant", content: "", reasoningContent: "" };

            // 4. 乐观更新：直接通过 Key 更新 Map
            set((state) => {
                const currentSessionData = state.aiChatState[currentSessionId];
                return {
                    aiChatState: {
                        ...state.aiChatState, // 浅拷贝 Map
                        [currentSessionId]: { // 只覆盖当前 Session
                            ...currentSessionData,
                            chatDatas: [...currentSessionData.chatDatas, userMsg, assistantMsgPlaceholder],
                            isSteamEnd: false,
                        }
                    }
                };
            });

            // 5. 标记为处理中
            addProcessList(currentSessionId);

            // [新增] 上传用户消息
            try {
                const currentSession = get().aiChatState[currentSessionId];
                // 获取当前的 parentId
                const parentId = currentSession.parentId || 0;
                // 调用 API 上传
                await uploadAiChatData(userMsg, currentSessionId, parentId);
                // 通知 sessionList 更新
                queryClient.invalidateQueries({ queryKey: ['sessionList'] });
            } catch (e) {
                console.error("Failed to upload user message", e);
            }

            // 6. 准备发送给 API 的消息（从最新的 State 中取，并去掉最后一个空占位）
            const currentSessionData = get().aiChatState[currentSessionId];
            const apiMessages = currentSessionData.chatDatas.slice(0, -1);

            const controller = new AbortController();
            set((state) => ({
                abortControllers: {
                    ...state.abortControllers,
                    [currentSessionId]: controller
                }
            }));

            // 7. 调用流式请求
            await getStreamData(
                apiMessages,
                // onToken: 收到每个片段时更新 Store
                (update: StreamUpdate) => {
                    set((state) => {
                        // [关键修改]：Map 形式的深层不可变更新
                        const session = state.aiChatState[currentSessionId];
                        if (!session) return state; // 防御性代码
                        // 1. 拷贝消息列表
                        const newChatDatas = [...session.chatDatas];
                        // 2. 找到最后一条（即占位符）
                        const lastIndex = newChatDatas.length - 1;
                        const lastMsg = { ...newChatDatas[lastIndex] };

                        // 3. 增量更新
                        if (update.content) lastMsg.content += update.content;
                        if (update.reasoning) lastMsg.reasoningContent = (lastMsg.reasoningContent || "") + update.reasoning;
                        console.log(update, "这里");
                        // 4. 放回数组
                        newChatDatas[lastIndex] = lastMsg;

                        // 5. 放回 Map
                        return {
                            aiChatState: {
                                ...state.aiChatState,
                                [currentSessionId]: {
                                    ...session,
                                    chatDatas: newChatDatas,
                                }
                            }
                        };
                    });
                },
                // onDone
                async () => {
                    // [新增] 结束时，上传 AI 的完整回复
                    // 获取当前最新状态
                    const finalState = get().aiChatState[currentSessionId];
                    if (finalState) {
                        const allMsgs = finalState.chatDatas;
                        const lastAiMsg = allMsgs[allMsgs.length - 1];
                        // 也就是刚刚生成的这条 AI 消息
                        // 此时 parentId 应该是刚刚用户消息的 ID

                        // 只有当它是 assistant 时才上传 (双重校验)
                        if (lastAiMsg && lastAiMsg.role === 'assistant') {
                            try {
                                // 当前的 parentId 已经是用户消息的 id 了
                                const res = await uploadAiChatData(lastAiMsg, currentSessionId, 0);
                                console.log(res);
                                if (res.code === 200 && res.data) {
                                    set((state) => ({
                                        aiChatState: {
                                            ...state.aiChatState,
                                            [currentSessionId]: {
                                                ...state.aiChatState[currentSessionId],
                                                parentId: res.data
                                            }
                                        }
                                    }));
                                }
                            } catch (e) {
                                console.error("Failed to upload AI message", e);
                            }
                        }
                    }

                    set((state) => ({
                        aiChatState: {
                            ...state.aiChatState,
                            [currentSessionId]: {
                                ...state.aiChatState[currentSessionId],
                                isSteamEnd: true
                            }
                        }
                    }));
                    deleteProcessList(currentSessionId);
                    addSuccessList(currentSessionId);
                    console.log("Stream finished");
                },
                // onError
                (error: any) => {
                    deleteProcessList(currentSessionId);
                    console.error("Stream failed", error);
                },
                controller.signal
            );
        },

        // --- Helper Functions ---

        addProcessList: (sessionId: string) => {
            set((state) => ({
                processList: [...state.processList, sessionId]
            }));
        },

        deleteProcessList: (sessionId: string) => {
            set((state) => ({
                processList: state.processList.filter((id) => id !== sessionId)
            }));
        },

        addSuccessList: (sessionId: string) => {
            set((state) => ({
                successList: [...state.successList, sessionId]
            }));
        },

        deleteSuccessList: (sessionId: string) => {
            set((state) => ({
                successList: state.successList.filter((id) => id !== sessionId)
            }));
        },
    };
});

export default useAiChatStore;