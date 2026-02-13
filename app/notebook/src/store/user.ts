import { logoutAdmin } from "@/api/http/admin/adminRequest";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface userStore {
    accessToken: string,
    role: string,
    isLoading: boolean,
    isLogin: boolean,
    setAccessToken: (newToken: string) => void,
    setRole: (newRole: string) => void,
    logout: () => void,
    setIsLoading: (newState: boolean) => void
    setIsLogin: (newState: boolean) => void,
}

const useUserStore = create<userStore>()(
    persist(((set) => {
        return {
            accessToken: "",
            role: "",
            isLogin: false,
            isLoading: true,
            setAccessToken: (newToken: string) => {
                set({ accessToken: newToken, });
            },
            setRole: (newRole: string) => {
                set({ role: newRole });
            },
            logout: async () => {
                set({ accessToken: "", role: "", isLogin: false });
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