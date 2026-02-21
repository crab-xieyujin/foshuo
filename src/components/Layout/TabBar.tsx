import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Activity, MessageCircle, ShoppingBag, User } from 'lucide-react';
import classNames from 'classnames';

export const TabBar: React.FC = () => {
    const navItems = [
        { path: '/tabs/jingxin', label: '静心', icon: BookOpen },
        { path: '/tabs/xiuxing', label: '修行', icon: Activity },
        { path: '/tabs/wenfo', label: '问佛', icon: MessageCircle, isCenter: true },
        { path: '/tabs/jieyuan', label: '结缘', icon: ShoppingBag },
        { path: '/tabs/wode', label: '我的', icon: User },
    ];

    return (
        <div className="relative bg-white border-t border-gray-100 pb-safe z-50 flex-shrink-0">
            <div className="flex justify-around items-end h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => classNames(
                            "flex flex-col items-center justify-center w-full h-full transition-colors relative",
                            isActive ? "text-amber-600" : "text-gray-400 hover:text-gray-500",
                            item.isCenter ? "-mt-8" : ""
                        )}
                    >
                        {({ isActive }) => item.isCenter ? (
                            // Center Button (Wenfo)
                            <div className="flex flex-col items-center">
                                <div className={classNames(
                                    "w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white transform transition-all duration-300 active:scale-95",
                                    isActive
                                        ? "bg-amber-500 text-white shadow-amber-200"
                                        : "bg-gray-100 text-gray-400 border-gray-50 shadow-none scale-90 opacity-80"
                                )}>
                                    <item.icon size={24} className={isActive ? "mb-0.5" : ""} />
                                    <span className="text-[10px] font-bold leading-none mt-1">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Normal Buttons
                            <>
                                <item.icon size={24} strokeWidth={2} />
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};
