import React, { useState } from 'react';
import { usePosts, useProjects } from '../../src/hooks/useContent';
import { BlogPost, ContentBlock } from '../../types';
import { BookOpen, Calendar, Database, ChevronLeft, ChevronRight, Hash, Play, Image as ImageIcon, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AppId } from '../../types';

interface NotebookAppProps {
    openApp: (id: AppId, props?: any) => void;
    initialPostId?: string;
}

export const NotebookApp: React.FC<NotebookAppProps> = ({ openApp, initialPostId }) => {
    const { posts, loading } = usePosts();
    const { projects } = useProjects();
    const [selectedId, setSelectedId] = useState<string | null>(initialPostId || null);

    React.useEffect(() => {
        if (initialPostId) {
            setSelectedId(initialPostId);
        }
        // If we have posts but no selection yet (and no specific initialId demanded later), 
        // we could optionaly default to newest, but let's stick to explicit only.
    }, [initialPostId]);

    const selectedPost = selectedId ? posts.find(p => p.id === selectedId) : null;

    if (loading) return <div className="h-full flex items-center justify-center font-hand text-xl">Loading bits...</div>;

    const renderBlock = (block: ContentBlock) => {
        switch (block.type) {
            case 'text':
                return (
                    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-serif">
                        <ReactMarkdown>{block.content}</ReactMarkdown>
                    </div>
                );
            case 'image':
                return (
                    <div className="my-6">
                        <div className="bg-gray-100 rounded-lg overflow-hidden border border-ink/10 shadow-sm">
                            <img src={block.content} alt={block.caption || 'Blog Image'} className="w-full h-auto object-cover" />
                        </div>
                        {block.caption && <p className="text-center text-xs text-gray-500 font-mono mt-2 italic">{block.caption}</p>}
                    </div>
                );
            case 'video':
                return (
                    <div className="my-6">
                        <div className="bg-black rounded-lg overflow-hidden border border-ink/10 shadow-sm aspect-video">
                            <video src={block.content} controls className="w-full h-full" />
                        </div>
                        {block.caption && <p className="text-center text-xs text-gray-500 font-mono mt-2 italic">{block.caption}</p>}
                    </div>
                );
            case 'code':
                return (
                    <div className="my-6">
                        <div className="rounded-lg overflow-hidden border border-ink/10 shadow-sm">
                            <div className="bg-gray-800 px-3 py-1 flex items-center gap-2 border-b border-gray-700">
                                <Code size={12} className="text-green-400" />
                                <span className="text-[10px] text-green-400 font-mono uppercase">
                                    {block.language || 'javascript'}
                                </span>
                            </div>
                            <SyntaxHighlighter
                                language={block.language || 'javascript'}
                                style={atomDark}
                                customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                                showLineNumbers
                            >
                                {block.content}
                            </SyntaxHighlighter>
                        </div>
                        {block.caption && <p className="text-center text-xs text-gray-500 font-mono mt-2 italic">{block.caption}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderContent = (post: BlogPost) => {
        // Fallback for legacy content structure if migration fails or data is mixed
        const sections = post.sections || [];

        return (
            <div className="space-y-12">
                {sections.map(section => (
                    <div key={section.id} className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-ink/5 hidden md:block"></div>
                        <h3 className="font-bold uppercase tracking-wider text-xs text-gray-400 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-ink/20 rounded-full"></span> {section.title}
                        </h3>
                        <div className="space-y-4">
                            {section.blocks.map(block => (
                                <div key={block.id}>
                                    {renderBlock(block)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-full bg-paper relative">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r-2 border-ink bg-white flex flex-col ${selectedPost ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b-2 border-ink bg-gray-50 flex items-center gap-2">
                    <BookOpen size={20} />
                    <h2 className="font-hand font-bold text-xl">Notebook</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {posts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm font-mono">No entries found.</div>
                    ) : (
                        posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => setSelectedId(post.id)}
                                className={`p-3 rounded cursor-pointer border-2 transition-all hover:translate-x-1 ${selectedId === post.id ? 'bg-ink text-white border-ink shadow-md' : 'bg-white border-ink/10 hover:border-ink hover:bg-paper'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[9px] font-bold uppercase px-1.5 rounded border ${selectedId === post.id ? 'border-white/20 bg-white/10' :
                                        post.type === 'tech_note' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                            post.type === 'devlog' ? 'bg-green-50 text-green-600 border-green-200' :
                                                'bg-red-50 text-red-600 border-red-200'
                                        }`}>
                                        {post.type.replace('_', ' ')}
                                    </span>
                                    <span className={`text-[10px] font-mono ${selectedId === post.id ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm leading-tight line-clamp-2">{post.title}</h3>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${!selectedPost ? 'hidden md:flex' : 'flex'}`}>
                {selectedPost ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="md:hidden mb-4 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-ink"
                            >
                                <ChevronLeft size={16} /> Back to List
                            </button>

                            <div className="max-w-3xl mx-auto">
                                <header className="mb-8 pb-8 border-b-2 border-dashed border-ink/20">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded border-2 border-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] ${selectedPost.type === 'tech_note' ? 'bg-blue-100' :
                                            selectedPost.type === 'devlog' ? 'bg-green-100' :
                                                'bg-red-100'
                                            }`}>
                                            {selectedPost.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(selectedPost.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-hand font-bold mb-4 leading-tight">{selectedPost.title}</h1>

                                    {selectedPost.projectId && (
                                        <div
                                            onClick={() => openApp('projects', { initialProjectId: selectedPost.projectId })}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded border border-ink/10 cursor-pointer transition-colors text-xs font-bold text-gray-600 group"
                                        >
                                            <Database size={12} className="group-hover:text-ink" />
                                            Linked Project: {projects.find(p => p.id === selectedPost.projectId)?.title || 'Unknown'}
                                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </header>

                                <article className="font-serif">
                                    {renderContent(selectedPost)}
                                </article>

                                {/* Post Footer */}
                                <div className="mt-12 pt-8 border-t-2 border-ink flex items-center justify-between text-gray-400 text-xs font-mono">
                                    <span>END OF FILE</span>
                                    <span>ID: {selectedPost.id.substring(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none select-none">
                        <BookOpen size={120} strokeWidth={1} />
                        <p className="font-hand text-2xl mt-4">Select an entry to read</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Start Helper Component
// Helper Component Removed as it is replaced by renderBlock logic
// const Section: React.FC<{ title: string; content: string; highlight?: boolean; className?: string }> = ...
