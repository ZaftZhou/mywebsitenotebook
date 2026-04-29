import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, storage } from '../../src/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { doc, setDoc, deleteDoc, collection, addDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { Project, MediaItem, Skill, SiteSettings, BlogPost, PostType, ContentBlock, PostSection } from '../../types';
import { Lock, LogOut, Upload, Database, Plus, Trash2, Edit2, Save, Image as ImageIcon, Film, X, Loader, ArrowUp, ArrowDown, Star, Globe, Copy, Wrench, Music, User, Pin, Download, BookOpen, GripVertical, FileText, Video, Code } from 'lucide-react';
import { useProjects, useSkills, useSettings, usePosts } from '../../src/hooks/useContent';
import { PROJECTS, SKILLS, DEFAULT_TEMPLATES } from '../../constants';
// Add doc/addDoc/etc imports needed for SkillsEditor if not present
// Actually I see doc/setDoc/deleteDoc/collection/ref/uploadBytes/getDownloadURL/listAll are imported.
// I need addDoc, query, orderBy, onSnapshot which might be missing.

const PinnedProjectManager: React.FC = () => {
    const { projects } = useProjects();

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            await setDoc(doc(db, 'projects', id), { featured: !currentStatus }, { merge: true });
        } catch (e: any) {
            alert("Error updating pin: " + e.message);
        }
    };

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-paperDark group transition-colors border border-transparent hover:border-ink/5">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-6 h-6 rounded border border-ink/20 ${p.color || 'bg-gray-100'} flex-shrink-0 flex items-center justify-center text-[8px] font-bold`}>
                            {p.category[0]}
                        </div>
                        <span className="text-xs font-bold truncate text-gray-700">{p.title}</span>
                    </div>
                    <button
                        onClick={() => toggleFeatured(p.id, !!p.featured)}
                        className={`p-1.5 rounded transition-all border-2 ${p.featured
                            ? 'bg-ink text-tape border-ink shadow-sm'
                            : 'bg-white text-gray-300 border-gray-100 hover:border-gray-200'}`}
                        title={p.featured ? 'Unpin from dashboard' : 'Pin to dashboard'}
                    >
                        <Pin size={12} fill={p.featured ? "currentColor" : "none"} />
                    </button>
                </div>
            ))}
        </div>
    );
};

