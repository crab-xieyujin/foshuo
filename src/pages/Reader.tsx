import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactHowler from 'react-howler';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { scriptures } from '../data/scriptures';
import { FlipReader } from '../components/Reader/FlipReader';
import { ScrollReader } from '../components/Reader/ScrollReader';
import { SettingsPanel } from '../components/Reader/SettingsPanel';
import { paginateText } from '../utils/pagination';
import { ArrowLeft, Settings, Music, VolumeX } from 'lucide-react';

export const Reader: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { currentScripture, setScripture } = useAppStore();
    const settings = useSettingsStore();

    const [showSettings, setShowSettings] = useState(false);

    // Load scripture on mount / id change
    useEffect(() => {
        if (!currentScripture || currentScripture.id !== id) {
            const found = scriptures.find(s => s.id === id);
            if (found) {
                setScripture(found);
            } else {
                navigate('/');
            }
        }
    }, [id, currentScripture, setScripture, navigate]);

    // Dynamic Pagination (only for flip mode, scroll mode uses raw content)
    const paginatedScripture = useMemo(() => {
        if (!currentScripture) return null;
        if (currentScripture.content) {
            const pages = paginateText(currentScripture.content, settings.fontSize);
            return { ...currentScripture, pages };
        }
        return currentScripture;
    }, [currentScripture, settings.fontSize]);

    if (!paginatedScripture) return null;

    return (
        <div className="h-full flex flex-col relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #3e2723 0%, #5d4037 50%, #3e2723 100%)' }}>

            {/* Background Audio */}
            <ReactHowler
                src={paginatedScripture.audioUrl}
                playing={settings.bgmEnabled}
                volume={settings.bgmVolume}
                loop={true}
                html5={true}
            />

            {/* ── Header ── */}
            <header className="relative z-30 flex items-center justify-between px-5 py-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>

                {/* Title */}
                <h2 className="font-serif text-white/80 text-sm tracking-widest truncate mx-3 flex-1 text-center">
                    {paginatedScripture.title}
                </h2>

                {/* Right Controls */}
                <div className="flex items-center space-x-2">
                    {/* BGM toggle */}
                    <button
                        onClick={() => settings.setBgmEnabled(!settings.bgmEnabled)}
                        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${settings.bgmEnabled
                            ? 'bg-white/25 text-white'
                            : 'bg-white/10 text-white/40'
                            }`}
                    >
                        {settings.bgmEnabled ? <Music size={17} /> : <VolumeX size={17} />}
                    </button>

                    {/* Settings toggle */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${showSettings
                            ? 'bg-amber-400/80 text-[#3e2723]'
                            : 'bg-white/15 text-white hover:bg-white/30'
                            }`}
                    >
                        <Settings size={17} />
                    </button>
                </div>
            </header>

            {/* Settings Panel */}
            {showSettings && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSettings(false)}
                    />
                    <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
                </>
            )}

            {/* ── Reader Area ── */}
            <div className="flex-1 overflow-hidden relative">
                {settings.readingMode === 'flip' ? (
                    <FlipReader scripture={paginatedScripture} />
                ) : (
                    <ScrollReader scripture={paginatedScripture} />
                )}
            </div>
        </div>
    );
};
