import React from 'react';
import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
    return (
        // Outer viewport: Fixed height 100dvh prevents browser chrome shifting issues
        <div className="h-[100dvh] w-full bg-zen-bg text-zen-text font-sans antialiased flex justify-center overflow-hidden">
            {/* App Shell: Mobile width cap */}
            <div className="w-full max-w-md h-full bg-white/50 shadow-2xl relative flex flex-col overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-zen-accent/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-zen-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                {/* Content Area */}
                <div className="flex-1 w-full h-full overflow-hidden relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
