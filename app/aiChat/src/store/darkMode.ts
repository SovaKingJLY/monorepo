import { create } from "zustand";
import { persist } from "zustand/middleware";

type GlobalDarkUpdater = (state: { isDark: boolean }) => unknown;

interface DarkState {
    isDark: boolean,
    globalDarkUpdater?: GlobalDarkUpdater,
    updateDark: () => void,
    setDark: (state: boolean) => void,
    setGlobalDarkUpdater: (updater?: GlobalDarkUpdater) => void,
    updateDarkWithGlobal: () => void,
    setDarkWithGlobal: (state: boolean) => void,
}

const useDarkStore = create<DarkState>()(
    persist(
        (set, get) => ({
            isDark: false,
            globalDarkUpdater: undefined,
            // persist 中间件会自动检测到 isDark 变化并保存
            updateDark: () => set((state) => {
                return { isDark: !state.isDark };
            }),
            setDark: (active) => set({ isDark: active }),
            setGlobalDarkUpdater: (updater) => set({ globalDarkUpdater: updater }),
            updateDarkWithGlobal: () => {
                const nextDark = !get().isDark;
                set({ isDark: nextDark });
                get().globalDarkUpdater?.({ isDark: nextDark });
            },
            setDarkWithGlobal: (active) => {
                set({ isDark: active });
                get().globalDarkUpdater?.({ isDark: active });
            },
        }),
        {
            // 这是 localStorage 里的 Key，所有状态都会存在这里面
            name: "isDarkZustandAichat",
            partialize: (state) => ({ isDark: state.isDark }),
        }
    )
);
export default useDarkStore;
