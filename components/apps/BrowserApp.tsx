import React, { useState } from 'react';
import { RotateCw, Globe, ExternalLink, Lock, AlertCircle } from 'lucide-react';

interface BrowserAppProps {
    initialUrl?: string;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({ initialUrl = 'https://scene.zeacon.com/' }) => {
    // Robust URL handling: ensure protocol is present
    const formatUrl = (raw: string) => {
        if (!raw) return '';
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        return `https://${raw}`;
    };

    const [url, setUrl] = useState(formatUrl(initialUrl));
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const handleRefresh = () => {
        setIsLoading(true);
        setLoadError(false);
        if (iframeRef.current) {
            iframeRef.current.src = url;
        }
    };

    const handleOpenExternal = () => {
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-paper w-full">
            {/* Browser Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b-2 border-ink bg-white/50 backdrop-blur-sm shrink-0">
                <div className="flex gap-1">
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 hover:bg-paperDark rounded border border-transparent hover:border-ink/10 transition-colors"
                        title="Refresh"
                    >
                        <RotateCw size={14} className={isLoading ? "animate-spin text-catWeb" : "text-ink"} />
                    </button>
                    <button
                        onClick={handleOpenExternal}
                        className="p-1.5 hover:bg-paperDark rounded border border-transparent hover:border-ink/10 transition-colors"
                        title="Open in new tab"
                    >
                        <ExternalLink size={14} className="text-ink" />
                    </button>
                </div>

                {/* Address Bar */}
                <div className="flex-1 bg-white border-2 border-ink/20 rounded-md px-3 py-1.5 flex items-center gap-2 shadow-inner">
                    {url.startsWith('https') ? <Lock size={10} className="text-green-500" /> : <Globe size={10} className="text-gray-400" />}
                    <input
                        type="text"
                        value={url}
                        readOnly
                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-gray-600 truncate"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-white w-full overflow-hidden">

                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper z-10">
                        <div className="w-8 h-8 rounded-full border-4 border-ink/10 border-t-ink animate-spin mb-4"></div>
                        <p className="font-hand font-bold text-ink animate-pulse">Establishing Uplink...</p>
                    </div>
                )}

                {/* Error State */}
                {loadError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper z-20 p-8 text-center">
                        <AlertCircle size={32} className="text-red-500 mb-4" />
                        <h3 className="font-hand font-bold text-xl mb-2">Connection Refused</h3>
                        <p className="text-xs text-gray-500 font-mono mb-4 max-w-xs mx-auto">
                            The target website does not allow embedding (X-Frame-Options).
                        </p>
                        <button
                            onClick={handleOpenExternal}
                            className="px-4 py-2 bg-ink text-white font-bold text-xs rounded shadow-paper hover:shadow-paper-hover hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            Open in External Browser <ExternalLink size={12} />
                        </button>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full h-full border-0 block"
                    title="Project Demo Preview"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setLoadError(true);
                    }}
                    // Sandbox permissions for security, but allowing scripts/same-origin
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />

                {/* Overlay to capture clicks specifically during drag operations if needed, 
            but standard window dragging handles this via pointer-events-none on iframe during drag. 
            For now, we rely on the App.tsx drag handler. 
        */}
            </div>

            {/* Footer Status */}
            <div className="py-1 px-3 bg-paperDark border-t-2 border-ink/10 flex justify-between items-center text-[10px] font-mono text-gray-400 shrink-0">
                <span>TLS 1.3 SECURE CONNECTION</span>
                <span>HTML5 RENDERER</span>
            </div>
        </div>
    );
};
