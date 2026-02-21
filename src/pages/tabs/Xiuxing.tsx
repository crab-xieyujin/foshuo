import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Volume2, VolumeX, Info } from 'lucide-react';
import classNames from 'classnames';

// Assets config - Defaults, user can customize via Settings
const ASSETS_BASE = {
    MUYU_IMAGE: '/assets/muyu.png',
    MALLET_IMAGE: '/assets/mallet.png',
};

export const Xiuxing: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const {
        muyuSoundEnabled, setMuyuSoundEnabled,
        muyuSoundPath, muyuBgColor, muyuFloatingText
    } = useSettingsStore();

    const [isKnocking, setIsKnocking] = useState(false);
    const [ripples, setRipples] = useState<{ id: number }[]>([]);
    const lastInteractionTime = useRef<number>(0);
    const [isSoundLoading, setIsSoundLoading] = useState(false);

    // Audio Buffer and Context refs for high-stability playback
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);

    // Track asset load errors
    const [assetErrors, setAssetErrors] = useState({
        muyu: false,
        mallet: false,
        sound: false
    });

    // Initialize/Update Audio and Preload Sound whenever muyuSoundPath changes
    useEffect(() => {
        const initAudio = async () => {
            if (!muyuSoundPath || !muyuSoundEnabled) return;

            try {
                const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new AudioContextClass();
                }

                // Reset states for new sound load
                setIsSoundLoading(true);
                audioBufferRef.current = null;
                setAssetErrors(prev => ({ ...prev, sound: false }));

                // Prefetch and Decode current configured sound
                // Using a timestamp to ensure we get the latest file if path is the same but content changed
                const response = await fetch(`${muyuSoundPath}?v=${Date.now()}`);
                if (!response.ok) throw new Error('Sound file not found');

                const arrayBuffer = await response.arrayBuffer();
                const decodedData = await audioContextRef.current!.decodeAudioData(arrayBuffer);

                audioBufferRef.current = decodedData;
                setIsSoundLoading(false);
            } catch (error) {
                console.warn("External sound load failed, using procedural fallback.", error);
                setAssetErrors(prev => ({ ...prev, sound: true }));
                setIsSoundLoading(false);
            }
        };

        initAudio();
    }, [muyuSoundPath, muyuSoundEnabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Procedural clack (Absolute fallback)
    const playProceduralSound = (ctx: AudioContext) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    };

    const playSound = () => {
        if (!muyuSoundEnabled || !audioContextRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // If sound is ready and no errors, play the buffer
        if (audioBufferRef.current && !assetErrors.sound && !isSoundLoading) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.connect(audioContextRef.current.destination);
            source.start(0);
        } else {
            // Otherwise, play the procedural fallback so it never feels "broken"
            playProceduralSound(audioContextRef.current);
        }
    };

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        const now = Date.now();
        if (now - lastInteractionTime.current < 300) return;
        lastInteractionTime.current = now;

        if (e.cancelable) e.preventDefault();
        if (isKnocking) return;

        setIsKnocking(true);
        playSound();

        updateUser({ merit: (user?.merit || 0) + 1 });
        setTimeout(() => setIsKnocking(false), 200);

        const id = Date.now();
        setRipples(prev => [...prev, { id }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 1000);
    };

    const getDisplayTitle = () => {
        // Try to extract keywords like "功德", "财富", "福报" from custom text
        const match = muyuFloatingText.match(/^([^\+\-\d\s]+)/);
        const keyword = match ? match[1] : muyuFloatingText.slice(0, 4);
        return `积累${keyword}`;
    };

    return (
        <div
            className="h-full flex flex-col items-center relative overflow-hidden select-none transition-colors duration-500"
            style={{ backgroundColor: muyuBgColor }}
        >
            {/* Top Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-gradient-to-b from-[#ffffff0a] via-transparent to-transparent z-0 pointer-events-none"></div>

            <header className="w-full pt-16 flex flex-col items-center z-10 transition-all duration-300">
                <span className="text-gray-500 text-sm tracking-[4px] font-serif opacity-80 mb-2 uppercase">
                    {getDisplayTitle()}
                </span>
                <div className="text-5xl font-mono text-[#e5e5e5] font-bold tracking-tighter"
                    style={{ transform: isKnocking ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }}>
                    {user?.merit || 0}
                </div>
            </header>

            <div className="absolute right-6 top-16 z-20">
                <button onClick={() => setMuyuSoundEnabled(!muyuSoundEnabled)} className="p-2 text-white/40 hover:text-white transition-colors active:scale-95">
                    {muyuSoundEnabled ? <Volume2 size={26} /> : <VolumeX size={26} />}
                </button>
            </div>

            <main
                className="flex-1 flex flex-col items-center justify-center w-full relative touch-none"
                onMouseDown={handleInteraction}
                onTouchStart={handleInteraction}
            >
                <div className="absolute w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

                <div className="relative scale-[1.2]">
                    {/* Mallet */}
                    <div
                        className={classNames(
                            "absolute left-[150px] top-[30px] z-30 origin-bottom-right transition-all duration-150 cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                            isKnocking ? "rotate-[5deg] translate-y-8 -translate-x-3" : "rotate-[30deg]"
                        )}
                    >
                        {assetErrors.mallet ? (
                            <div style={{ width: '270px', height: '60px' }}>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-60 h-6 bg-gradient-to-r from-[#4a2e12] to-[#2d1b0b] rounded-full shadow-lg"></div>
                                <div className="absolute left-0 top-0 w-18 h-18 bg-gradient-to-br from-[#8d5c2c] via-[#5d3c1d] to-[#3a2512] rounded-full shadow-md"></div>
                            </div>
                        ) : (
                            <img
                                src={ASSETS_BASE.MALLET_IMAGE}
                                alt="Mallet"
                                className="w-[270px] h-auto pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
                                onError={() => setAssetErrors(prev => ({ ...prev, mallet: true }))}
                            />
                        )}
                    </div>

                    {/* Muyu Container */}
                    <div className={classNames(
                        "transition-transform duration-75",
                        isKnocking ? "translate-y-1 scale-95" : "translate-y-0 scale-100"
                    )}>
                        <div className="relative">
                            {!assetErrors.muyu ? (
                                <img
                                    src={ASSETS_BASE.MUYU_IMAGE}
                                    className="w-72 h-auto pointer-events-none drop-shadow-2xl"
                                    onError={() => setAssetErrors(prev => ({ ...prev, muyu: true }))}
                                />
                            ) : (
                                <div className="w-72 h-56 bg-gradient-to-br from-[#5d3c1d] via-[#3a2512] to-[#1a110a] rounded-[45%_35%_50%_40%] shadow-2xl relative flex items-center justify-center border-b-[10px] border-black/50">
                                    <div className="absolute left-[-10px] top-[45%] w-52 h-12 bg-black/80 rounded-r-full shadow-inner blur-[0.5px]"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="pb-16 z-10 flex items-center gap-2 px-10 py-3 bg-white/5 rounded-full backdrop-blur-md border border-white/5 text-white/30 text-xs tracking-widest uppercase">
                <Info size={14} className="opacity-50" />
                意随心动 • 个性定制
            </footer>

            {ripples.map(ripple => (
                <div key={ripple.id} className="absolute inset-x-0 top-[35%] flex justify-center pointer-events-none text-white font-serif italic text-4xl animate-merit-float z-40">
                    <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{muyuFloatingText}</span>
                </div>
            ))}

            <style>{`
                @keyframes merit-float {
                    0% { opacity: 0; transform: translateY(20px) scale(0.8); filter: blur(4px); }
                    20% { opacity: 1; transform: translateY(0) scale(1.1); filter: blur(0); }
                    100% { opacity: 0; transform: translateY(-150px) scale(1.4); }
                }
                .animate-merit-float { animation: merit-float 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            `}</style>
        </div>
    );
};
