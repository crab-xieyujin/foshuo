import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scripture } from '../data/scriptures';


interface LibraryState {
    // All scriptures: presets + user imported
    userScriptures: Scripture[];

    // Computed: all available (presets + user)
    allScriptures: () => Scripture[];

    // Actions
    addScripture: (s: Scripture) => void;
    removeScripture: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set, get) => ({
            userScriptures: [],

            // 改为只返回用户添加的经文（不自动包含预设）
            // 如果需要预设经文，请在 LibraryModal 中手动添加到 userScriptures
            allScriptures: () => get().userScriptures,

            addScripture: (s) => set((state) => ({
                userScriptures: [...state.userScriptures.filter(u => u.id !== s.id), s]
            })),

            removeScripture: (id) => set((state) => ({
                userScriptures: state.userScriptures.filter(u => u.id !== id)
            })),
        }),
        {
            name: 'zen-library',
            version: 1, // Bump version to clear old cache with fake content
        }
    )
)