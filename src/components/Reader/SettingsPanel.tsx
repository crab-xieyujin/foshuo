import React from 'react';
import classNames from 'classnames';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { FontSize } from '../../store/useSettingsStore';
import { X, BookOpen, ScrollText, PlayCircle } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const settings = useSettingsStore();

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-4 w-64 bg-white/95 backdrop-blur shadow-xl rounded-xl border border-zen-accent/30 p-5 z-50 animate-fade-in text-zen-text">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-zen-accent/20 pb-2">
                <h3 className="font-bold text-zen-primary">阅读设置</h3>
                <button onClick={onClose} className="text-zen-secondary hover:text-zen-text">
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-6">

                {/* Reading Mode */}
                <div>
                    <label className="text-xs font-bold text-zen-secondary mb-2 block uppercase tracking-wider">阅读模式</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => settings.setReadingMode('flip')}
                            className={classNames(
                                "flex items-center justify-center space-x-2 py-2 rounded-lg text-sm transition-colors border",
                                settings.readingMode === 'flip'
                                    ? "bg-zen-primary text-white border-zen-primary"
                                    : "bg-white text-zen-text border-zen-accent/50 hover:bg-zen-bg"
                            )}
                        >
                            <BookOpen size={14} />
                            <span>翻页</span>
                        </button>
                        <button
                            onClick={() => settings.setReadingMode('scroll')}
                            className={classNames(
                                "flex items-center justify-center space-x-2 py-2 rounded-lg text-sm transition-colors border",
                                settings.readingMode === 'scroll'
                                    ? "bg-zen-primary text-white border-zen-primary"
                                    : "bg-white text-zen-text border-zen-accent/50 hover:bg-zen-bg"
                            )}
                        >
                            <ScrollText size={14} />
                            <span>滚动</span>
                        </button>
                    </div>
                </div>

                {/* Auto Play Toggle */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                        <PlayCircle size={16} className="mr-2 text-zen-secondary" />
                        自动播放
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoPlay}
                            onChange={(e) => settings.setAutoPlay(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zen-primary"></div>
                    </label>
                </div>


                {/* Font Size */}
                <div>
                    <label className="text-xs font-bold text-zen-secondary mb-2 block uppercase tracking-wider">字号大小</label>
                    <div className="flex items-center justify-between bg-zen-bg/50 rounded-lg p-1 border border-zen-accent/20">
                        {(['small', 'medium', 'large', 'huge'] as FontSize[]).map((size) => (
                            <button
                                key={size}
                                onClick={() => settings.setFontSize(size)}
                                className={classNames(
                                    "flex-1 py-1 text-center rounded text-sm transition-colors",
                                    settings.fontSize === size
                                        ? "bg-white shadow-sm text-zen-primary font-bold"
                                        : "text-zen-secondary hover:text-zen-text"
                                )}
                            >
                                {size === 'small' ? '小' : size === 'medium' ? '中' : size === 'large' ? '大' : '巨'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BGM Volume */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zen-secondary block uppercase tracking-wider">背景禅乐 (Zen Music)</label>
                        <button
                            onClick={() => settings.setBgmEnabled(!settings.bgmEnabled)}
                            className={classNames("text-xs font-bold", settings.bgmEnabled ? "text-zen-primary" : "text-gray-400 line-through")}
                        >
                            {settings.bgmEnabled ? "开启" : "静音"}
                        </button>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.05"
                        disabled={!settings.bgmEnabled}
                        value={settings.bgmVolume}
                        onChange={(e) => settings.setBgmVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zen-accent/50 rounded-lg appearance-none cursor-pointer accent-zen-primary disabled:opacity-50"
                    />
                </div>

            </div>
        </div>
    );
};
