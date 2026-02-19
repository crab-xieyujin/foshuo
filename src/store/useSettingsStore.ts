import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSize = 'small' | 'medium' | 'large' | 'huge';
export type FontFamily = 'songti' | 'kaiti' | 'heiti';
export type ReadingMode = 'flip' | 'scroll';

interface SettingsState {
    fontSize: FontSize;
    fontFamily: FontFamily;
    readingMode: ReadingMode;
    autoPlay: boolean;
    autoPlaySpeed: number; // seconds per page or pixel speed
    bgmEnabled: boolean;
    bgmVolume: number;

    // Actions
    setFontSize: (size: FontSize) => void;
    setFontFamily: (font: FontFamily) => void;
    setReadingMode: (mode: ReadingMode) => void;
    setAutoPlay: (enabled: boolean) => void;
    setBgmEnabled: (enabled: boolean) => void;
    setBgmVolume: (volume: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            fontSize: 'medium',
            fontFamily: 'songti',
            readingMode: 'flip',
            autoPlay: false,
            autoPlaySpeed: 5, // 5 seconds default
            bgmEnabled: true,
            bgmVolume: 0.3,

            setFontSize: (fontSize) => set({ fontSize }),
            setFontFamily: (fontFamily) => set({ fontFamily }),
            setReadingMode: (readingMode) => set({ readingMode }),
            setAutoPlay: (autoPlay) => set({ autoPlay }),
            setBgmEnabled: (bgmEnabled) => set({ bgmEnabled }),
            setBgmVolume: (bgmVolume) => set({ bgmVolume }),
        }),
        {
            name: 'zen-reader-settings',
        }
    )
);
