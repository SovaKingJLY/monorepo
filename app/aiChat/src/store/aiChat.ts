import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserSessionList, getSessionHistory } from '@/api/session';

export interface ChatData {
    role: 'system' | 'user' | 'assistant';
    content: string;
    reasoningContent?: string;
}

// Data structure for a single chat session's content
export type SingleRequest = {
    sessionId: string;
    chatData: ChatData[];
};

// Data structure for the session index/list
export interface Session {
    sessionId: string;
    title: string;
    updatedAt: string;
}

interface AiChatState {
    // List of all sessions (the index)
    sessions: Session[];

    // Map storing the content of each session: sessionId -> ChatData[]
    // This allows us to lookup the 'chatData' for a given 'sessionId'
    sessionChatMap: Record<string, ChatData[]>;

    // The currently active session ID
    currentSessionId: string | null;

    // Actions
    setSessions: (sessions: Session[]) => void;
    addSession: (session: Session) => void;
    updateSessionTitle: (sessionId: string, title: string) => void;
    removeSession: (sessionId: string) => void;

    setCurrentSessionId: (sessionId: string | null) => void;

    // Manage chat data for a specific session
    setSessionChatData: (sessionId: string, chatData: ChatData[]) => void;
    addMessageToSession: (sessionId: string, message: ChatData) => void;
    updateLastMessageContent: (sessionId: string, contentDelta: string, reasoningDelta?: string) => void;
    // Async Actions
    fetchSessions: () => Promise<void>;
    fetchSessionMessages: (sessionId: string) => Promise<void>;

    clearStore: () => void;
}

export const useAiChatStore = create<AiChatState>()(
    persist(
        (set, get) => ({
            sessions: [],
            sessionChatMap: {},
            currentSessionId: null,

            setSessions: (sessions) => set({ sessions }),

            addSession: (session) => set((state) => {
                if (state.sessions.some(s => s.sessionId === session.sessionId)) {
                    return state;
                }
                return {
                    sessions: [session, ...state.sessions]
                };
            }),

            updateSessionTitle: (sessionId, title) => set((state) => ({
                sessions: state.sessions.map(s =>
                    s.sessionId === sessionId ? { ...s, title } : s
                )
            })),

            removeSession: (sessionId) => set((state) => {
                const newMap = { ...state.sessionChatMap };
                delete newMap[sessionId];

                return {
                    sessions: state.sessions.filter(s => s.sessionId !== sessionId),
                    sessionChatMap: newMap,
                    currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
                };
            }),

            setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),

            setSessionChatData: (sessionId, chatData) => set((state) => ({
                sessionChatMap: {
                    ...state.sessionChatMap,
                    [sessionId]: chatData
                }
            })),

            addMessageToSession: (sessionId, message) => set((state) => {
                const currentChatData = state.sessionChatMap[sessionId] || [];
                return {
                    sessionChatMap: {
                        ...state.sessionChatMap,
                        [sessionId]: [...currentChatData, message]
                    }
                };
            }),

            updateLastMessageContent: (sessionId, contentDelta, reasoningDelta) => set((state) => {
                const currentChatData = state.sessionChatMap[sessionId] || [];
                if (currentChatData.length === 0) return state;

                const lastMessage = currentChatData[currentChatData.length - 1];
                const updatedLastMessage = {
                    ...lastMessage,
                    content: lastMessage.content + contentDelta,
                    reasoningContent: (lastMessage.reasoningContent || '') + (reasoningDelta || '')
                };

                const newChatData = [...currentChatData.slice(0, -1), updatedLastMessage];

                return {
                    sessionChatMap: {
                        ...state.sessionChatMap,
                        [sessionId]: newChatData
                    }
                };
            }),

            fetchSessions: async () => {
                try {
                    const res = await getUserSessionList();
                    // 兼容后端返回格式：可能是直接的数组，也可能是 { code: 200, data: [...] } 的形式
                    const sessionList = Array.isArray(res) ? res : (res as any).data;

                    if (!Array.isArray(sessionList)) {
                        console.warn('fetchSessions: Expected array but got:', res);
                        return;
                    }

                    // Map backend data to frontend structure if necessary
                    const mappedSessions: Session[] = sessionList.map((s: any) => ({
                        sessionId: s.sessionId,
                        title: s.title || 'Untitled Session',
                        updatedAt: s.updatedAt || new Date().toISOString()
                    }));
                    set({ sessions: mappedSessions });
                } catch (error) {
                    console.error("Failed to fetch sessions:", error);
                }
            },

            fetchSessionMessages: async (sessionId: string) => {
                try {
                    const res = await getSessionHistory(sessionId);
                    // Handle potential wrapped response structure (e.g. { data: [...] })
                    const history = Array.isArray(res) ? res : (res as any).data;

                    if (!Array.isArray(history)) {
                        console.warn('fetchSessionMessages: Expected array but got:', res);
                        return;
                    }

                    // Map backend data to frontend structure if necessary
                    const mappedChatData: ChatData[] = history.map((h: any) => ({
                        role: h.role,
                        content: h.content,
                        reasoningContent: h.reasoningContent
                    }));

                    set((state) => ({
                        sessionChatMap: {
                            ...state.sessionChatMap,
                            [sessionId]: mappedChatData
                        }
                    }));
                } catch (error) {
                    console.error("Failed to fetch session history:", error);
                }
            },

            clearStore: () => set({ sessions: [], sessionChatMap: {}, currentSessionId: null }),
        }),
        {
            name: 'ai-chat-store',
            partialize: (state) => ({
                sessions: state.sessions,
                sessionChatMap: state.sessionChatMap,
                currentSessionId: state.currentSessionId
            }),
        }
    )
);

export default useAiChatStore;
