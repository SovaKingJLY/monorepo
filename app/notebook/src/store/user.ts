import { logoutAdmin, loginRequest } from "@/api/http/admin/adminRequest";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface userStore {
    accessToken: string,
    role: string,
    isLoading: boolean,
    isLogin: boolean,
    setAccessToken: (newToken: string) => void,
    setRole: (newRole: string) => void,
    login: (params: { email: string, password: string, remember: boolean }) => Promise<void>,
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
            login: async (params) => {
                const res = await loginRequest(params);  
                if (params.remember) {
                    set({
                        accessToken: res.accessToken,
                        role: res.role, isLogin: true,
                    });

                } else {
                    // set({ accessToken: res.accessToken });
                }
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