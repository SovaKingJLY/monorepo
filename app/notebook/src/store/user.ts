import { create } from "zustand";
import { persist } from "zustand/middleware";

interface userStore {
    accessToken: string,//refreshToken在cookie中
    role: string,
    isLoading: boolean,
    setAccessToken: (newToken: string) => void,
    setRole: (newRole: string) => void,
    logout: () => void,
    setIsLoading: (newState: boolean) => void
}

const useUserStore = create<userStore>()(
    persist(((set) => {
        return {
            accessToken: "",
            role: "",
            isLoading: true,
            setAccessToken: (newToken: string) => {
                set({ accessToken: newToken, });
            },
            setRole: (newRole: string) => {
                set({ role: newRole });
            },
            logout: () => {
                set({ accessToken: "", role: "" });
            },
            setIsLoading: (newState: boolean) => {
                set({ isLoading: newState });
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