import React, { forwardRef } from 'react';
import classNames from 'classnames';

interface BookPageProps {
    children: React.ReactNode;
    number?: number;
    className?: string;
    isCover?: boolean;
}

export const BookPage = forwardRef<HTMLDivElement, BookPageProps>((props, ref) => {
    const { children, className, isCover } = props;

    return (
        <div
            className={classNames(
                "h-full bg-[#fdfbf7] shadow-inner border-l border-[#e8e4dc] relative overflow-hidden select-none",
                className,
                {
                    "bg-zen-primary text-white": isCover,
                }
            )}
            ref={ref}
        >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}
            />

            {/* Binding Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10" />

            <div className="h-full w-full px-3 py-2 flex flex-col relative z-0">
                {children}
            </div>

            {props.number && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zen-secondary font-serif">
                    - {props.number} -
                </div>
            )}
        </div>
    );
});

BookPage.displayName = 'BookPage';
