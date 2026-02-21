import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageCircle, Smartphone } from 'lucide-react';
// import versionInfo from '../../../public/version.json'; 

const APP_VERSION = "1.1.0";

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) return;

        setLoading(true);

        // TODO: Replace with Real Supabase Auth
        // Simulating network delay and auto-register logic
        setTimeout(() => {
            const mockUser = {
                id: 'user-' + Date.now(),
                phone: phone,
                nickname: '佛友_' + phone.slice(-4),
                role: 'user' as const
            };
            const mockToken = 'mock-jwt-token';

            login(mockUser, mockToken);
            setLoading(false);
            navigate('/tabs/jingxin');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#fdf8f2] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

            {/* Logo Section */}
            <div className="flex flex-col items-center mb-12 z-10 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-xl flex items-center justify-center mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                    <span className="text-4xl">🪷</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-gray-800 tracking-widest mb-1">佛说</h1>
                <p className="text-xs text-gray-400 font-medium tracking-wider">v{APP_VERSION}</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5 z-10 animate-fade-in-up delay-100">
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="请输入账号 / 手机号"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-amber-100 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 outline-none transition-all placeholder:text-gray-300"
                    />
                    <input
                        type="password"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-amber-100 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 outline-none transition-all placeholder:text-gray-300"
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 px-2">
                    <span className="flex items-center">
                        <input type="checkbox" id="agree" className="mr-1 accent-amber-500" defaultChecked />
                        <label htmlFor="agree">首次登录自动注册</label>
                    </span>
                    <button type="button" className="hover:text-amber-600">忘记密码?</button>
                </div>

                <button
                    type="submit"
                    disabled={loading || !phone || !password}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 disabled:opacity-50 disabled:shadow-none transform active:scale-[0.98] transition-all"
                >
                    {loading ? '正在进入...' : '即刻开启'}
                </button>
            </form>

            {/* Third Party Login */}
            <div className="mt-16 w-full max-w-xs z-10 animate-fade-in-up delay-200">
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-300 text-xs">快速登录</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="flex justify-center gap-8 mt-2">
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-green-500 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                            <MessageCircle size={24} />
                        </div>
                        <span className="text-[10px] text-gray-400">微信</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                            <Smartphone size={24} />
                        </div>
                        <span className="text-[10px] text-gray-400">验证码</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 text-[10px] text-gray-300 text-center">
                登录即代表同意 <span className="text-gray-400 underline">用户协议</span> 和 <span className="text-gray-400 underline">隐私政策</span>
            </div>
        </div>
    );
};
