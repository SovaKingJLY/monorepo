import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DarkState {
    isDark: boolean,
    updateDark: () => void,
    setDark: (state: boolean) => void
}

const useDarkStore = create<DarkState>()(
    persist(
        (set) => ({
            isDark: false,
            // persist 中间件会自动检测到 isDark 变化并保存
            updateDark: () => set((state) => {
                return { isDark: !state.isDark };
            }),
            setDark: (active) => set({ isDark: active }),
        }),
        {
            // 这是 localStorage 里的 Key，所有状态都会存在这里面
            name: "isDarkZustand",
        }
    )
);
export default useDarkStore;
