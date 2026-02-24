import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DarkModeState {
    isDark: boolean;
    setDark: (isDark: boolean) => void;
    toggleDark: () => void;
    setDarkWithGlobal: (isDark: boolean) => void;
    toggleDarkWithGlobal: () => void;
}

const useDarkModeStore = create<DarkModeState>()(
    persist(
        (set, get) => ({
            isDark: false,
            setDark: (isDark) => set({ isDark }),
            toggleDark: () => set((state) => ({ isDark: !state.isDark })),
            setDarkWithGlobal: (isDark) => {
                set({ isDark });
            },
            toggleDarkWithGlobal: () => {
                const nextDark = !get().isDark;
                set({ isDark: nextDark });
            },
        }),
        {
            name: 'mainDarkModeStore',
            partialize: (state) => ({ isDark: state.isDark }),
        },
    ),
);

export const darkModeStoreBridge = {
    getState: useDarkModeStore.getState,
    setState: useDarkModeStore.setState,
    subscribe: useDarkModeStore.subscribe,
};

export default useDarkModeStore;

