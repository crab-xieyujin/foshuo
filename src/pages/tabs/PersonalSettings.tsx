import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Music, Palette, Type, Check, Play } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import classNames from 'classnames';

const PRESET_SOUNDS = [
    { name: '木鱼音效 1', path: '/assets/muyu_sound1.m4a' },
    { name: '木鱼音效 2', path: '/assets/muyu_sound2.m4a' },
    { name: '木鱼音效 3', path: '/assets/muyu_sound3.m4a' },
];

const PRESET_COLORS = [
    { name: '禅定黑', value: '#0a0a0a' },
    { name: '深褐木', value: '#1a110a' },
    { name: '静谧蓝', value: '#0a1622' },
    { name: '古寺灰', value: '#222222' },
    { name: '暗红绸', value: '#2a0a0a' },
];

export const PersonalSettings: React.FC = () => {
    const navigate = useNavigate();
    const settings = useSettingsStore();

    // Local state for form
    const [soundPath, setSoundPath] = useState(settings.muyuSoundPath);
    const [bgColor, setBgColor] = useState(settings.muyuBgColor);
    const [floatingText, setFloatingText] = useState(settings.muyuFloatingText);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        settings.setMuyuSoundPath(soundPath);
        settings.setMuyuBgColor(bgColor);
        settings.setMuyuFloatingText(floatingText);

        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            navigate(-1);
        }, 1000);
    };

    const previewSound = (path: string) => {
        const audio = new Audio(path);
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio preview failed", e));
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 pb-safe">
            {/* Header */}
            <header className="h-14 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-gray-800">个性设置</h1>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium shadow-md shadow-amber-200 active:scale-95 transition-all"
                >
                    {isSaved ? <Check size={16} /> : <Save size={16} />}
                    {isSaved ? '已保存' : '保存'}
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* 1. Sound Selection */}
                <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 font-bold border-b pb-3 border-gray-50">
                        <Music size={20} />
                        <h2>木鱼音效控制</h2>
                    </div>
                    <div className="grid gap-3">
                        {PRESET_SOUNDS.map((s) => (
                            <div
                                key={s.path}
                                onClick={() => setSoundPath(s.path)}
                                className={classNames(
                                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                    soundPath === s.path
                                        ? "border-amber-500 bg-amber-50"
                                        : "border-gray-100 hover:border-amber-200"
                                )}
                            >
                                <span className={classNames("text-sm", soundPath === s.path ? "text-amber-700 font-bold" : "text-gray-600")}>
                                    {s.name}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); previewSound(s.path); }}
                                    className="p-2 text-amber-500 hover:bg-white rounded-full transition-colors"
                                >
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Background Color */}
                <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 font-bold border-b pb-3 border-gray-50">
                        <Palette size={20} />
                        <h2>背景渲染色</h2>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-around py-2">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setBgColor(c.value)}
                                className={classNames(
                                    "w-12 h-12 rounded-full border-4 transition-all relative",
                                    bgColor === c.value ? "border-amber-400 scale-110 shadow-lg" : "border-transparent"
                                )}
                                style={{ backgroundColor: c.value }}
                            >
                                {bgColor === c.value && <div className="absolute inset-0 flex items-center justify-center text-white"><Check size={20} /></div>}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
                        当前选中色值: {bgColor}
                    </p>
                </section>

                {/* 3. Custom Floating Text */}
                <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 font-bold border-b pb-3 border-gray-50">
                        <Type size={20} />
                        <h2>飘字文案自定义</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={floatingText}
                                onChange={(e) => setFloatingText(e.target.value)}
                                placeholder="输入想要显示的文字..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                                maxLength={10}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                {floatingText.length}/10
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['功德+1', '福报+1', '财富+1', '运气+1', '烦恼-1'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFloatingText(t)}
                                    className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full hover:bg-amber-100 hover:text-amber-600 transition-colors"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <p className="text-center text-gray-300 text-[10px] py-4">
                    心无挂碍，意随心动
                </p>
            </div>
        </div>
    );
};
