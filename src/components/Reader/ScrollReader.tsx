import React, { useRef, useEffect, useCallback } from 'react';
import type { Scripture } from '../../data/scriptures';
import { useSettingsStore } from '../../store/useSettingsStore';
import classNames from 'classnames';

interface ScrollReaderProps {
    scripture: Scripture;
}

const FONTSIZE_CLASS: Record<string, string> = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
    huge: 'text-4xl',
};

export const ScrollReader: React.FC<ScrollReaderProps> = ({ scripture }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number | null>(null);
    const settings = useSettingsStore();

    // Auto-scroll logic (teleprompter)
    const startAutoScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const speed = 0.5 + (5 - settings.autoPlaySpeed) * 0.2; // pixels per frame

        const tick = () => {
            if (!scrollRef.current) return;
            scrollRef.current.scrollTop += speed;
            // Stop at bottom
            if (scrollRef.current.scrollTop + scrollRef.current.clientHeight >= scrollRef.current.scrollHeight - 10) {
                stopAutoScroll();
                return;
            }
            animRef.current = requestAnimationFrame(tick);
        };

        animRef.current = requestAnimationFrame(tick);
    }, [settings.autoPlaySpeed]);

    const stopAutoScroll = useCallback(() => {
        if (animRef.current) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (settings.autoPlay) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
        return () => stopAutoScroll();
    }, [settings.autoPlay, startAutoScroll, stopAutoScroll]);

    // Full text content for scroll mode
    const fullText = scripture.content || (scripture.pages || []).join('\n\n');

    return (
        <div className="h-full w-full flex flex-col">
            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Title inside scroll area */}
                <div className="text-center py-6 mb-8 border-b border-white/10 mx-auto max-w-prose">
                    <h1 className="font-serif text-white/90 text-2xl tracking-widest leading-relaxed">
                        {scripture.title}
                    </h1>
                    {scripture.author && (
                        <p className="text-white/40 text-sm mt-3 font-serif tracking-wider">
                            {scripture.author}
                        </p>
                    )}
                </div>

                <div
                    className={classNames(
                        'font-serif tracking-widest leading-loose text-[#f5f0e8] whitespace-pre-wrap text-left mx-auto max-w-prose',
                        FONTSIZE_CLASS[settings.fontSize]
                    )}
                    style={{ lineHeight: '2.2em' }}
                >
                    {/* Content starts immediately after title */}
                    {fullText}

                    {/* Closing spacer */}
                    <div className="h-16" />
                    <div className="text-white/30 text-sm text-center py-4">— 圆满 —</div>
                    <div className="h-24" />
                </div>
            </div>

            {/* Auto-scroll indicator */}
            {settings.autoPlay && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                    🔄 自动滚屏中
                </div>
            )}
        </div>
    );
};
