import React, { useState, useEffect } from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2, RefreshCw, Info, AppWindow, Package, Upload, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
    const [activeTab, setActiveTab] = useState<'scriptures' | 'updates'>('scriptures');

    // Update Management State
    const [isUploading, setIsUploading] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        version: '',
        build: '',
        releaseNotes: '',
        downloadUrl: ''
    });

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

    const handleSaveUpdate = async () => {
        if (!updateForm.version || !updateForm.build || !updateForm.downloadUrl) {
            alert('版本、Build号及下载链接不能为空');
            return;
        }

        try {
            setIsUploading(true);
            const { error } = await supabase
                .from('app_versions')
                .insert([{
                    version: updateForm.version,
                    build: parseInt(updateForm.build),
                    release_notes: updateForm.releaseNotes,
                    download_url: updateForm.downloadUrl
                }]);

            if (error) throw error;
            alert('发版成功！老用户将收到更新提示。');
            setUpdateForm({ version: '', build: '', releaseNotes: '', downloadUrl: '' });
        } catch (err: any) {
            alert('发版失败: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.apk')) {
            alert('请上传 .apk 格式的文件');
            return;
        }

        try {
            setIsUploading(true);
            // 1. Upload to Supabase Storage
            const fileName = `foshuo_${Date.now()}.apk`;
            const { data, error } = await supabase.storage
                .from('apks')
                .upload(fileName, file);

            if (error) {
                console.error("Upload error:", error);
                throw error;
            }

            // 2. Get Public URL
            const { data: urlData } = supabase.storage
                .from('apks')
                .getPublicUrl(fileName);

            setUpdateForm(prev => ({ ...prev, downloadUrl: urlData.publicUrl }));

            // Suggest version/build based on date
            const now = new Date();
            const yearMonth = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            setUpdateForm(prev => ({
                ...prev,
                version: prev.version || `1.0.${now.getDate()}`,
                build: prev.build || `${yearMonth}${now.getDate()}`
            }));

        } catch (err: any) {
            alert('上传失败: ' + (err.message || '未知错误'));
        } finally {
            setIsUploading(false);
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

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => { setActiveTab('scriptures'); setIsAdding(false); }}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scriptures' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Package size={16} />
                        经文管理
                    </button>
                    <button
                        onClick={() => { setActiveTab('updates'); setIsAdding(false); }}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'updates' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <AppWindow size={16} />
                        版本发版
                    </button>
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
                ) : activeTab === 'updates' ? (
                    /* Update Management Tab */
                    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-2 font-serif">一键发布新版本</h2>
                                <p className="text-amber-50/80 text-sm">上传 APK 后，系统将自动生成下载链接并通知所有在线用户。</p>
                            </div>
                            <AppWindow size={120} className="absolute -right-8 -bottom-8 text-white/10 rotate-12" />
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                            {/* Step 1: Upload APK */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">1</div>
                                    上传安装包 (APK)
                                </label>

                                <div className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${updateForm.downloadUrl ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'}`}>
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={40} className="animate-spin text-amber-600" />
                                            <p className="text-sm text-gray-500 font-medium">正在上传安装包，请稍候...</p>
                                        </div>
                                    ) : updateForm.downloadUrl ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-green-700">APK 上传成功！</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-mono break-all max-w-xs">{updateForm.downloadUrl}</p>
                                            </div>
                                            <button
                                                onClick={() => setUpdateForm(prev => ({ ...prev, downloadUrl: '' }))}
                                                className="text-xs text-gray-400 hover:text-red-500 underline"
                                            >
                                                重新上传
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-500 transition-colors">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">点击或拖拽 APK 文件到此处</p>
                                                <p className="text-xs text-gray-400 mt-1">支持 .apk 格式</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".apk"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Version Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">2</div>
                                        版本号 (Version)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="例如: 1.0.5"
                                        value={updateForm.version}
                                        onChange={e => setUpdateForm({ ...updateForm, version: e.target.value })}
                                        className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">3</div>
                                        编译号 (Build)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="必须递增，例如: 105"
                                        value={updateForm.build}
                                        onChange={e => setUpdateForm({ ...updateForm, build: e.target.value })}
                                        className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-mono"
                                    />
                                </div>
                            </div>

                            {/* Step 3: Release Notes */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">4</div>
                                    更新说明
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="请输入本次更新的具体内容..."
                                    value={updateForm.releaseNotes}
                                    onChange={e => setUpdateForm({ ...updateForm, releaseNotes: e.target.value })}
                                    className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSaveUpdate}
                                disabled={isUploading || !updateForm.downloadUrl}
                                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/10 transition-all active:scale-[0.98]"
                            >
                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Package size={20} />}
                                立即同步全平台更新
                            </button>
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
