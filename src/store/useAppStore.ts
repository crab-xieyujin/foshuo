import { create } from 'zustand';
import type { Scripture } from '../data/scriptures';

interface AppState {
    currentScripture: Scripture | null;
    isPlaying: boolean;
    volume: number; // 0.0 to 1.0 (Voice)
    bgmVolume: number; // 0.0 to 1.0 (Background)
    currentTime: number; // Current playback time in seconds
    duration: number; // Total duration in seconds

    // Actions
    setScripture: (scripture: Scripture) => void;
    togglePlay: () => void;
    setPlaying: (isPlaying: boolean) => void;
    setVolume: (volume: number) => void;
    setBgmVolume: (volume: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentScripture: null,
    isPlaying: false,
    volume: 0.8,
    bgmVolume: 0.3, // Lower default for background
    currentTime: 0,
    duration: 0,

    setScripture: (scripture) => set({
        currentScripture: scripture,
        currentTime: 0,
        isPlaying: true // Auto play when selected? Maybe.
    }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),
    setBgmVolume: (volume) => set({ bgmVolume: volume }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
}));
