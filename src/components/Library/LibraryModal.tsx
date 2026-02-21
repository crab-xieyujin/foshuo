import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useAppStore } from '../../store/useAppStore';
import type { Scripture } from '../../data/scriptures';
import { scriptures as PRESETS } from '../../data/scriptures';
import { paginateText } from '../../utils/pagination';
import { useSettingsStore } from '../../store/useSettingsStore';
import { X, Upload, BookOpen, Plus, Trash2 } from 'lucide-react';

interface LibraryModalProps {
    onClose: () => void;
}

// Preset store - Use imported scriptures as the source of truth
const PRESET_STORE = PRESETS;

export const LibraryModal: React.FC<LibraryModalProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { addScripture, removeScripture, scriptures } = useLibraryStore();
    const { setScripture: setCurrentScripture } = useAppStore();
    const settings = useSettingsStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState<'store' | 'local'>('store');
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    // 已在书架中的 id 集合（用于预设书库的已添加状态）
    const userIds = new Set(scriptures.map(s => s.id));
    // 用户上传的经文（id 以 user- 开头）
    const userUploaded = scriptures.filter(s => s.id.startsWith('user-'));


    const handlePresetAdd = (preset: typeof PRESET_STORE[0]) => {
        // Use the actual content from the imported scripture
        const content = preset.content;

        const scripture: Scripture = {
            id: preset.id,
            title: preset.title,
            author: preset.author,
            description: preset.description,
            audioUrl: '/assets/audio/heart-sutra.mp3',
            content,
            pages: paginateText(content, settings.fontSize),
        };
        addScripture(scripture);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.txt')) {
            setUploadStatus('❌ 仅支持 .txt 文本文件');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setUploadStatus('❌ 文件不能超过 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            const title = file.name.replace(/\.txt$/, '');
            const id = `user-${Date.now()}`;
            const pages = paginateText(content, settings.fontSize);

            const scripture: Scripture = {
                id,
                title,
                description: content.substring(0, 50) + '…',
                audioUrl: '/assets/audio/heart-sutra.mp3',
                content,
                pages,
            };
            addScripture(scripture);
            setUploadStatus(`✅ 《${title}》已添加到书架（${pages.length} 页）`);
        };
        reader.readAsText(file, 'utf-8');
    };

    const handleOpen = (s: Scripture) => {
        setCurrentScripture(s);
        navigate(`/player/${s.id}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="absolute bottom-0 left-0 right-0 bg-[#fdf9f4] rounded-t-2xl shadow-2xl"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="w-12 h-1 bg-zen-accent/40 rounded-full mx-auto mt-3 mb-1" />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-zen-accent/20">
                    <h2 className="text-lg font-serif font-bold text-zen-primary">经文书库</h2>
                    <button onClick={onClose} className="text-zen-secondary hover:text-zen-text">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zen-accent/20">
                    <button
                        onClick={() => setTab('store')}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'store' ? 'text-zen-primary border-b-2 border-zen-primary' : 'text-zen-secondary'}`}
                    >
                        📚 经文书库
                    </button>
                    <button
                        onClick={() => setTab('local')}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'local' ? 'text-zen-primary border-b-2 border-zen-primary' : 'text-zen-secondary'}`}
                    >
                        📁 上传本地文件
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>

                    {/* === Store Tab === */}
                    {tab === 'store' && (
                        <div className="p-4 space-y-3">
                            {PRESET_STORE.map(preset => {
                                const isOwned = userIds.has(preset.id);
                                return (
                                    <div key={preset.id} className="bg-white rounded-xl p-4 shadow-sm border border-zen-accent/20 flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-serif font-semibold text-zen-text text-sm truncate">{preset.title}</h3>
                                            <p className="text-xs text-zen-secondary mt-0.5">{preset.author} · {preset.size || `${preset.content.length}字`}</p>
                                        </div>
                                        {isOwned ? (
                                            <button
                                                onClick={() => {
                                                    const s = scriptures.find(p => p.id === preset.id);
                                                    if (s) handleOpen(s);
                                                }}
                                                className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full"
                                            >
                                                <BookOpen size={12} /> 阅读
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePresetAdd(preset)}
                                                className="flex items-center gap-1 text-xs text-white bg-zen-primary px-3 py-1.5 rounded-full hover:bg-zen-primary/90"
                                            >
                                                <Plus size={12} /> 添加
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* === Local Upload Tab === */}
                    {tab === 'local' && (
                        <div className="p-5 space-y-4">
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-dashed border-2 border-zen-accent/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zen-accent/5 transition-colors"
                            >
                                <Upload size={32} className="text-zen-primary/60" />
                                <div className="text-center">
                                    <p className="font-medium text-zen-text">点击选择 TXT 文件</p>
                                    <p className="text-xs text-zen-secondary mt-1">支持 UTF-8 编码，最大 2MB</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            {uploadStatus && (
                                <div className="text-sm text-zen-text bg-white rounded-lg px-4 py-3 border border-zen-accent/20">
                                    {uploadStatus}
                                </div>
                            )}

                            {/* User Scriptures List */}
                            {userUploaded.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-zen-secondary uppercase tracking-wider mb-2">已导入经文</h3>
                                    <div className="space-y-2">
                                        {userUploaded.map((u: Scripture) => (
                                            <div key={u.id} className="bg-white rounded-xl p-3 shadow-sm border border-zen-accent/20 flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-serif text-sm font-medium text-zen-text truncate">{u.title}</p>
                                                    <p className="text-xs text-zen-secondary mt-0.5">{u.pages?.length ?? 0} 页</p>
                                                </div>
                                                <button
                                                    onClick={() => handleOpen(u)}
                                                    className="text-xs text-zen-primary bg-zen-bg px-2 py-1 rounded-full"
                                                >
                                                    <BookOpen size={12} />
                                                </button>
                                                <button
                                                    onClick={() => removeScripture(u.id)}
                                                    className="text-xs text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-zen-secondary/60 text-center pb-4">
                                导入的经文仅保存在您的设备上，不会上传至任何服务器。
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
