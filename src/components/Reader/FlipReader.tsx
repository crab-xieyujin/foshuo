import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { Scripture } from '../../data/scriptures';
import { BookPage } from './BookPage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import classNames from 'classnames';

interface FlipReaderProps {
    scripture: Scripture;
}

const FONTSIZE_CLASS: Record<string, string> = {
    small: 'text-sm',      // ~14px
    medium: 'text-lg',     // ~18px (Increased from text-base)
    large: 'text-xl',      // ~20px
    huge: 'text-2xl',      // ~24px
};

// Navigation bar height (px) — keep this in sync with the nav div's actual rendered height
const NAV_HEIGHT = 52;

export const FlipReader: React.FC<FlipReaderProps> = ({ scripture }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const settings = useSettingsStore();

    const pages = scripture.pages || [];
    const totalContentPages = pages.length;

    // Force full re-mount when pages change (font resize) to avoid react-pageflip blank page bug
    const bookKey = useMemo(
        () => `book-${totalContentPages}-${settings.fontSize}`,
        [totalContentPages, settings.fontSize]
    );

    const bookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Measured dimensions — initialized to 0, updated by ResizeObserver
    const [bookSize, setBookSize] = useState({ width: 0, height: 0 });

    // Measure the container div so we can pass exact px values to react-pageflip
    const measureContainer = useCallback(() => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
            setBookSize({ width: clientWidth, height: clientHeight });
        }
    }, []);

    useEffect(() => {
        measureContainer();
        const observer = new ResizeObserver(measureContainer);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [measureContainer]);

    const nextFlip = () => bookRef.current?.pageFlip()?.flipNext();
    const prevFlip = () => bookRef.current?.pageFlip()?.flipPrev();

    const totalPages = totalContentPages + 2;

    return (
        // Outer: fills parent (Reader area = h-full), flex column
        <div className="h-full w-full flex flex-col overflow-hidden">

            {/* Book area: flex-1 so it takes all space above the nav bar */}
            <div
                ref={containerRef}
                className="flex-1 w-full overflow-hidden min-h-0"
            >
                {/* Only render book once we know the size */}
                {bookSize.width > 0 && bookSize.height > 0 && (
                    // @ts-ignore
                    <HTMLFlipBook
                        key={bookKey}
                        width={bookSize.width}
                        height={bookSize.height}
                        size="fixed"
                        minWidth={bookSize.width}
                        maxWidth={bookSize.width}
                        minHeight={bookSize.height}
                        maxHeight={bookSize.height}
                        maxShadowOpacity={0.35}
                        showCover={true}
                        mobileScrollSupport={false}
                        ref={bookRef}
                        onFlip={(e: { data: number }) => setCurrentPage(e.data)}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {/* Front Cover */}
                        <BookPage isCover={true}>
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="border-2 border-white/40 px-6 py-10 rounded-lg">
                                    <h1 className="text-2xl font-serif font-bold tracking-widest leading-relaxed writing-vertical-rl text-white drop-shadow">
                                        {scripture.title}
                                    </h1>
                                </div>
                                {scripture.author && (
                                    <p className="mt-8 text-white/70 font-serif writing-vertical-rl text-sm tracking-wider">
                                        {scripture.author}
                                    </p>
                                )}
                            </div>
                        </BookPage>

                        {/* Content Pages */}
                        {pages.map((content, index) => (
                            <BookPage key={`page-${index}`} number={index + 1}>
                                <div className="h-full w-full flex items-center justify-center overflow-hidden">
                                    <div
                                        className={classNames(
                                            'writing-vertical-rl font-serif tracking-wider leading-relaxed text-zen-text h-full pt-4 pb-6 overflow-hidden',
                                            FONTSIZE_CLASS[settings.fontSize]
                                        )}
                                    >
                                        {content}
                                    </div>
                                </div>
                            </BookPage>
                        ))}

                        {/* Back Cover */}
                        <BookPage isCover={true}>
                            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                                <p className="font-serif text-white/70 writing-vertical-rl text-sm tracking-wider">
                                    愿以此功德　庄严佛净土
                                </p>
                                <p className="text-white/40 text-xs">南无阿弥陀佛</p>
                            </div>
                        </BookPage>
                    </HTMLFlipBook>
                )}
            </div>

            {/* Navigation Bar — fixed height, at the very bottom */}
            <div
                className="flex-shrink-0 flex items-center justify-center gap-5 bg-black/25"
                style={{ height: `${NAV_HEIGHT}px` }}
            >
                <button
                    onClick={prevFlip}
                    disabled={currentPage === 0}
                    className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/30 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="font-serif text-sm text-white/70 min-w-[64px] text-center tabular-nums">
                    {currentPage} / {totalPages - 1}
                </span>
                <button
                    onClick={nextFlip}
                    disabled={currentPage >= totalPages - 1}
                    className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/30 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Vertical Writing CSS */}
            <style>{`
                .writing-vertical-rl {
                    writing-mode: vertical-rl;
                    text-orientation: upright;
                }
            `}</style>
        </div>
    );
};
