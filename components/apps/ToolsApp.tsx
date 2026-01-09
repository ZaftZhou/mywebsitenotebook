import React from 'react';
import { TOOLS } from '../../constants';
import { AppId } from '../../types';
import { ExternalLink } from 'lucide-react';

interface ToolsAppProps {
    openApp: (id: AppId, props?: any) => void;
}

export const ToolsApp: React.FC<ToolsAppProps> = ({ openApp }) => {

    const handleLaunch = (url: string, title: string) => {
        openApp('browser', { initialUrl: url, titleOverride: title });
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Tools</h1>
                    <p className="text-sm text-gray-500">A collection of utilities and experiments.</p>
                </div>
                <div className="text-4xl">🛠️</div>
            </div>

            {/* Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
                {TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer flex flex-col gap-3"
                        onClick={() => handleLaunch(tool.url, tool.title)}
                    >
                        <div className={`w-12 h-12 rounded-lg ${tool.color || 'bg-gray-100'} flex items-center justify-center text-2xl shadow-inner`}>
                            {tool.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.desc}</p>
                        </div>
                        <div className="mt-auto pt-2 flex justify-end">
                            <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
