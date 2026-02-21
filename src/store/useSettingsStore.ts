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
    muyuSoundEnabled: boolean;
    muyuSoundPath: string; // Path to sound file
    muyuBgColor: string;   // Background hex or class
    muyuFloatingText: string; // Custom text like "功德+1"

    // Actions
    setFontSize: (size: FontSize) => void;
    setFontFamily: (font: FontFamily) => void;
    setReadingMode: (mode: ReadingMode) => void;
    setAutoPlay: (enabled: boolean) => void;
    setBgmEnabled: (enabled: boolean) => void;
    setBgmVolume: (volume: number) => void;
    setMuyuSoundEnabled: (enabled: boolean) => void;
    setMuyuSoundPath: (path: string) => void;
    setMuyuBgColor: (color: string) => void;
    setMuyuFloatingText: (text: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            fontSize: 'medium',
            fontFamily: 'songti',
            readingMode: 'flip',
            autoPlay: false,
            autoPlaySpeed: 5,
            bgmEnabled: true,
            bgmVolume: 0.3,
            muyuSoundEnabled: true,
            muyuSoundPath: '/assets/muyu_sound1.m4a', // Default to first new file
            muyuBgColor: '#0a0a0a',                // Default to dark
            muyuFloatingText: '功德+1',           // Default text

            setFontSize: (fontSize) => set({ fontSize }),
            setFontFamily: (fontFamily) => set({ fontFamily }),
            setReadingMode: (readingMode) => set({ readingMode }),
            setAutoPlay: (autoPlay) => set({ autoPlay }),
            setBgmEnabled: (bgmEnabled) => set({ bgmEnabled }),
            setBgmVolume: (bgmVolume) => set({ bgmVolume }),
            setMuyuSoundEnabled: (muyuSoundEnabled) => set({ muyuSoundEnabled }),
            setMuyuSoundPath: (muyuSoundPath) => set({ muyuSoundPath }),
            setMuyuBgColor: (muyuBgColor) => set({ muyuBgColor }),
            setMuyuFloatingText: (muyuFloatingText) => set({ muyuFloatingText }),
        }),
        {
            name: 'zen-reader-settings',
        }
    )
);
