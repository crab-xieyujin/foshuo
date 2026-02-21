import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Settings, ChevronRight, LogOut, Shield, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';

export const Wode: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { scriptures } = useLibraryStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('确定要退出登录吗？')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            {/* Header / User Card */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 pt-12 pb-8 px-6 text-white rounded-b-[2.5rem] shadow-lg mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-2 border-white/30 shadow-inner overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-white/80" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold font-serif tracking-in-expand">
                                {user?.nickname || '未命名佛友'}
                            </h2>
                            <button
                                onClick={() => navigate('/tabs/wode/settings')}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Edit2 size={16} className="text-white/70" />
                            </button>
                        </div>
                        <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                            {user?.phone || '138****8888'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-around bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono">{user?.merit || 0}</div>
                        <div className="text-xs text-white/60 mt-1">累计功德</div>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono">{scriptures.length}</div>
                        <div className="text-xs text-white/60 mt-1">在读经书</div>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-24">
                {/* Admin Entry (Conditional) */}
                {(user?.role === 'admin' || user?.phone === 'admin') && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 border border-amber-100">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full p-4 flex justify-between items-center active:bg-gray-50 bg-amber-50/50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Shield size={20} />
                                </span>
                                <span className="font-medium text-amber-900">后台管理</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => navigate('/tabs/wode/settings')}
                        className="w-full p-4 flex justify-between items-center border-b border-gray-50 active:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-gray-100 text-gray-500 rounded-lg"><Settings size={20} /></span>
                            <span className="font-medium text-gray-700">个性设置</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>

                    <button onClick={handleLogout} className="w-full p-4 flex justify-between items-center active:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-red-50 text-red-500 rounded-lg"><LogOut size={20} /></span>
                            <span className="font-medium text-red-600">退出登录</span>
                        </div>
                    </button>
                </div>

                <p className="text-center text-xs text-gray-300 mt-8">
                    佛说 Foshuo v1.1.0
                </p>
            </div>
        </div>
    );
};
