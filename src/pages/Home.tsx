import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { LibraryModal } from '../components/Library/LibraryModal';
import type { Scripture } from '../data/scriptures';
import { BookOpen, PlusCircle, Scroll, Trash2, Check } from 'lucide-react';
import classNames from 'classnames';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const setScripture = useAppStore((state) => state.setScripture);
    const { allScriptures, removeScripture } = useLibraryStore();
    const [showLibrary, setShowLibrary] = useState(false);

    // Multi-select state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const all = allScriptures();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleCardClick = (scripture: Scripture) => {
        if (isSelectionMode) {
            toggleSelection(scripture.id);
        } else {
            setScripture(scripture);
            navigate(`/player/${scripture.id}`);
        }
    };

    const handleTouchStart = (id: string) => {
        if (isSelectionMode) return;
        timerRef.current = setTimeout(() => {
            enterSelectionMode(id);
        }, 600); // Long press duration
    };

    const handleTouchEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const enterSelectionMode = (initialId: string) => {
        setIsSelectionMode(true);
        setSelectedIds(new Set([initialId]));
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
            if (newSet.size === 0) setIsSelectionMode(false);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDelete = () => {
        if (window.confirm(`确定要删除选中的 ${selectedIds.size} 部经文吗？`)) {
            selectedIds.forEach(id => removeScripture(id));
            setIsSelectionMode(false);
            setSelectedIds(new Set());
        }
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    return (
        <div className="h-full overflow-y-auto scrollbar-hide bg-[#fdf8f2] relative">
            {/* Header */}
            <header className="px-6 pt-10 pb-6 text-center">
                <div className="inline-block mb-3 text-3xl">🪷</div>
                <h1 className="text-3xl font-serif font-bold text-zen-primary mb-1 tracking-widest">静心诵读</h1>
                <p className="text-sm text-zen-secondary">闻思修，入三摩地</p>
            </header>

            {/* Section Title */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold text-zen-secondary uppercase tracking-wider">
                    {isSelectionMode ? `已选择 ${selectedIds.size} 项` : '我的书架'}
                </h2>
                {isSelectionMode ? (
                    <button onClick={exitSelectionMode} className="text-zen-primary text-sm font-medium">
                        取消
                    </button>
                ) : (
                    <span className="text-xs text-zen-secondary">{all.length} 部经文</span>
                )}
            </div>

            {/* Scripture List */}
            <div className="px-4 space-y-3 pb-24">
                {all.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            onTouchStart={() => handleTouchStart(item.id)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchEnd}
                            onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
                            className={classNames(
                                "group relative bg-white rounded-2xl px-5 py-4 shadow-sm border transition-all cursor-pointer overflow-hidden select-none",
                                isSelectionMode && isSelected
                                    ? "border-zen-primary bg-zen-primary/5 ring-1 ring-zen-primary"
                                    : "border-zen-accent/20 hover:shadow-md hover:border-zen-primary/30"
                            )}
                        >
                            {/* Decorative watermark */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                                <Scroll size={56} className="text-zen-primary" />
                            </div>

                            <div className="flex items-start gap-3">
                                {/* Checkbox overlay for selection mode */}
                                {isSelectionMode && (
                                    <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-zen-primary border-zen-primary' : 'border-gray-300 bg-white'}`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-serif font-semibold text-zen-text group-hover:text-zen-primary transition-colors leading-snug">
                                        {item.title}
                                    </h3>
                                    {item.author && (
                                        <p className="text-xs text-zen-secondary mt-0.5 mb-2">{item.author}</p>
                                    )}
                                    <p className="text-sm text-gray-400 line-clamp-1 mb-3">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center text-zen-primary/70 text-sm font-medium">
                                        <BookOpen size={14} className="mr-1.5" />
                                        <span>开始诵读</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add Button - Hide locally when selecting */}
                {!isSelectionMode && (
                    <button
                        onClick={() => setShowLibrary(true)}
                        className="w-full border-dashed border-2 border-zen-primary/30 rounded-2xl py-5 flex flex-col items-center justify-center gap-2 text-zen-primary/70 hover:bg-zen-primary/5 hover:border-zen-primary/60 transition-all"
                    >
                        <PlusCircle size={28} />
                        <span className="text-sm font-medium">添加经文</span>
                    </button>
                )}
            </div>

            {/* Bottom Action Bar (Selection Mode) */}
            {isSelectionMode && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-zen-accent/20 flex items-center justify-between z-20">
                    <span className="text-sm text-zen-secondary ml-2">长按卡片可多选</span>
                    <button
                        onClick={handleDelete}
                        disabled={selectedIds.size === 0}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-50 text-red-600 font-medium disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                    >
                        <Trash2 size={18} />
                        删除 ({selectedIds.size})
                    </button>
                </div>
            )}

            {/* Library Modal */}
            {showLibrary && <LibraryModal onClose={() => setShowLibrary(false)} />}
        </div>
    );
};
