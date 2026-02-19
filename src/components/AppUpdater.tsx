import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Download, X } from 'lucide-react';

interface VersionInfo {
    version: string;
    build: number;
    downloadUrl: string;
    releaseNotes?: string;
}

const UPDATE_CHECK_URL = 'http://foshuo.onecheers.com/version.json';

export const AppUpdater: React.FC = () => {
    const [updateAvailable, setUpdateAvailable] = useState<VersionInfo | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkUpdate = async () => {
            // Only check on native Android/iOS
            if (!Capacitor.isNativePlatform()) return;

            try {
                // 1. Get current app version
                const appInfo = await App.getInfo();
                const currentBuild = parseInt(appInfo.build); // e.g., 1

                // 2. Fetch remote version info
                const response = await fetch(UPDATE_CHECK_URL + '?t=' + Date.now());
                if (!response.ok) return;

                const remoteInfo: VersionInfo = await response.json();

                // 3. Compare versions
                // Simple comparison: build number is most reliable for Android
                if (remoteInfo.build > currentBuild) {
                    setUpdateAvailable(remoteInfo);
                    setShowModal(true);
                }
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        checkUpdate();
    }, []);

    const handleUpdate = () => {
        if (updateAvailable) {
            // Open system browser to download APK
            window.open(updateAvailable.downloadUrl, '_system');
            setShowModal(false);
        }
    };

    if (!showModal || !updateAvailable) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-amber-100 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>

                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <Download size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 font-serif">发现新版本</h3>
                    <p className="text-amber-600 font-medium mb-4">v{updateAvailable.version}</p>

                    <div className="bg-gray-50 rounded-lg p-3 w-full text-left mb-6 text-sm text-gray-600 max-h-32 overflow-y-auto">
                        <p className="font-bold mb-1 text-gray-500 text-xs uppercase">更新内容：</p>
                        <p className="whitespace-pre-wrap">{updateAvailable.releaseNotes || '修复了一些已知问题，优化用户体验。'}</p>
                    </div>

                    <button
                        onClick={handleUpdate}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-amber-200"
                    >
                        立即更新
                    </button>

                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-3 text-sm text-gray-400 hover:text-gray-600"
                    >
                        暂不更新
                    </button>
                </div>
            </div>
        </div>
    );
};
