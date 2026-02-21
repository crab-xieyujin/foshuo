import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import classNames from 'classnames';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export const Wenfo: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: '施主，见字如面。我是您的 AI 佛学助手，有何困惑可与我倾诉。' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const API_KEY = import.meta.env.VITE_KIMI_API_KEY;
        const BASE_URL = 'https://api.moonshot.cn/v1/chat/completions';

        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "moonshot-v1-8k",
                    messages: [
                        {
                            role: "system",
                            content: "你是一位慈悲、智慧的佛教大师，旨在通过佛理引导众生解除内心的困惑。你的回复应当充满禅意、平和且富有洞察力。请用中文回答。"
                        },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: text }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || '网络连接异常，请施主稍后再试');
            }

            const data = await response.json();
            const aiContent = data.choices[0].message.content;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error('Kimi API Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `抱歉施主，刚才瞬间有些“出神”（${error.message || '连接错误'}），请稍后再试。`
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const presetQuestions = [
        "何为内心的平静？",
        "如何面对工作压力？",
        "金刚经的核心是什么？"
    ];

    return (
        <div className="h-full flex flex-col bg-[#f5f5f5]">
            {/* Header */}
            <header className="h-14 bg-white border-b flex items-center justify-center shadow-sm z-10">
                <h1 className="font-serif font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    问佛 AI
                </h1>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={classNames(
                            "flex items-start gap-3 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        {/* Avatar */}
                        <div className={classNames(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                            msg.role === 'user' ? "bg-amber-100 text-amber-600" : "bg-white text-amber-600 border border-amber-100"
                        )}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                        </div>

                        {/* Bubble */}
                        <div className={classNames(
                            "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                            msg.role === 'user'
                                ? "bg-amber-500 text-white rounded-tr-none"
                                : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 mr-auto">
                        <div className="w-8 h-8 rounded-full bg-white border border-amber-100 flex items-center justify-center text-amber-600">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Preset Questions (only show if few messages) */}
            {messages.length < 3 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                    {presetQuestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="flex-shrink-0 px-3 py-1.5 bg-white text-amber-700 text-xs rounded-full border border-amber-100 shadow-sm hover:bg-amber-50 active:scale-95 transition-all whitespace-nowrap"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 pb-safe">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder="请输入你的困惑..."
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
                    />
                    <button
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isLoading}
                        className="p-1.5 bg-amber-500 text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
