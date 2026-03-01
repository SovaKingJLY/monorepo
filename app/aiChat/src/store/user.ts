import { loginCheck, logoutAdmin } from "@/api/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface userStore {
    accessToken: string,//refreshToken在cookie中
    role: string,
    isLoading: boolean,
    isLogin: boolean,
    setAccessToken: (newToken: string) => void,
    setRole: (newRole: string) => void,
    logout: () => void,
    setIsLoading: (newState: boolean) => void,
    setIsLogin: (newState: boolean) => void,
    checkLogin: () => Promise<void>;
}

const useUserStore = create<userStore>()(
    persist(((set) => {
        return {
            accessToken: "",
            role: "",
            isLoading: true,
            isLogin: false,
            setAccessToken: (newToken: string) => {
                set({ accessToken: newToken, });
            },
            checkLogin: async () => {
                set({ isLoading: true });
                try {
                    await loginCheck();
                    set({ isLogin: true });
                    console.log("aichat自动登录");
                } catch (error) {
                    set({ isLogin: false });
                } finally {
                    set({ isLoading: false });
                }
            },
            setRole: (newRole: string) => {
                set({ role: newRole });
            },
            logout: async () => {
                set({ accessToken: "", role: "", isLogin: false });
                console.log("注销");
                await logoutAdmin();
            },
            setIsLoading: (newState: boolean) => {
                set({ isLoading: newState });
            },
            setIsLogin: (newState: boolean) => {
                set({ isLogin: newState });
            }
        }
    }), {
        name: "userStore",
        partialize: (state) => {
            return {
                accessToken: state.accessToken,
            }
        }


    })
)

export default useUserStore;