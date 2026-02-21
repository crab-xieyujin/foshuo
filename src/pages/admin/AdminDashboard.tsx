import React, { useState, useEffect } from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const {
        scriptures,
        isLoading,
        error,
        fetchScriptures,
        addScripture,
        updateScripture,
        removeScripture
    } = useLibraryStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Initial load from cloud
    useEffect(() => {
        fetchScriptures();
    }, [fetchScriptures]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        content: ''
    });

    const resetForm = () => {
        setFormData({ title: '', author: '', description: '', content: '' });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (scripture: any) => {
        setEditingId(scripture.id);
        setFormData({
            title: scripture.title,
            author: scripture.author || '',
            description: scripture.description,
            content: scripture.content
        });
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('标题和内容不能为空');
            return;
        }

        const dataToSave = {
            ...formData,
        };

        if (editingId) {
            await updateScripture(editingId, dataToSave);
        } else {
            await addScripture({
                id: generateId(),
                ...dataToSave,
                description: formData.description || (formData.content.substring(0, 50) + '...'),
                audioUrl: '/assets/audio/heart-sutra.mp3',
                coverImage: '/assets/images/default-cover.jpg'
            });
        }

        // If no error occurred during save, reset form
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('确定删除这部经文吗？此操作不可恢复且会同步至云端。')) {
            await removeScripture(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/tabs/wode')} className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">经文管理后台</h1>
                    {isLoading && <Loader2 size={18} className="animate-spin text-amber-600" />}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchScriptures()}
                        disabled={isLoading}
                        className="p-2 text-gray-500 hover:text-amber-600 transition-colors disabled:opacity-30"
                        title="刷新数据"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-md active:scale-95"
                        >
                            <Plus size={18} />
                            <span>新增经文</span>
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                        <Info size={16} />
                        同步故障：{error}
                    </div>
                )}

                {isAdding ? (
                    /* Editor Form */
                    <div className="bg-white rounded-xl shadow-lg p-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-lg font-bold text-gray-700">{editingId ? '编辑经文' : '新增经文'}</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1"><X size={24} /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-600">标题</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border-gray-200 border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-800"
                                        placeholder="请输入经文标题"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-600">作者/译者</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full border-gray-200 border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-800"
                                        placeholder="例如：唐三藏法师玄奘 译"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-600">简介</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border-gray-200 border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-800 resize-none"
                                    placeholder="选填，若不填将自动截取正文前50字"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-600">正文内容 (支持 Markdown)</label>
                                <textarea
                                    rows={12}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full border-gray-200 border rounded-lg px-4 py-4 font-mono text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-800 leading-relaxed"
                                    placeholder="请输入经文正文内容..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-8 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold flex items-center gap-2 shadow-lg shadow-amber-900/10 disabled:opacity-70 transition-all active:scale-95"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {editingId ? '保存修改' : '立即发布'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">经文标题</th>
                                    <th className="px-6 py-4 font-bold">作者/译者</th>
                                    <th className="px-6 py-4 font-bold">内容长度</th>
                                    <th className="px-6 py-4 font-bold">存储状态</th>
                                    <th className="px-6 py-4 font-bold text-right">操作管理</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {scriptures.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCw size={32} className="text-gray-200" />
                                                <p className="text-gray-400 text-sm">暂无云端数据，请点击右上角新增</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : scriptures.map((item) => (
                                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-800">{item.title}</div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.id}</div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 text-sm italic">{item.author || <span className="text-gray-300">未知残名</span>}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-gray-500 text-sm font-mono">{item.content ? item.content.length : 0} 字符</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
                                                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                                已同步云端
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="编辑内容"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="永久删除"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {isLoading && scriptures.length === 0 && (
                            <div className="py-20 flex justify-center items-center gap-3 text-gray-400">
                                <Loader2 size={24} className="animate-spin text-amber-600" />
                                <span className="text-sm font-serif italic">正在从灵山拉取数据...</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
