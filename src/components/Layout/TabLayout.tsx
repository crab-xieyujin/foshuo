import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export const TabLayout: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-hidden relative">
                <Outlet />
            </div>
            <TabBar />
        </div>
    );
};