const DevDiaryMediaHelper: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const [lastUrl, setLastUrl] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `blog_images/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setLastUrl(url);
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-ink/10 mb-6">
            <h4 className="font-bold text-xs uppercase text-gray-400 mb-2 flex items-center gap-2">
                <ImageIcon size={12} /> Quick Media Upload
            </h4>
            <div className="flex gap-2 items-center">
                <label className="cursor-pointer bg-white border border-ink/20 px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-100 flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                    {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
                {lastUrl && (
                    <div className="flex-1 flex gap-2 items-center bg-white border border-ink/10 px-2 py-1 rounded overflow-hidden">
                        <code className="text-[10px] text-gray-500 truncate flex-1 font-mono">![Image]({lastUrl})</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(`![Image](${lastUrl})`)}
                            className="p-1 hover:bg-gray-100 rounded text-ink hover:text-blue-600 transition-colors"
                            title="Copy Markdown"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const BlogMediaLibraryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
    const [mediaItems, setMediaItems] = useState<{ url: string, type: 'image' | 'video' }[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

    useEffect(() => {
        if (isOpen) {
            loadMedia();
        }
    }, [isOpen]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const items: { url: string, type: 'image' | 'video' }[] = [];

            // Load images
            try {
                const imgRef = ref(storage, 'blog_images');
                const imgRes = await listAll(imgRef);
                const imgUrls = await Promise.all(imgRes.items.map(item => getDownloadURL(item)));
                imgUrls.forEach(url => items.push({ url, type: 'image' }));
            } catch (e) { console.log('No blog_images folder or error:', e); }

            // Load videos
            try {
                const vidRef = ref(storage, 'blog_videos');
                const vidRes = await listAll(vidRef);
                const vidUrls = await Promise.all(vidRes.items.map(item => getDownloadURL(item)));
                vidUrls.forEach(url => items.push({ url, type: 'video' }));
            } catch (e) { console.log('No blog_videos folder or error:', e); }

            // Also check project_media for any shared assets
            try {
                const projRef = ref(storage, 'project_media');
                const projRes = await listAll(projRef);
                const projUrls = await Promise.all(projRes.items.map(async item => {
                    const url = await getDownloadURL(item);
                    const isVideo = item.name.match(/\.(mp4|webm|mov)$/i);
                    return { url, type: (isVideo ? 'video' : 'image') as 'image' | 'video' };
                }));
                items.push(...projUrls);
            } catch (e) { console.log('No project_media folder or error:', e); }

            setMediaItems(items);
        } catch (e: any) {
            console.error("Error loading media", e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredItems = filter === 'all' ? mediaItems : mediaItems.filter(m => m.type === filter);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-window" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl flex items-center gap-2"><Database size={20} /> Media Library</h3>
                    <button onClick={onClose}><X size={20} className="hover:text-red-500 transition-colors" /></button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 border-b border-ink/10 pb-2">
                    {(['all', 'image', 'video'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${filter === f ? 'bg-ink text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {f === 'all' ? 'All' : f === 'image' ? '🖼️ Images' : '🎬 Videos'}
                        </button>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto self-center">{filteredItems.length} items</span>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-ink" /></div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Database size={48} className="opacity-20" />
                        <p className="text-sm">No media found</p>
                        <p className="text-xs opacity-50">Upload files to blog_images or blog_videos</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 custom-scrollbar">
                        {filteredItems.map(item => (
                            <button
                                key={item.url}
                                onClick={() => { onSelect(item.url); onClose(); }}
                                className="group relative aspect-square bg-gray-100 rounded overflow-hidden border-2 border-transparent hover:border-ink focus:border-ink transition-all"
                            >
                                {item.type === 'image' ? (
                                    <img src={item.url} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                        <video src={item.url} className="w-full h-full object-cover" muted />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-black/50 p-2 rounded-full"><Video size={24} className="text-white" /></div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded uppercase font-bold">
                                    {item.type}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const BlockEditor: React.FC<{
    block: ContentBlock;
    onChange: (b: ContentBlock) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    onOpenLibrary: () => void;
}> = ({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onOpenLibrary }) => {

    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Real Drag & Drop Upload
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('Please drop an image or video file');
            return;
        }

        try {
            setIsUploading(true);

            // Determine folder based on file type
            const folder = isImage ? 'blog_images' : 'blog_videos';
            const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const storageRef = ref(storage, `${folder}/${filename}`);

            console.log('[BlockEditor] Uploading file to:', `${folder}/${filename}`);

            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            console.log('[BlockEditor] Upload complete, URL:', url);

            // Update block with new URL
            onChange({ ...block, content: url });

        } catch (err: any) {
            console.error('[BlockEditor] Upload error:', err);
            alert('Upload failed: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    return (
        <div className="bg-white border-2 border-ink/10 rounded p-2 flex gap-2 group relative hover:border-ink/30 transition-colors">
            {/* Controls */}
            <div className="flex flex-col gap-1 text-gray-300">
                <button type="button" disabled={isFirst} onClick={onMoveUp} className={`hover:text-ink ${isFirst ? 'opacity-0' : ''}`}><ArrowUp size={12} /></button>
                <div className="cursor-grab active:cursor-grabbing text-ink/20"><GripVertical size={12} /></div>
                <button type="button" disabled={isLast} onClick={onMoveDown} className={`hover:text-ink ${isLast ? 'opacity-0' : ''}`}><ArrowDown size={12} /></button>
            </div>

            {/* Content */}
            <div className="flex-1">
                {block.type === 'text' && (
                    <textarea
                        className="w-full border-none outline-none resize-none text-sm font-mono h-24 bg-transparent"
                        placeholder="Write something... (Markdown supported)"
                        value={block.content}
                        onChange={e => onChange({ ...block, content: e.target.value })}
                    />
                )}
                {block.type === 'image' && (
                    <div
                        className={`flex flex-col gap-2 relative ${isDragging ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded">
                                <Loader className="animate-spin text-ink" size={24} />
                                <span className="ml-2 text-xs font-bold">Uploading...</span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                className="flex-1 text-xs border-b border-ink/10 outline-none py-1 font-mono"
                                placeholder="Image URL..."
                                value={block.content}
                                onChange={e => onChange({ ...block, content: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={onOpenLibrary}
                                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-bold rounded flex items-center gap-1"
                            >
                                <Database size={10} /> Library
                            </button>
                        </div>
                        {block.content ? (
                            <div className="relative w-full aspect-video bg-gray-100 rounded overflow-hidden border border-ink/10 group-hover:border-ink/20 transition-colors">
                                <img src={block.content} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className={`w-full aspect-video border-2 border-dashed rounded flex flex-col items-center justify-center gap-2 transition-colors ${isDragging ? 'bg-blue-50 border-blue-400 text-blue-500' : 'bg-gray-50 border-ink/10 text-gray-300'}`}>
                                <Upload size={24} />
                                <span className="text-[10px]">{isDragging ? 'Drop to upload!' : 'Drag image here or use Library'}</span>
                            </div>
                        )}
                        <input
                            className="text-xs bg-gray-50 p-1 w-full outline-none text-center italic text-gray-500"
                            placeholder="Caption (optional)"
                            value={block.caption || ''}
                            onChange={e => onChange({ ...block, caption: e.target.value })}
                        />
                    </div>
                )}
                {block.type === 'video' && (
                    <div
                        className={`flex flex-col gap-2 relative ${isDragging ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center rounded">
                                <Loader className="animate-spin text-white" size={24} />
                                <span className="ml-2 text-xs font-bold text-white">Uploading video...</span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                className="flex-1 text-xs border-b border-ink/10 outline-none py-1 font-mono"
                                placeholder="Video URL..."
                                value={block.content}
                                onChange={e => onChange({ ...block, content: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={onOpenLibrary}
                                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-bold rounded flex items-center gap-1"
                            >
                                <Database size={10} /> Library
                            </button>
                        </div>
                        {block.content ? (
                            <video src={block.content} controls className="w-full aspect-video bg-black rounded" />
                        ) : (
                            <div className={`w-full aspect-video border-2 border-dashed rounded flex flex-col items-center justify-center gap-2 transition-colors ${isDragging ? 'bg-purple-900 border-purple-400 text-purple-300' : 'bg-gray-900 border-gray-600 text-gray-500'}`}>
                                <Upload size={24} />
                                <span className="text-[10px]">{isDragging ? 'Drop to upload!' : 'Drag video here or use Library'}</span>
                            </div>
                        )}
                        <input
                            className="text-xs bg-gray-50 p-1 w-full outline-none text-center italic text-gray-500"
                            placeholder="Caption (optional)"
                            value={block.caption || ''}
                            onChange={e => onChange({ ...block, caption: e.target.value })}
                        />
                    </div>
                )}
                {block.type === 'code' && (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                            <select
                                className="text-xs border border-ink/20 rounded px-2 py-1 bg-gray-900 text-green-400 font-mono"
                                value={block.language || 'javascript'}
                                onChange={e => onChange({ ...block, language: e.target.value })}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="csharp">C#</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="go">Go</option>
                                <option value="rust">Rust</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="json">JSON</option>
                                <option value="bash">Bash</option>
                                <option value="sql">SQL</option>
                                <option value="glsl">GLSL</option>
                                <option value="hlsl">HLSL</option>
                            </select>
                            <span className="text-[10px] text-gray-400">Language</span>
                        </div>
                        <textarea
                            className="w-full bg-gray-900 text-green-400 font-mono text-sm p-3 rounded border border-ink/20 outline-none resize-none h-40 overflow-auto"
                            placeholder="// Paste your code here..."
                            value={block.content}
                            onChange={e => onChange({ ...block, content: e.target.value })}
                            spellCheck={false}
                        />
                        <input
                            className="text-xs bg-gray-50 p-1 w-full outline-none text-center italic text-gray-500"
                            placeholder="Caption (optional) - e.g. 'Offscreen canvas rendering'"
                            value={block.caption || ''}
                            onChange={e => onChange({ ...block, caption: e.target.value })}
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('[BlockEditor] Delete clicked for block:', block.id);
                        onDelete();
                    }}
                    className="text-red-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Remove Block"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="absolute -top-2 -right-2 bg-white border border-ink/20 px-1 rounded text-[9px] uppercase font-bold text-gray-400">
                {block.type}
            </div>
        </div>
    );
};

const SectionEditor: React.FC<{
    section: PostSection;
    onChange: (s: PostSection) => void;
}> = ({ section, onChange }) => {
    const [libraryOpenIdx, setLibraryOpenIdx] = useState<number | null>(null);

    const addBlock = (type: 'text' | 'image' | 'video' | 'code') => {
        const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: '',
            ...(type === 'code' ? { language: 'javascript' } : {})
        };
        onChange({ ...section, blocks: [...section.blocks, newBlock] });
    };

    const updateBlock = (index: number, newBlock: ContentBlock) => {
        const newBlocks = [...section.blocks];
        newBlocks[index] = newBlock;
        onChange({ ...section, blocks: newBlocks });
    };

    const deleteBlock = (index: number) => {
        console.log('[SectionEditor] deleteBlock called, index:', index, 'section.blocks before:', section.blocks.length);
        const newBlocks = [...section.blocks];
        newBlocks.splice(index, 1);
        console.log('[SectionEditor] newBlocks after splice:', newBlocks.length);
        onChange({ ...section, blocks: newBlocks });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === section.blocks.length - 1) return;
        const newBlocks = [...section.blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        onChange({ ...section, blocks: newBlocks });
    };

    return (
        <div className="mb-8 border-l-4 border-ink/10 pl-4 py-2 relative">
            <h4 className="font-bold text-sm uppercase text-ink/40 mb-3 flex items-center justify-between">
                <span>{section.title}</span>
                <span className="text-[10px] font-mono">{section.blocks.length} Blocks</span>
            </h4>

            <div className="space-y-3">
                {section.blocks.map((block, idx) => (
                    <BlockEditor
                        key={block.id}
                        block={block}
                        onChange={(b) => updateBlock(idx, b)}
                        onDelete={() => deleteBlock(idx)}
                        onMoveUp={() => moveBlock(idx, 'up')}
                        onMoveDown={() => moveBlock(idx, 'down')}
                        isFirst={idx === 0}
                        isLast={idx === section.blocks.length - 1}
                        onOpenLibrary={() => setLibraryOpenIdx(idx)}
                    />
                ))}
            </div>

            <BlogMediaLibraryModal
                isOpen={libraryOpenIdx !== null}
                onClose={() => setLibraryOpenIdx(null)}
                onSelect={(url) => {
                    if (libraryOpenIdx !== null) {
                        const block = section.blocks[libraryOpenIdx];
                        updateBlock(libraryOpenIdx, { ...block, content: url });
                        setLibraryOpenIdx(null);
                    }
                }}
            />

            {/* Add Block Controls */}
            <div className="flex gap-2 mt-3 opacity-50 hover:opacity-100 transition-opacity flex-wrap">
                <button type="button" onClick={() => addBlock('text')} className="px-2 py-1 bg-gray-100 hover:bg-white border border-transparent hover:border-ink/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <FileText size={10} /> Add Text
                </button>
                <button type="button" onClick={() => addBlock('image')} className="px-2 py-1 bg-gray-100 hover:bg-white border border-transparent hover:border-ink/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <ImageIcon size={10} /> Add Image
                </button>
                <button type="button" onClick={() => addBlock('video')} className="px-2 py-1 bg-gray-100 hover:bg-white border border-transparent hover:border-ink/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <Video size={10} /> Add Video
                </button>
                <button type="button" onClick={() => addBlock('code')} className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-green-400 border border-transparent hover:border-green-400/30 rounded text-[10px] font-bold flex items-center gap-1">
                    <Code size={10} /> Add Code
                </button>
            </div>
        </div>
    );
};

const DevDiaryEditor: React.FC = () => {
    const { posts } = usePosts();
    const { projects } = useProjects();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<BlogPost>>({
        type: 'tech_note',
        tags: [],
        sections: []
    });

    const handleCreate = () => {
        setEditingId('new');
        setFormData({
            title: '',
            date: new Date().toISOString(),
            type: 'tech_note',
            tags: [],
            sections: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES['tech_note'])) // Deep copy template
        });
    };

    const handleEdit = (post: BlogPost) => {
        setEditingId(post.id);
        // Migration: If post has old content, we might need to convert?
        // Assuming we rely on the type. But wait, if we changed the DB schema, old posts might break if we don't handle them.
        // For now, let's just load it. If it doesn't have sections, we might fallback.
        // But the user asked to "preserve existing entries".
        // The existing entries in DB will have 'content' field, not 'sections'.
        // We should detect that.

        let sections = post.sections;
        if (!sections && (post as any).content) {
            // Convert legacy content to sections on the fly for editing
            const type = post.type || 'tech_note';
            const template = DEFAULT_TEMPLATES[type] || DEFAULT_TEMPLATES['tech_note'];
            const legacyContent = (post as any).content;

            // Map legacy fields to template sections
            // This is a "Best Effort" migration
            sections = template.map(sec => {
                // Find key from title?
                // In constants.ts we used IDs like 'sec_problem'. 
                // Let's map IDs back to legacy keys.
                const keyMap: any = {
                    'sec_problem': 'problem', 'sec_approach': 'approach', 'sec_impl': 'implementation',
                    'sec_tradeoffs': 'tradeoffs', 'sec_result': 'result', 'sec_takeaway': 'takeaway',
                    'sec_updates': 'updates', 'sec_why': 'why', 'sec_before_after': 'beforeAfter',
                    'sec_challenges': 'challenges', 'sec_next': 'nextSteps',
                    'sec_goal': 'goal', 'sec_good': 'good', 'sec_bad': 'bad',
                    'sec_root': 'rootCause', 'sec_action': 'actionItems'
                };

                const legacyKey = keyMap[sec.id];
                if (legacyKey && legacyContent[legacyKey]) {
                    return {
                        ...sec,
                        blocks: [{ id: Math.random().toString(), type: 'text', content: legacyContent[legacyKey] }]
                    };
                }
                return sec;
            });
        }

        setFormData({ ...post, sections });
    };

    const handleSave = async () => {
        if (!formData.title) return alert("Title is required");

        try {
            const dataToSave = {
                ...formData,
                date: formData.date || new Date().toISOString(),
                // Ensure we eliminate any legacy content field if it lingers
                content: undefined
            };
            // Clean undefined
            delete (dataToSave as any).content;

            if (editingId === 'new') {
                await addDoc(collection(db, 'posts'), dataToSave);
            } else if (editingId) {
                await setDoc(doc(db, 'posts', editingId), dataToSave, { merge: true });
            }
            setEditingId(null);
        } catch (e: any) {
            alert("Error saving post: " + e.message);
        }
    };

    const handleDelete = async (id: string) => {
        console.log('[DevDiaryEditor] handleDelete called, id:', id);

        if (id === 'new') {
            console.log('[DevDiaryEditor] Cancelling new entry');
            setEditingId(null);
            return;
        }

        try {
            console.log('[DevDiaryEditor] Deleting from Firestore...');
            await deleteDoc(doc(db, 'posts', id));
            console.log('[DevDiaryEditor] Deleted successfully');
            if (editingId === id) setEditingId(null);
        } catch (e: any) {
            console.error('[DevDiaryEditor] Delete error:', e);
            alert("Error deleting: " + e.message);
        }
    };

    const updateSection = (index: number, newSection: PostSection) => {
        console.log('[DevDiaryEditor] updateSection called, index:', index, 'newSection blocks:', newSection.blocks.length);
        const newSections = [...(formData.sections || [])];
        newSections[index] = newSection;
        console.log('[DevDiaryEditor] Setting new formData.sections, total sections:', newSections.length);
        setFormData({ ...formData, sections: newSections });
    };

    const changeType = (newType: PostType) => {
        console.log('[DevDiaryEditor] changeType called, switching to:', newType);
        setFormData({
            ...formData,
            type: newType,
            sections: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[newType]))
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* List */}
            <div className="md:col-span-1 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-hand font-bold text-xl">Entries</h3>
                    <button onClick={handleCreate} className="p-2 bg-ink text-white rounded hover:bg-gray-800 transition-colors shadow-sm">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {posts.map(post => (
                        <div
                            key={post.id}
                            onClick={() => handleEdit(post)}
                            className={`p-4 rounded border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${editingId === post.id ? 'border-ink bg-paper' : 'border-ink/10 bg-white hover:border-ink/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${post.type === 'tech_note' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                    post.type === 'devlog' ? 'bg-green-50 text-green-600 border-green-200' :
                                        'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                    {post.type.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-sm line-clamp-2">{post.title}</h4>
                            {post.projectId && (
                                <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                                    <Database size={10} />
                                    {projects.find(p => p.id === post.projectId)?.title || 'Unknown Project'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="md:col-span-2">
                {editingId ? (
                    <div className="bg-white border-2 border-ink rounded-lg p-6 shadow-sm relative">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-hand font-bold text-xl flex items-center gap-2">
                                <Edit2 size={20} />
                                {editingId === 'new' ? 'New Entry' : 'Edit Entry'}
                            </h3>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(editingId);
                                }}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Title</label>
                                    <input
                                        className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none transition-colors font-medium bg-white"
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Entry Title..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Type</label>
                                    <select
                                        className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none transition-colors font-medium bg-white"
                                        value={formData.type}
                                        onChange={e => changeType(e.target.value as PostType)}
                                    >
                                        <option value="tech_note">Tech Note</option>
                                        <option value="devlog">Devlog</option>
                                        <option value="postmortem">Postmortem</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Related Project (Optional)</label>
                                <select
                                    className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none transition-colors font-medium bg-white"
                                    value={formData.projectId || ''}
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                >
                                    <option value="">-- None --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <DevDiaryMediaHelper />

                            <div className="border-t-2 border-dashed border-ink/10 pt-4">
                                {(formData.sections || []).map((section, idx) => (
                                    <SectionEditor
                                        key={section.id}
                                        section={section}
                                        onChange={(newSec) => updateSection(idx, newSec)}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-ink/10">
                                <button
                                    onClick={handleSave}
                                    className="bg-ink text-white px-6 py-2 rounded font-bold shadow-md hover:translate-y-[-1px] hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Save size={16} /> Save Entry
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-ink/10 rounded-lg bg-gray-50 min-h-[400px]">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p className="font-mono text-sm">Select an entry or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsEditor: React.FC = () => {
    const { settings, loading } = useSettings();
    const { projects } = useProjects();
    const [formData, setFormData] = useState<SiteSettings>({
        profile: {
            status: 'Open to Work',
            isHiring: true,
            role: 'Unity Systems & VFX',
            location: 'Turku, Finland',
            email: 'hello@example.com',
            linkedin: 'LinkedIn Profile'
        },
        music: {
            title: 'Lo-fi Study Beats',
            artist: 'Chillhop Radio 24/7',
            streamUrl: ''
        },
        welcome: {
            greeting: "Hello, I'm Zhou Bowen.",
            tagline: "Unity Dev • Tech Artist • Turku, Finland 🇫🇮",
            heroLine1: "Interactive",
            heroLine2: "Experiences",
            heroLine3: "Engineer.",
            homePhotoUrl: ""
        },
        widgets: {
            toolboxTitle: "Toolbox",
            toolboxColor: ""
        },
        homepage: {
            recentProjectIds: [],
            lifeItems: [
                {
                    title: "Silence & Nature",
                    desc: "Hiking in the Finnish archipelago or foraging in local forests. Nature is where I reset my mind.",
                    image: "https://images.unsplash.com/photo-1500829243541-74b676fecc20?q=80&w=1000&auto=format&fit=crop"
                },
                {
                    title: "Ice Swimming",
                    desc: "Avantouinti. The ultimate system reboot after a long week of coding.",
                    image: "https://images.unsplash.com/photo-1549468057-5b6faf4ae621?q=80&w=800&auto=format&fit=crop"
                },
                {
                    title: "Photography",
                    desc: "Documenting the stark contrasts of Nordic light and minimalist architecture.",
                    image: "https://images.unsplash.com/photo-1493606371202-6275828f90f3?q=80&w=800&auto=format&fit=crop"
                }
            ]
        }
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'general'), formData);
            alert("Settings saved!");
        } catch (e: any) {
            alert("Error saving: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const defaultLifeItems = [
        {
            title: "Silence & Nature",
            desc: "Hiking in the Finnish archipelago or foraging in local forests. Nature is where I reset my mind.",
            image: "https://images.unsplash.com/photo-1500829243541-74b676fecc20?q=80&w=1000&auto=format&fit=crop"
        },
        {
            title: "Ice Swimming",
            desc: "Avantouinti. The ultimate system reboot after a long week of coding.",
            image: "https://images.unsplash.com/photo-1549468057-5b6faf4ae621?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Photography",
            desc: "Documenting the stark contrasts of Nordic light and minimalist architecture.",
            image: "https://images.unsplash.com/photo-1493606371202-6275828f90f3?q=80&w=800&auto=format&fit=crop"
        }
    ];

    const homepageLifeItems = formData.homepage?.lifeItems?.length ? formData.homepage.lifeItems : defaultLifeItems;

    const updateRecentProject = (index: number, projectId: string) => {
        const next = [...(formData.homepage?.recentProjectIds || [])];
        next[index] = projectId;
        setFormData({
            ...formData,
            homepage: {
                ...formData.homepage,
                recentProjectIds: next.filter(Boolean)
            }
        });
    };

    const updateLifeItem = (index: number, updates: Partial<(typeof defaultLifeItems)[number]>) => {
        const next = [...homepageLifeItems];
        next[index] = { ...next[index], ...updates };
        setFormData({
            ...formData,
            homepage: {
                ...formData.homepage,
                lifeItems: next
            }
        });
    };

    const uploadLifeImage = async (index: number, file?: File) => {
        if (!file) return;
        const storageRef = ref(storage, `life_images/life_${index}_${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        updateLifeItem(index, { image: url });
    };

    if (loading) return <div className="p-8"><Loader className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg border-2 border-ink shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <User size={120} />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b-2 border-ink/10 pb-3 relative z-10">
                    <User size={24} className="text-tape" /> Profile Card
                </h3>
                <div className="grid gap-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Status Text</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.profile.status} onChange={e => setFormData({ ...formData, profile: { ...formData.profile, status: e.target.value } })} />
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-ink/10">
                        <input type="checkbox" id="isHiring" checked={formData.profile.isHiring} onChange={e => setFormData({ ...formData, profile: { ...formData.profile, isHiring: e.target.checked } })} className="w-4 h-4 text-ink rounded border-gray-300 focus:ring-ink" />
                        <label htmlFor="isHiring" className="text-sm font-bold cursor-pointer select-none">Show Green Dot (Hiring/Active)</label>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Role / Headline</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.profile.role} onChange={e => setFormData({ ...formData, profile: { ...formData.profile, role: e.target.value } })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Location</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.profile.location} onChange={e => setFormData({ ...formData, profile: { ...formData.profile, location: e.target.value } })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Email (mailto: or link)</label>
                            <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" placeholder="mailto:your@email.com" value={formData.profile.email} onChange={e => setFormData({ ...formData, profile: { ...formData.profile, email: e.target.value } })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-gray-500">LinkedIn Profile URL</label>
                            <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" placeholder="https://linkedin.com/in/..." value={formData.profile.linkedin} onChange={e => setFormData({ ...formData, profile: { ...formData.profile, linkedin: e.target.value } })} />
                        </div>
                    </div>

                    <div className="mt-4 border-t border-ink/10 pt-4">
                        <label className="block text-xs font-bold uppercase mb-2 text-gray-500 flex items-center gap-2">
                            <Download size={14} /> Resume / CV Upload
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                id="resume-upload"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        const storageRef = ref(storage, `resumes/resume_${Date.now()}_${file.name}`);
                                        await uploadBytes(storageRef, file);
                                        const url = await getDownloadURL(storageRef);
                                        setFormData({ ...formData, profile: { ...formData.profile, resumeUrl: url } });
                                    }
                                }}
                            />
                            <label htmlFor="resume-upload" className="bg-ink text-white px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
                                <Upload size={14} /> Upload New CV
                            </label>
                            {formData.profile.resumeUrl && (
                                <div className="flex items-center gap-2 text-xs font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                                    <span>✓ CV Uploaded</span>
                                    <a href={formData.profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">View</a>
                                    <button
                                        onClick={() => setFormData({ ...formData, profile: { ...formData.profile, resumeUrl: '' } })}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        title="Remove CV"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-ink shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Music size={120} />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b-2 border-ink/10 pb-3 relative z-10">
                    <Music size={24} className="text-tape" /> Music Player
                </h3>
                <div className="grid gap-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Track Title</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.music.title} onChange={e => setFormData({ ...formData, music: { ...formData.music, title: e.target.value } })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Artist / Subtitle</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.music.artist} onChange={e => setFormData({ ...formData, music: { ...formData.music, artist: e.target.value } })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Stream URL (Optional)</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white text-xs font-mono" placeholder="https://..." value={formData.music.streamUrl || ''} onChange={e => setFormData({ ...formData, music: { ...formData.music, streamUrl: e.target.value } })} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-ink shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Star size={120} />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b-2 border-ink/10 pb-3 relative z-10">
                    <Star size={24} className="text-tape" /> Welcome Screen
                </h3>
                <div className="grid gap-6 relative z-10">
                    <div className="flex gap-6 items-start">
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Greeting / Headline</label>
                                <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.welcome?.greeting || ''} onChange={e => setFormData({ ...formData, welcome: { ...formData.welcome, greeting: e.target.value } })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Tagline / Subtext</label>
                                <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.welcome?.tagline || ''} onChange={e => setFormData({ ...formData, welcome: { ...formData.welcome, tagline: e.target.value } })} />
                            </div>
                            <div className="grid md:grid-cols-3 gap-3 border-t border-ink/10 pt-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Hero Line 1</label>
                                    <input value={formData.welcome?.heroLine1 || ''} placeholder="Interactive" onChange={e => setFormData({ ...formData, welcome: { ...formData.welcome, heroLine1: e.target.value } })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Hero Line 2</label>
                                    <input value={formData.welcome?.heroLine2 || ''} placeholder="Experiences" onChange={e => setFormData({ ...formData, welcome: { ...formData.welcome, heroLine2: e.target.value } })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Hero Line 3</label>
                                    <input value={formData.welcome?.heroLine3 || ''} placeholder="Engineer." onChange={e => setFormData({ ...formData, welcome: { ...formData.welcome, heroLine3: e.target.value } })} />
                                </div>
                            </div>
                            <div className="border-t border-ink/10 pt-4">
                                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Home Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-ink/20 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                                        {formData.welcome?.homePhotoUrl ? (
                                            <img src={formData.welcome.homePhotoUrl} alt="Home photo" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            type="file"
                                            id="home-photo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    const storageRef = ref(storage, `home_photos/home_${Date.now()}_${file.name}`);
                                                    await uploadBytes(storageRef, file);
                                                    const url = await getDownloadURL(storageRef);
                                                    setFormData({ ...formData, welcome: { ...formData.welcome, homePhotoUrl: url } });
                                                }
                                            }}
                                        />
                                        <label htmlFor="home-photo-upload" className="bg-ink text-white px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
                                            <Upload size={14} /> Upload Home Photo
                                        </label>
                                        {formData.welcome?.homePhotoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, welcome: { ...formData.welcome, homePhotoUrl: '' } })}
                                                className="px-3 py-2 rounded text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-24">
                            <label className="block text-xs font-bold uppercase mb-2 text-gray-500 text-center">Avatar</label>
                            <div
                                className="w-24 h-24 rounded-full border-2 border-dashed border-ink/20 flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden group bg-white mx-auto shadow-sm"
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                            >
                                {formData.welcome?.avatarUrl ? (
                                    <img src={formData.welcome.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">👋</span>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                    Change
                                </div>
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        const storageRef = ref(storage, `avatars/avatar_${Date.now()}_${file.name}`);
                                        await uploadBytes(storageRef, file);
                                        const url = await getDownloadURL(storageRef);
                                        setFormData({ ...formData, welcome: { ...formData.welcome, avatarUrl: url } });
                                    }
                                }}
                            />
                            {formData.welcome?.avatarUrl && (
                                <button
                                    onClick={() => setFormData({ ...formData, welcome: { ...formData.welcome, avatarUrl: '' } })}
                                    className="text-[10px] text-red-500 hover:text-red-700 underline text-center w-full mt-1 block"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-ink shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Globe size={120} />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b-2 border-ink/10 pb-3 relative z-10">
                    <Globe size={24} className="text-accent" /> Homepage Sections
                </h3>
                <div className="grid gap-8 relative z-10">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-3 text-gray-500">Recent Works</label>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[0, 1].map(index => (
                                <select
                                    key={index}
                                    value={formData.homepage?.recentProjectIds?.[index] || ''}
                                    onChange={e => updateRecentProject(index, e.target.value)}
                                >
                                    <option value="">Auto project {index + 1}</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.title}</option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-ink/10 pt-6">
                        <label className="block text-xs font-bold uppercase mb-3 text-gray-500">Life & Hobbies Cards</label>
                        <div className="grid gap-4">
                            {homepageLifeItems.map((item, index) => (
                                <div key={index} className="grid md:grid-cols-[120px_minmax(0,1fr)] gap-4 p-4 rounded-[24px] border border-ink/10 bg-bg/50">
                                    <div className="space-y-2">
                                        <div className="w-full aspect-square rounded-[20px] overflow-hidden bg-ink/5 border border-ink/10">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-ink/25">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id={`life-image-upload-${index}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={e => uploadLifeImage(index, e.target.files?.[0])}
                                        />
                                        <label htmlFor={`life-image-upload-${index}`} className="w-full bg-ink text-white px-3 py-2 rounded-full text-[10px] font-bold cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                            <Upload size={12} /> Upload
                                        </label>
                                    </div>
                                    <div className="grid gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase mb-1 text-gray-500">Title</label>
                                            <input value={item.title} onChange={e => updateLifeItem(index, { title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase mb-1 text-gray-500">Description</label>
                                            <textarea value={item.desc} onChange={e => updateLifeItem(index, { desc: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase mb-1 text-gray-500">Image URL</label>
                                            <input value={item.image} onChange={e => updateLifeItem(index, { image: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-ink shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Wrench size={120} />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b-2 border-ink/10 pb-3 relative z-10">
                    <Wrench size={24} className="text-tape" /> Desktop Widgets
                </h3>
                <div className="grid gap-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Toolbox Title</label>
                        <input className="w-full border-2 border-ink/20 focus:border-ink p-3 rounded outline-none transition-colors font-medium bg-white" value={formData.widgets?.toolboxTitle || ''} onChange={e => setFormData({ ...formData, widgets: { ...formData.widgets, toolboxTitle: e.target.value } })} />
                    </div>

                    <div className="pt-4 border-t border-ink/10">
                        <label className="block text-xs font-bold uppercase mb-3 text-gray-500 flex items-center gap-2">
                            <Pin size={14} /> Pinned Projects (Max 3 Recommended)
                        </label>
                        <PinnedProjectManager />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-ink text-white px-6 py-2 rounded font-bold hover:bg-ink/90 flex items-center gap-2"
            >
                {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Settings
            </button>
        </div>
    );
};

// Helper to upload and analyze a single file
const uploadAndCreateMedia = async (file: File, projectId: string): Promise<MediaItem> => {
    // 1. Detect Dimensions
    let aspect = 'aspect-video';
    const objectUrl = URL.createObjectURL(file);

    try {
        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.src = objectUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                setTimeout(() => resolve(null), 2000);
            });
            if (img.naturalWidth && img.naturalHeight) {
                aspect = `aspect-[${img.naturalWidth}/${img.naturalHeight}]`;
            }
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = objectUrl;
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = reject;
                setTimeout(() => resolve(null), 2000);
            });
            if (video.videoWidth && video.videoHeight) {
                aspect = `aspect-[${video.videoWidth}/${video.videoHeight}]`;
            }
        }
    } catch (e) {
        console.warn("Aspect detection failed", e);
    }

    // 2. Upload
    // Remove timestamp to allow overwriting if same name
    const storageRef = ref(storage, `project-media/${projectId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return {
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url,
        aspect,
        caption: '',
        color: 'bg-gray-200'
    };
};

const MediaLibraryModal: React.FC<{ projectId: string; onSelect: (url: string, type: 'image' | 'video') => void; onClose: () => void }> = ({ projectId, onSelect, onClose }) => {
    const [files, setFiles] = useState<{ url: string; name: string; type: 'image' | 'video' }[]>([]);
    const [loading, setLoading] = useState(true);
    const [manageMode, setManageMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const listRef = ref(storage, `project-media/${projectId}`);
            const res = await listAll(listRef);
            const filePromises = res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                const isVideo = itemRef.name.toLowerCase().match(/\.(mp4|webm|mov)$/);
                return {
                    url,
                    name: itemRef.name,
                    type: isVideo ? 'video' as const : 'image' as const
                };
            });
            const fetchedFiles = await Promise.all(filePromises);
            setFiles(fetchedFiles);
        } catch (err) {
            console.error("Failed to list files", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const toggleSelection = (name: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(name)) newSet.delete(name);
        else newSet.add(name);
        setSelectedItems(newSet);
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`Delete ${selectedItems.size} items? This cannot be undone.`)) return;
        setLoading(true);
        try {
            const promises = Array.from(selectedItems).map(name =>
                deleteObject(ref(storage, `project-media/${projectId}/${name}`))
            );
            await Promise.all(promises);
            setSelectedItems(new Set());
            await fetchFiles();
        } catch (e: any) {
            alert("Delete failed: " + e.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg flex flex-col shadow-2xl border-2 border-ink overflow-hidden">
                <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Database size={18} /> Media Library
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setManageMode(!manageMode); setSelectedItems(new Set()); }}
                            className={`px-3 py-1 rounded text-xs font-bold border ${manageMode ? 'bg-ink text-white border-ink' : 'bg-white text-gray-500 border-gray-300'}`}
                        >
                            {manageMode ? 'Done Managing' : 'Manage / Delete'}
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-paper relative">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                            <Loader className="animate-spin" /> {manageMode ? 'Processing...' : 'Loading Library...'}
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 border-2 border-dashed border-ink/10 rounded-lg m-4">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>No files found in server storage.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((f, i) => {
                                const isSelected = selectedItems.has(f.name);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => manageMode ? toggleSelection(f.name) : onSelect(f.url, f.type)}
                                        className={`group relative aspect-square bg-gray-100 border-2 rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md 
                                            ${manageMode && isSelected ? 'border-red-500 ring-2 ring-red-200' : 'border-transparent hover:border-ink'}
                                        `}
                                    >
                                        {f.type === 'image' ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${f.url}")` }} />
                                        ) : (
                                            <video src={f.url} className="w-full h-full object-cover" />
                                        )}

                                        {/* Overlay for selection mode */}
                                        {manageMode && (
                                            <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500/20' : 'bg-transparent group-hover:bg-black/10'}`}>
                                                {isSelected && <div className="bg-red-500 text-white p-1 rounded-full"><Trash2 size={16} /></div>}
                                            </div>
                                        )}

                                        {!manageMode && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />}

                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {f.name}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer for Manage Mode */}
                {manageMode && selectedItems.size > 0 && (
                    <div className="p-4 bg-red-50 border-t border-red-100 flex justify-between items-center animate-in slide-in-from-bottom duration-200">
                        <span className="text-red-800 text-xs font-bold">{selectedItems.size} items selected</span>
                        <button onClick={handleDeleteSelected} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold text-xs flex items-center gap-2 shadow-sm">
                            <Trash2 size={14} /> Delete Selected
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MediaListEditor: React.FC<{ media: MediaItem[]; onChange: (m: MediaItem[]) => void; projectId: string }> = ({ media, onChange, projectId }) => {
    const [uploading, setUploading] = useState(false);
    const [batchProgress, setBatchProgress] = useState<{ current: number, total: number } | null>(null);
    const [showLibrary, setShowLibrary] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null); // For replacing specific item

    // Grouping / Selection State
    const [manageMode, setManageMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const toggleSelection = (index: number) => {
        const newSet = new Set(selectedItems);
        const key = index.toString();
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setSelectedItems(newSet);
    };

    // Handlers
    const handleAdd = () => {
        onChange([...media, { type: 'image', aspect: 'aspect-video', caption: '', color: 'bg-gray-200', url: '' }]);
    };

    const handleRemove = (index: number) => {
        const newMedia = [...media];
        newMedia.splice(index, 1);
        onChange(newMedia);
    };

    const handleUpdate = (index: number, field: keyof MediaItem, value: any) => {
        const newMedia = [...media];
        newMedia[index] = { ...newMedia[index], [field]: value };
        onChange(newMedia);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newMedia = [...media];
        if (direction === 'up') {
            if (index === 0) return;
            [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
        } else {
            if (index === media.length - 1) return;
            [newMedia[index + 1], newMedia[index]] = [newMedia[index], newMedia[index + 1]];
        }
        onChange(newMedia);
    };

    const handleReplace = async (file: File, index: number) => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;

        setActiveIndex(index);
        setUploading(true);
        try {
            const newItem = await uploadAndCreateMedia(file, projectId);
            const newMedia = [...media];
            // Preserve existing caption and linkUrl when replacing image
            newMedia[index] = {
                ...newItem,
                caption: media[index]?.caption || newItem.caption,
                linkUrl: media[index]?.linkUrl || newItem.linkUrl,
            };
            onChange(newMedia);
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
            setActiveIndex(null);
        }
    };

    const handleBatchProcess = async (files: FileList | File[]) => {
        // Filter valid files
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
        if (validFiles.length === 0) return;

        setUploading(true);
        setBatchProgress({ current: 0, total: validFiles.length });

        const newItems: MediaItem[] = [];

        try {
            for (let i = 0; i < validFiles.length; i++) {
                setBatchProgress({ current: i + 1, total: validFiles.length });
                const item = await uploadAndCreateMedia(validFiles[i], projectId);
                newItems.push(item);
            }
            // Append all new items
            onChange([...media, ...newItems]);
        } catch (err: any) {
            console.error("Batch upload partial failure", err);
            alert("Some files failed to upload.");
            onChange([...media, ...newItems]); // Save what we got
        } finally {
            setUploading(false);
            setBatchProgress(null);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        if (activeIndex !== null) {
            // Replacing single item
            await handleReplace(e.target.files[0], activeIndex);
        } else {
            // Batch add
            await handleBatchProcess(e.target.files);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Drop on single item -> Replace
    const handleItemDrop = async (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files?.[0]) {
            await handleReplace(e.dataTransfer.files[0], index);
        }
    };

    // Drop on container -> Batch Add
    const handleContainerDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files?.length) {
            await handleBatchProcess(e.dataTransfer.files);
        }
    };

    // Trigger file input for NEW items (Multi-select)
    const triggerBatchUpload = () => {
        setActiveIndex(null);
        if (fileInputRef.current) {
            fileInputRef.current.multiple = true;
            fileInputRef.current.click();
        }
    };

    // Trigger file input for REPLACE item (Single)
    const triggerReplace = (index: number) => {
        setActiveIndex(index);
        if (fileInputRef.current) {
            fileInputRef.current.multiple = false;
            fileInputRef.current.click();
        }
    };

    const getAspectStyle = (aspectClass: string) => {
        if (aspectClass?.startsWith('aspect-[')) {
            const ratio = aspectClass.replace('aspect-[', '').replace(']', '');
            return { aspectRatio: ratio };
        }
        return {};
    };

    const handleLibrarySelect = async (url: string, type: 'image' | 'video') => {
        let aspect = 'aspect-video';

        try {
            if (type === 'image') {
                const img = new Image();
                img.src = url;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Just proceed
                });
                if (img.naturalWidth && img.naturalHeight) {
                    aspect = `aspect-[${img.naturalWidth}/${img.naturalHeight}]`;
                }
            } else if (type === 'video') {
                const video = document.createElement('video');
                video.src = url;
                await new Promise((resolve) => {
                    video.onloadedmetadata = resolve;
                    video.onerror = resolve;
                });
                if (video.videoWidth && video.videoHeight) {
                    aspect = `aspect-[${video.videoWidth}/${video.videoHeight}]`;
                }
            }
        } catch (e) {
            console.warn("Library aspect detection failed", e);
        }

        onChange([...media, { type, url, aspect, caption: '', color: 'bg-gray-200' }]);
        setShowLibrary(false);
    };

    const handleGroupItems = () => {
        const itemsToGroup = media.filter((_, i) => selectedItems.has(i.toString()));
        if (itemsToGroup.length < 2) return;

        const newGroup: MediaItem = {
            type: 'gallery',
            url: itemsToGroup[0].url, // Use first item as cover
            aspect: itemsToGroup[0].aspect,
            color: itemsToGroup[0].color,
            items: itemsToGroup
        };

        const newMedia = media.filter((_, i) => !selectedItems.has(i.toString()));
        newMedia.push(newGroup);
        onChange(newMedia);
        setSelectedItems(new Set());
        setManageMode(false);
    };

    const handleUngroup = (index: number) => {
        const group = media[index];
        if (!group.items) return;

        const newMedia = [...media];
        newMedia.splice(index, 1, ...group.items);
        onChange(newMedia);
    };

    return (
        <div
            className={`space-y-4 relative rounded-lg transition-all ${uploading && !activeIndex ? 'ring-2 ring-ink ring-opacity-50 bg-gray-50' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleContainerDrop}
        >
            {/* Global Loader for Batch */}
            {batchProgress && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                    <Loader className="w-8 h-8 animate-spin text-ink mb-2" />
                    <div className="font-bold text-ink">Uploading {batchProgress.current} of {batchProgress.total}</div>
                </div>
            )}

            {showLibrary && (
                <MediaLibraryModal projectId={projectId} onClose={() => setShowLibrary(false)} onSelect={handleLibrarySelect} />
            )}

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />

            <h4 className="font-bold border-b border-ink/10 pb-1 flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider">
                <span>Gallery Media ({media.length})</span>
                <button
                    onClick={() => setManageMode(!manageMode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${manageMode ? 'bg-ink text-white border-ink' : 'bg-transparent text-gray-400 border-gray-200 hover:border-ink/50 hover:text-ink'}`}
                >
                    {manageMode ? 'Done' : 'Select / Grp'}
                </button>
            </h4>

            {manageMode && (
                <div className="flex gap-2 mb-2 bg-yellow-50 p-2 border border-yellow-200 rounded items-center justify-between animate-in slide-in-from-top-2">
                    <span className="text-xs font-bold text-yellow-800 ml-1">{selectedItems.size} selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleGroupItems}
                            disabled={selectedItems.size < 2}
                            className="px-3 py-1 bg-ink text-white rounded text-xs font-bold hover:shadow-md disabled:opacity-50 flex items-center gap-1"
                        >
                            <Database size={12} /> Group
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4 min-h-[100px]">
                {media.map((item, idx) => (
                    <div
                        key={idx}
                        className={`bg-paper p-3 border rounded relative group transition-all duration-300 ${selectedItems.has(idx.toString()) ? 'border-ink ring-1 ring-ink' : 'border-ink/20'}`}
                        onClick={() => manageMode && toggleSelection(idx)}
                    >
                        {/* Header Actions */}
                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                            {manageMode ? (
                                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${selectedItems.has(idx.toString()) ? 'bg-ink border-ink text-white' : 'border-gray-300 bg-white'}`}>
                                    {selectedItems.has(idx.toString()) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMove(idx, 'up'); }}
                                        disabled={idx === 0}
                                        className="p-1 text-gray-400 hover:text-ink disabled:opacity-30 hover:bg-white rounded transition-colors"
                                        title="Move Up"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleMove(idx, 'down')}
                                        disabled={idx === media.length - 1}
                                        className="p-1 text-gray-400 hover:text-ink disabled:opacity-30 hover:bg-white rounded transition-colors"
                                        title="Move Down"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                    <div className="w-px h-4 bg-gray-300 mx-1 self-center" />
                                    <button onClick={() => handleRemove(idx)} className="p-1 text-red-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                                        <X size={14} />
                                    </button>
                                </>
                            )}
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start mt-2">
                            {/* Drop Zone / Preview */}
                            <div
                                className={`sm:col-span-3 ${!item.aspect.startsWith('aspect-[') ? item.aspect : ''} ${item.color} flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-ink/20 rounded bg-cover bg-center cursor-pointer hover:bg-gray-100 transition-colors relative`}
                                style={{
                                    backgroundImage: item.url ? `url("${item.url}")` : undefined,
                                    ...getAspectStyle(item.aspect)
                                }}
                                onDrop={(e) => handleItemDrop(e, idx)}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => triggerReplace(idx)}
                            >
                                {uploading && activeIndex === idx && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold z-20">
                                        <Loader className="animate-spin w-4 h-4 mr-1" />
                                    </div>
                                )}
                                {item.type === 'gallery' && (
                                    <>
                                        <div className="absolute top-2 left-2 bg-ink text-white text-[10px] font-bold px-1.5 rounded flex items-center gap-1 z-20">
                                            <Database size={10} /> {item.items?.length}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUngroup(idx); }}
                                            className="absolute bottom-2 right-2 bg-white text-ink text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-ink/10 hover:bg-gray-50 z-20"
                                        >
                                            Ungroup
                                        </button>
                                    </>
                                )}
                                {!item.url && (item.type === 'video' ? <Film className="text-gray-400 mb-1" size={20} /> : <ImageIcon className="text-gray-400 mb-1" size={20} />)}
                            </div>

                            {/* Fields */}
                            <div className="sm:col-span-9 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400">Type</label>
                                    <select
                                        className="w-full bg-white border border-ink/20 rounded px-1 py-1 text-xs"
                                        value={item.type}
                                        onChange={e => handleUpdate(idx, 'type', e.target.value)}
                                    >
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400">Aspect</label>
                                    <input
                                        className="w-full bg-white border border-ink/20 rounded px-1 py-1 text-xs font-mono disabled:opacity-50"
                                        value={item.aspect}
                                        onChange={e => handleUpdate(idx, 'aspect', e.target.value)}
                                        placeholder="aspect-video"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400">URL</label>
                                    <input
                                        className="w-full bg-white border border-ink/20 rounded px-2 py-1 text-xs font-mono"
                                        placeholder="https://..."
                                        value={item.url || ''}
                                        onChange={e => handleUpdate(idx, 'url', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400">Caption</label>
                                    <input
                                        className="w-full bg-white border border-ink/20 rounded px-2 py-1 text-xs"
                                        placeholder="Description..."
                                        value={item.caption || ''}
                                        onChange={e => handleUpdate(idx, 'caption', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400">Link URL (optional)</label>
                                    <input
                                        className="w-full bg-white border border-ink/20 rounded px-2 py-1 text-xs font-mono"
                                        placeholder="/projects/demo/ or https://..."
                                        value={item.linkUrl || ''}
                                        onChange={e => handleUpdate(idx, 'linkUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {media.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-ink/10 rounded-lg text-gray-400 text-xs flex flex-col items-center gap-2 select-none group-hover:border-ink/30 transition-colors">
                        <Upload className="opacity-20 mb-2" size={32} />
                        <span className="font-bold">Drop files here to batch upload</span>
                        <span className="opacity-50">or use the buttons below</span>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={() => setShowLibrary(true)} type="button" className="py-3 px-4 bg-white border-2 border-ink text-ink rounded font-bold hover:bg-gray-50 text-xs flex items-center justify-center gap-2 shadow-sm">
                    <Database size={14} /> Library
                </button>
                {showLibrary && (
                    <BlogMediaLibraryModal
                        isOpen={showLibrary}
                        onClose={() => setShowLibrary(false)}
                        onSelect={(url) => {
                            // Inline logic to add new item
                            const newItem: MediaItem = {
                                type: 'image',
                                url,
                                aspect: 'aspect-video',
                                caption: '',
                                items: []
                            };
                            onChange([...media, newItem]);
                            setShowLibrary(false);
                        }}
                    />
                )}
                <button onClick={triggerBatchUpload} type="button" className="flex-1 py-3 bg-white border-2 border-ink text-ink rounded font-bold hover:bg-gray-50 text-xs flex items-center justify-center gap-2 shadow-sm">
                    <Upload size={14} /> Batch Upload
                </button>
                <button onClick={handleAdd} type="button" className="flex-1 py-3 bg-ink text-white border-2 border-transparent rounded font-bold hover:opacity-90 text-xs flex items-center justify-center gap-2 shadow-sm">
                    <Plus size={14} /> Add Empty Item
                </button>
            </div>
        </div>
    );
};

const SkillsEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [localSkills, setLocalSkills] = useState<{ id: string, data: Skill }[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Skill | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'skills'), orderBy('value', 'desc'));
        const unsub = onSnapshot(q, snap => {
            console.log("Skills snapshot update, docs:", snap.size);
            setLocalSkills(snap.docs.map(d => ({ id: d.id, data: d.data() as Skill })));
        }, (error) => {
            console.error("Skills snapshot error:", error);
        });
        return unsub;
    }, []);

    const handleEdit = (skill: Skill, id: string) => {
        setEditingId(id);
        setFormData({ ...skill });
        setDeleteConfirm(null); // Reset confirm state
    };

    const handleCreate = () => {
        setEditingId('new');
        setFormData({ name: '', desc: '', value: 80, bg: 'bg-gray-200', category: 'Core' });
        setDeleteConfirm(null);
    };

    const saveSkill = async () => {
        if (!formData) return;
        try {
            if (editingId === 'new') {
                await addDoc(collection(db, 'skills'), formData);
            } else if (editingId) {
                await setDoc(doc(db, 'skills', editingId), formData);
            }
            setEditingId(null);
            setFormData(null);
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    const deleteSkill = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'skills', id));
            setEditingId(null);
            setFormData(null);
            setDeleteConfirm(null);
        } catch (e: any) {
            alert("Error deleting: " + e.message);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header matching Projects tab */}
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <Star size={16} /> All Skills <span className="text-xs font-normal text-gray-500">({localSkills.length})</span>
            </h3>

            <div className="flex h-[600px] bg-white border-2 border-ink rounded-lg shadow-sm overflow-hidden">
                {/* List - styled like Projects table */}
                <div className="w-1/3 border-r border-ink/10 bg-gray-50 flex flex-col">
                    <div className="p-4 border-b-2 border-ink/10 flex justify-between items-center bg-white">
                        <span className="text-xs font-bold uppercase text-gray-500">Skill List</span>
                        <button onClick={handleCreate} className="bg-ink text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1"><Plus size={12} /> New</button>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-ink/5">
                        {localSkills.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
                                <p className="text-xs text-ink font-bold">Database empty.</p>
                                <button
                                    onClick={async () => {
                                        if (!confirm("Restore default skills from constants?")) return;
                                        try {
                                            for (const s of SKILLS) {
                                                await addDoc(collection(db, 'skills'), s);
                                            }
                                        } catch (e: any) { alert(e.message); }
                                    }}
                                    className="px-4 py-2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 rounded font-bold hover:bg-yellow-200 transition-colors text-xs"
                                >
                                    Restore Defaults
                                </button>
                            </div>
                        )}
                        {localSkills.map(({ id, data }) => (
                            <div key={id} onClick={() => handleEdit(data, id)} className={`p-4 cursor-pointer transition-all ${editingId === id ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">{data.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-ink/10 ${data.bg}`}>{data.value}%</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">{data.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 bg-white p-8 overflow-y-auto">
                    {editingId ? (
                        <div className="max-w-md mx-auto space-y-4">
                            <h3 className="font-bold text-xl border-b-2 border-ink/10 pb-2 mb-6">
                                {editingId === 'new' ? 'New Skill' : 'Edit Skill'}
                            </h3>

                            {formData && (
                                <>

                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Skill Name</label>
                                        <input className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none font-bold transition-colors" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Description (Role/Context)</label>
                                        <input className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none transition-colors" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Value (0-100)</label>
                                            <input type="number" className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none transition-colors" value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Category</label>
                                            <input className="w-full border-2 border-ink/20 focus:border-ink p-2 rounded outline-none transition-colors" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Color Class</label>
                                        <div className="flex flex-wrap gap-2 p-2 border-2 border-ink/20 rounded bg-gray-50">
                                            {[
                                                'bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-yellow-200',
                                                'bg-orange-200', 'bg-purple-200', 'bg-pink-200', 'bg-gray-200',
                                                'bg-cyan-200', 'bg-teal-200', 'bg-indigo-200', 'bg-rose-200'
                                            ].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setFormData({ ...formData, bg: c })}
                                                    className={`w-6 h-6 rounded-full border border-ink/20 shadow-sm hover:scale-110 transition-transform ${c} ${formData.bg === c ? 'ring-2 ring-offset-1 ring-ink' : ''}`}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                        <input className="w-full border-2 border-ink/20 p-2 rounded mt-2 text-xs text-gray-400" placeholder="Custom class..." value={formData.bg} onChange={e => setFormData({ ...formData, bg: e.target.value })} />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button type="button" onClick={saveSkill} className="flex-1 bg-ink text-white py-2 rounded font-bold shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                                            <Save size={14} /> Save
                                        </button>
                                        {editingId && editingId !== 'new' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (deleteConfirm === editingId) {
                                                        deleteSkill(editingId);
                                                    } else {
                                                        setDeleteConfirm(editingId);
                                                    }
                                                }}
                                                className={`px-4 border-2 rounded font-bold transition-all ${deleteConfirm === editingId ? 'bg-red-500 border-red-700 text-white animate-pulse' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                                            >
                                                {deleteConfirm === editingId ? 'Confirm Delete?' : 'Delete'}
                                            </button>
                                        )}
                                    </div>
                                </>

                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Database size={32} />
                            </div>
                            <p className="font-bold">Select a skill to edit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProjectEditor: React.FC<{ project?: Project | null; onSave: (p: Project) => void; onCancel: () => void }> = ({ project, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Project>(project || {
        id: Date.now().toString(),
        title: "", category: "Web", year: new Date().getFullYear().toString(), role: "", tags: [], outcome: "", color: "bg-gray-200", featured: false, oneLiner: "",
        content: { overview: "", stack: [], results: [], challenges: "", solutions: "" },
        media: []
    });

    const handleChange = (field: keyof Project, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleContentChange = (field: keyof Project['content'], value: any) => setFormData(prev => ({ ...prev, content: { ...prev.content, [field]: value } }));

    return (
        <div className="fixed inset-0 bg-bg z-50 overflow-y-auto">
            <div className="min-h-screen px-5 md:px-10 py-8 md:py-12">
                <div className="max-w-[1500px] mx-auto">
                <div className="sticky top-0 z-30 -mx-5 md:-mx-10 px-5 md:px-10 py-4 mb-10 bg-bg/85 backdrop-blur-xl border-b border-ink/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink/40 mb-3">Project Editor</p>
                        <h3 className="font-display font-medium text-5xl md:text-7xl leading-none">{project ? 'Edit Project' : 'New Project'}</h3>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-5 py-3 text-ink/55 font-bold hover:text-ink rounded-full border border-ink/10 hover:border-ink/30 bg-white/40">Cancel</button>
                        <button onClick={() => onSave(formData)} className="px-6 py-3 bg-ink text-bg font-bold rounded-full shadow-sm hover:shadow-md flex items-center gap-2">
                            <Save size={16} /> Save Project
                        </button>
                    </div>
                </div>



                <div className="space-y-10 pb-32">
                    {/* Cover Image Section */}
                    <div className="bg-white/55 backdrop-blur p-6 md:p-8 rounded-[32px] border border-ink/10 grid lg:grid-cols-[420px_minmax(0,1fr)] gap-8 items-center">
                        <div
                            className="w-full aspect-video bg-gray-200 border border-dashed border-ink/20 rounded-[28px] flex items-center justify-center cursor-pointer hover:bg-gray-100 bg-cover bg-center relative group overflow-hidden"
                            style={{ backgroundImage: formData.coverImage ? `url("${formData.coverImage}")` : undefined }}
                            onClick={() => document.getElementById('cover-upload')?.click()}
                        >
                            {!formData.coverImage && <span className="text-[10px] text-gray-500 font-bold uppercase">Cover</span>}
                            {formData.coverImage && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]">
                                    Change
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <h4 className="font-display font-medium text-3xl">Cover Image</h4>
                            <p className="text-sm leading-7 text-ink/55 max-w-xl">Used for the project card thumbnail and homepage previews. A wide image works best, but the public page now keeps the full image visible.</p>
                            <input
                                id="cover-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        const storageRef = ref(storage, `project-media/${formData.id}/cover_${file.name}`);
                                        await uploadBytes(storageRef, file);
                                        const url = await getDownloadURL(storageRef);
                                        handleChange('coverImage', url);
                                    }
                                }}
                            />
                            {formData.coverImage && (
                                <button onClick={() => handleChange('coverImage', '')} className="text-xs text-red-500 underline">Remove Cover</button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/55 backdrop-blur p-6 md:p-8 rounded-[32px] border border-ink/10">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-6">Basic Information</div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">ID (Unique)</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.id} onChange={e => handleChange('id', e.target.value)} disabled={!!project} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Title</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.title} onChange={e => handleChange('title', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Category</label>
                            <select className="w-full border-2 border-ink/20 p-2 rounded" value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                                {['App', 'Web', 'Unity', '3D', 'Dev'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Year</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.year} onChange={e => handleChange('year', e.target.value)} />
                        </div>
                    </div>
                    </div>

                    <div className="bg-white/55 backdrop-blur p-6 md:p-8 rounded-[32px] border border-ink/10">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-6">Case Study Copy</div>
                    <div className="grid lg:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Overview</label>
                            <textarea className="w-full border-2 border-ink/20 p-2 rounded h-24" value={formData.content.overview} onChange={e => handleContentChange('overview', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Challenge</label>
                            <textarea className="w-full border-2 border-ink/20 p-2 rounded h-24" value={formData.content.challenges} onChange={e => handleContentChange('challenges', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Solution</label>
                            <textarea className="w-full border-2 border-ink/20 p-2 rounded h-24" value={formData.content.solutions} onChange={e => handleContentChange('solutions', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">One Liner</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.oneLiner} onChange={e => handleChange('oneLiner', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Key Outcome</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.outcome} onChange={e => handleChange('outcome', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Tech Stack (comma sep)</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.content.stack.join(', ')} onChange={e => handleContentChange('stack', e.target.value.split(',').map((s: string) => s.trim()))} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase mb-1 flex items-center gap-2"><Globe size={12} /> Demo URL (Optional)</label>
                            <input placeholder="https://..." className="w-full border-2 border-ink/20 p-2 rounded" value={formData.demoUrl || ''} onChange={e => handleChange('demoUrl', e.target.value)} />
                        </div>
                        <div className="col-span-2 flex items-center gap-2 p-3 bg-paper rounded border border-ink/10">
                            <input
                                type="checkbox"
                                id="featured-toggle"
                                checked={formData.featured}
                                onChange={e => handleChange('featured', e.target.checked)}
                                className="w-5 h-5 text-ink rounded border-gray-300 focus:ring-ink"
                            />
                            <label htmlFor="featured-toggle" className="text-sm font-bold cursor-pointer select-none">Featured / Pin to Dashboard</label>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white/55 backdrop-blur p-6 md:p-8 rounded-[32px] border border-ink/10">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-6">Tags & Visual Category</div>
                    <div className="grid lg:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Tags (comma sep)</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.tags.join(', ')} onChange={e => handleChange('tags', e.target.value.split(',').map((s: string) => s.trim()))} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Color Class</label>
                            <div className="flex flex-wrap gap-2 p-2 border-2 border-ink/20 rounded bg-gray-50 max-h-32 overflow-y-auto">
                                {[
                                    'bg-cat-unity', 'bg-cat-web', 'bg-cat-app', 'bg-cat-3d', 'bg-tape',
                                    'bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-yellow-200',
                                    'bg-orange-200', 'bg-purple-200', 'bg-pink-200', 'bg-gray-200', 'bg-slate-200'
                                ].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleChange('color', c)}
                                        className={`w-6 h-6 rounded-full border border-ink/20 shadow-sm hover:scale-110 transition-transform ${c} ${formData.color === c ? 'ring-2 ring-offset-1 ring-ink' : ''}`}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white/55 backdrop-blur p-6 md:p-8 rounded-[32px] border border-ink/10">
                        <MediaListEditor
                            media={formData.media || []}
                            onChange={(newMedia) => handleChange('media', newMedia)}
                            projectId={formData.id}
                        />
                    </div>
                </div>

                </div>
                </div>
        </div>
    );
};

type AdminTab = 'projects' | 'skills' | 'settings' | 'dev_diary';

const ADMIN_TABS: Array<{
    id: AdminTab;
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}> = [
    {
        id: 'projects',
        label: 'Projects',
        eyebrow: 'Portfolio Library',
        title: 'Curate the work shelf.',
        description: 'Edit featured projects, visual media, categories, and the public case-study order.',
        icon: <Database size={14} />
    },
    {
        id: 'skills',
        label: 'Skills',
        eyebrow: 'Capability Index',
        title: 'Tune the skill language.',
        description: 'Keep the resume and experience vocabulary aligned with the public site.',
        icon: <Star size={14} />
    },
    {
        id: 'settings',
        label: 'Settings',
        eyebrow: 'Site Atmosphere',
        title: 'Shape the first impression.',
        description: 'Manage profile copy, homepage photo, welcome text, music, and widget details.',
        icon: <Wrench size={14} />
    },
    {
        id: 'dev_diary',
        label: 'Dev Diary',
        eyebrow: 'Notebook Entries',
        title: 'Draft the process archive.',
        description: 'Write and compose long-form build notes with media blocks and sections.',
        icon: <BookOpen size={14} />
    }
];

const AdminApp: React.FC = () => {
    const { user, loading } = useAuth();
    const { projects } = useProjects();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const [activeTab, setActiveTab] = useState<AdminTab>('projects');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const activeTabMeta = ADMIN_TABS.find(tab => tab.id === activeTab) || ADMIN_TABS[0];
    const featuredCount = projects.filter(project => project.featured).length;
    const tabButtonClass = (tab: typeof activeTab) =>
        `px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border transition-all whitespace-nowrap ${activeTab === tab
            ? 'bg-ink text-bg border-ink shadow-sm'
            : 'bg-white/45 text-ink/55 border-ink/10 hover:text-ink hover:border-accent/40 hover:bg-white/80'
        }`;

    const handleLogin = async (e: React.FormEvent) => {
        // ... (login logic)
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };
    /* ... existing helpers ... */




    const handleSeedSkills = async () => {
        if (!confirm("Overwrite SKILLS in DB with static data?")) return;
        setMsg("Seeding skills...");
        try {
            // Delete existing? Nah, just add/overwrite if we could match IDs but we don't have IDs.
            // Let's just add them for now, user can delete duplicates in UI.
            // Actually, a better seed is to clear and add.
            // For safety, just adding.
            for (const s of SKILLS) {
                await addDoc(collection(db, 'skills'), s);
            }
            setMsg("Skills seeded!");
        } catch (e: any) {
            setMsg("Error: " + e.message);
        }
    };

    const handleSeed = async () => {
        console.log("Starting migration...");
        setMsg('Seeding... check console for details.');

        try {
            console.log("Projects to migrate:", PROJECTS);
            const collectionRef = collection(db, 'projects');

            for (const p of PROJECTS) {
                console.log("Writing project:", p.id);
                try {
                    await Promise.race([
                        setDoc(doc(db, 'projects', p.id), p),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Firestore write took too long. Check if Database is created in Console.")), 5000))
                    ]);
                    console.log("Success:", p.id);
                } catch (innerErr: any) {
                    console.error("Failed to write project:", p.id, innerErr);
                    alert(`Failed to write ${p.id}: ${innerErr.message}`);
                    throw innerErr;
                }
            }
            setMsg('Success! Projects migrated. Refresh page.');
            alert('Migration Successful!');
        } catch (err: any) {
            console.error("Migration Error:", err);
            setMsg('Error: ' + err.message);
            alert('Error: ' + err.message);
        }
    };

    const handleSaveProject = async (p: Project) => {
        try {
            // Clean undefined values - Firestore doesn't accept undefined
            const cleanData = JSON.parse(JSON.stringify(p, (key, value) => value === undefined ? null : value));
            await setDoc(doc(db, 'projects', p.id), cleanData);
            setIsEditing(false);
            setCurrentProject(null);
            alert('Saved successfully!');
        } catch (err: any) {
            alert('Save failed: ' + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(`Delete project ${id}?`)) return;
        try {
            await deleteDoc(doc(db, 'projects', id));
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    if (loading) return (
        <div className="admin-modern min-h-screen flex items-center justify-center bg-bg text-ink">
            <div className="rounded-full border-2 border-ink bg-white px-5 py-3 font-mono text-xs uppercase tracking-widest shadow-paper">
                Loading auth...
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="admin-modern min-h-screen flex flex-col items-center justify-center bg-bg p-6 text-ink relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="relative w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center"
                >
                    <div className="hidden lg:block">
                        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink/45 mb-6">Private Editorial Desk</p>
                        <h1 className="font-display text-7xl xl:text-8xl leading-[0.9] font-medium max-w-2xl">
                            Admin
                            <span className="block text-accent italic">workspace.</span>
                        </h1>
                        <div className="mt-10 h-2 w-40 rounded-full bg-ink/10 overflow-hidden">
                            <div className="h-full w-20 rounded-full bg-accent" />
                        </div>
                        <p className="mt-8 max-w-md text-sm leading-7 text-ink/55">
                            A quiet control surface for shaping the portfolio, notebook, homepage image, and public-facing profile details.
                        </p>
                    </div>
                    <div className="relative bg-white/70 backdrop-blur-xl p-8 md:p-10 border border-ink/10 shadow-paper max-w-md w-full rounded-[34px] justify-self-center">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/45 mb-3">Restricted Access</p>
                                <h2 className="text-4xl md:text-5xl font-display font-medium leading-none">Sign in</h2>
                            </div>
                            <div className="w-14 h-14 bg-bg rounded-full flex items-center justify-center border border-ink/10">
                                <Lock className="w-6 h-6 text-accent" />
                            </div>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-ink/50">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-ink/50">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-accent text-xs font-bold leading-5">{error}</p>}
                            <button className="w-full bg-ink text-bg py-4 font-bold rounded-full hover:-translate-y-0.5 hover:shadow-paper-hover transition-all">
                                Authenticate
                            </button>
                        </form>
                        <div className="mt-6 text-[10px] text-ink/40 font-mono uppercase tracking-widest">
                            Authorized personnel only.
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="admin-modern min-h-screen bg-bg text-ink relative overflow-hidden">
            <div className="fixed inset-0 dot-pattern pointer-events-none" />
            <div className="fixed left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-ink/5 pointer-events-none" />
            {/* Project Editor Modal - Remains as overlay for creation/editing projects */}
            {isEditing && (
                <ProjectEditor
                    project={currentProject}
                    onSave={handleSaveProject}
                    onCancel={() => { setIsEditing(false); setCurrentProject(null); }}
                />
            )}

            <div className="relative z-10 px-5 md:px-10 pt-8 md:pt-12 pb-16">
                <div className="max-w-[1500px] mx-auto">
                    <motion.header
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                        className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-12 md:gap-16 items-end mb-16"
                    >
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-ink/45 mb-6">Content Control Room</p>
                            <h1 className="font-display text-[18vw] sm:text-8xl lg:text-9xl leading-[0.82] font-medium tracking-normal">
                                Admin
                                <span className="block italic text-accent">Studio.</span>
                            </h1>
                        </div>
                        <div className="space-y-8">
                            <p className="text-base md:text-lg leading-8 text-ink/60">
                                A quiet editing surface for the portfolio, homepage atmosphere, notebook entries, and public profile details.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/45">{user.email}</span>
                                <button onClick={() => signOut(auth)} className="bg-white/60 backdrop-blur border border-ink/10 hover:border-accent/50 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5">
                                    <LogOut size={12} /> Logout
                                </button>
                            </div>
                        </div>
                    </motion.header>

                    <div className="grid xl:grid-cols-[280px_minmax(0,1fr)] gap-10 md:gap-14 items-start">
                        <aside className="xl:sticky xl:top-10 space-y-8">
                            <nav className="space-y-3">
                                {ADMIN_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`group w-full text-left rounded-[28px] border p-5 transition-all ${activeTab === tab.id
                                            ? 'bg-ink text-bg border-ink shadow-paper'
                                            : 'bg-white/45 backdrop-blur border-ink/10 hover:bg-white/80 hover:border-accent/40'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <span className={`font-mono text-[10px] uppercase tracking-[0.28em] ${activeTab === tab.id ? 'text-bg/60' : 'text-ink/40'}`}>{tab.eyebrow}</span>
                                            <span className={`w-8 h-8 rounded-full border flex items-center justify-center ${activeTab === tab.id ? 'border-bg/20 text-bg' : 'border-ink/10 text-accent group-hover:border-accent/40'}`}>
                                                {tab.icon}
                                            </span>
                                        </div>
                                        <div className="mt-5 text-2xl font-display font-medium">{tab.label}</div>
                                    </button>
                                ))}
                            </nav>
                            <div className="rounded-[32px] border border-ink/10 bg-white/45 backdrop-blur p-6">
                                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/40 mb-5">Library Pulse</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-4xl font-display font-medium">{projects.length}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-ink/40 mt-1">Projects</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-display font-medium text-accent">{featuredCount}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-ink/40 mt-1">Featured</div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <main className="min-w-0">
                            <motion.section
                                key={`${activeTab}-intro`}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
                                className="mb-12"
                            >
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {ADMIN_TABS.map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabButtonClass(tab.id)}>
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink/45 mb-4">{activeTabMeta.eyebrow}</p>
                                <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-end">
                                    <h2 className="font-display text-5xl md:text-7xl leading-[0.92] font-medium max-w-4xl">{activeTabMeta.title}</h2>
                                    <p className="text-sm leading-7 text-ink/55">{activeTabMeta.description}</p>
                                </div>
                                <div className="mt-10 h-px bg-ink/10">
                                    <div className="h-px w-40 bg-accent" />
                                </div>
                            </motion.section>

                            <AnimatePresence mode="wait">
                                {activeTab === 'projects' && (
                                    <motion.div
                                        key="projects"
                                        initial={{ opacity: 0, y: 28 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                                        className="space-y-12"
                                    >
                                        <section className="grid md:grid-cols-[1fr_1fr] gap-4">
                                            <button
                                                onClick={() => { setCurrentProject(null); setIsEditing(true); }}
                                                className="group min-h-44 rounded-[34px] bg-ink text-bg p-8 text-left transition-all hover:-translate-y-1 hover:shadow-paper-hover"
                                            >
                                                <Plus size={22} className="mb-8 text-accent group-hover:rotate-90 transition-transform" />
                                                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bg/50 mb-3">Primary Action</div>
                                                <div className="text-3xl font-display font-medium">Create New Project</div>
                                            </button>
                                            <div className="rounded-[34px] border border-ink/10 bg-white/45 backdrop-blur p-8">
                                                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-5">System Tools</div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button onClick={handleSeed} className="px-4 py-2 bg-white/70 border border-ink/10 rounded-full text-xs font-bold hover:border-accent/50 transition-colors">
                                                        Re-seed Projects
                                                    </button>
                                                    <button onClick={handleSeedSkills} className="px-4 py-2 bg-white/70 border border-ink/10 rounded-full text-xs font-bold hover:border-accent/50 transition-colors">
                                                        Seed Skills
                                                    </button>
                                                </div>
                                                {msg && <p className="mt-5 text-xs leading-6 text-ink/55">{msg}</p>}
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center justify-between gap-6 mb-6">
                                                <div>
                                                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-2">Existing Projects</p>
                                                    <h3 className="text-3xl font-display font-medium">{projects.length} entries</h3>
                                                </div>
                                                <div className="hidden md:block h-px flex-1 bg-ink/10 max-w-xs" />
                                            </div>
                                            <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-5">
                                                {projects.map((p, index) => (
                                                    <motion.article
                                                        key={p.id}
                                                        initial={{ opacity: 0, y: 24 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.3), ease: [0.76, 0, 0.24, 1] }}
                                                        className="group rounded-[32px] border border-ink/10 bg-white/55 backdrop-blur p-6 hover:bg-white/85 hover:border-accent/40 transition-all"
                                                    >
                                                        <div className="flex items-start justify-between gap-4 mb-10">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-ink/10 ${p.color}`}>
                                                                {p.category}
                                                            </span>
                                                            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/35">{p.year}</span>
                                                        </div>
                                                        <h4 className="text-3xl font-display font-medium leading-none mb-4">{p.title}</h4>
                                                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/35 break-all">{p.id}</p>
                                                        <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4">
                                                            <button
                                                                onClick={() => { setCurrentProject(p); setIsEditing(true); }}
                                                                className="text-xs font-bold rounded-full px-4 py-2 bg-ink text-bg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                                            >
                                                                <Edit2 size={14} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="text-xs font-bold rounded-full px-4 py-2 border border-ink/10 text-accent hover:border-accent/50 transition-colors flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </motion.article>
                                                ))}
                                                {projects.length === 0 && (
                                                    <div className="md:col-span-2 2xl:col-span-3 rounded-[32px] border border-dashed border-ink/15 bg-white/35 p-12 text-center text-ink/45">
                                                        No projects found. Create one or use the seed tools.
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </motion.div>
                                )}

                                {activeTab === 'skills' && (
                                    <motion.div key="skills" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}>
                                        <SkillsEditor onClose={() => setActiveTab('projects')} />
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }} className="max-w-5xl">
                                        <SettingsEditor />
                                    </motion.div>
                                )}

                                {activeTab === 'dev_diary' && (
                                    <motion.div key="dev_diary" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}>
                                        <DevDiaryEditor />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AdminApp;
