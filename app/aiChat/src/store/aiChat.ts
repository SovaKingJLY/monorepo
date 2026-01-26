import getStreamData, { type StreamUpdate } from "@/api/aiChat";
import { create } from "zustand";
// 2. 定义单条会话的状态结构 (Single Session State)
// 注意：为了不混淆，这里指代“单个会话的数据”
interface SingleSessionData {
    chatDatas: chatData[];
    session: string;
    id: number;
    isSteamEnd: boolean;
}

// 3. 定义 Store 接口
interface multiChat {
    // --- 状态字段 ---

    // [修改点 1]：改成 Map 结构 (Key 是 sessionId, Value 是会话数据)
    aiChatState: Record<string, SingleSessionData>;

    curSession: string;           // 当前会话 ID
    processList: string[];        // 正在生成的会话 ID 列表
    successList: string[];        // 生成成功的会话 ID 列表

    // --- Actions ---
    getChatDatas: (sessionId: string) => void;
    sendMessage: (prompt: string) => Promise<void>;
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

        // --- Actions ---

        // 重置当前会话
        resetSession: () => set({ curSession: '' }),

        // 切换或初始化会话
        getChatDatas: (sessionId: string) => {
            const { aiChatState } = get();

            // 如果 Map 中还没有这个 Session，初始化一个
            if (!aiChatState[sessionId]) {
                set((state) => ({
                    curSession: sessionId,
                    aiChatState: {
                        ...state.aiChatState,
                        [sessionId]: {
                            session: sessionId,
                            id: Date.now(),
                            chatDatas: [],
                            isSteamEnd: true,
                        }
                    }
                }));
            } else {
                // 如果已有，直接切换 ID 即可
                set({ curSession: sessionId });
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

        // 核心：发送消息并处理流
        sendMessage: async (prompt: string) => {
            const { curSession, processList, aiChatState, addProcessList, deleteProcessList, addSuccessList, getChatDatas } = get();

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

            // 6. 准备发送给 API 的消息（从最新的 State 中取，并去掉最后一个空占位）
            const currentSessionData = get().aiChatState[currentSessionId];
            const apiMessages = currentSessionData.chatDatas.slice(0, -1);

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
                        console.log(update);
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
                () => {
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
                }
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