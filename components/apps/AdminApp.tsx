import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, storage } from '../../src/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { doc, setDoc, deleteDoc, collection, addDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { Project, MediaItem, Skill, SiteSettings, BlogPost, PostType, ContentBlock, PostSection } from '../../types';
import { Lock, LogOut, Upload, Database, Plus, Trash2, Edit2, Save, Image as ImageIcon, Film, X, Loader, ArrowUp, ArrowDown, Star, Globe, Copy, Wrench, Music, User, Pin, Download, BookOpen, GripVertical, FileText, Video } from 'lucide-react';
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

    const addBlock = (type: 'text' | 'image' | 'video') => {
        const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: ''
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
            <div className="flex gap-2 mt-3 opacity-50 hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => addBlock('text')} className="px-2 py-1 bg-gray-100 hover:bg-white border border-transparent hover:border-ink/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <FileText size={10} /> Add Text
                </button>
                <button type="button" onClick={() => addBlock('image')} className="px-2 py-1 bg-gray-100 hover:bg-white border border-transparent hover:border-ink/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <ImageIcon size={10} /> Add Image
                </button>
                <button type="button" onClick={() => addBlock('video')} className="px-2 py-1 bg-gray-100 hover:bg-white border border-transparent hover:border-ink/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <Video size={10} /> Add Video
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
            tagline: "Unity Dev • Tech Artist • Turku, Finland 🇫🇮"
        },
        widgets: {
            toolboxTitle: "Toolbox",
            toolboxColor: ""
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
            newMedia[index] = newItem;
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto border-2 border-ink shadow-floating rounded-lg flex flex-col mb-20">
                <div className="p-4 border-b-2 border-ink/10 flex justify-between items-center bg-paper sticky top-0 z-10">
                    <h3 className="font-bold text-lg">{project ? 'Edit Project' : 'New Project'}</h3>
                    <button onClick={onCancel} className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center font-bold">x</button>
                </div>



                <div className="p-6 space-y-4">
                    {/* Cover Image Section */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-ink/10 flex gap-4 items-center">
                        <div
                            className="w-32 aspect-video bg-gray-200 border-2 border-dashed border-ink/20 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100 bg-cover bg-center relative group"
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
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Cover Image</h4>
                            <p className="text-xs text-gray-500 mb-2">Used for the project card thumbnail. Should be 16:9 aspect ratio.</p>
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="bg-gray-50 p-4 rounded-lg border border-ink/10">
                        <MediaListEditor
                            media={formData.media || []}
                            onChange={(newMedia) => handleChange('media', newMedia)}
                            projectId={formData.id}
                        />
                    </div>
                </div>

                <div className="p-4 border-t-2 border-ink/10 flex justify-end gap-2 bg-gray-50">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 bg-ink text-white font-bold rounded shadow-sm hover:shadow-md flex items-center gap-2">
                        <Save size={16} /> Save Project
                    </button>
                </div>
            </div>
        </div >
    );
};

const AdminApp: React.FC = () => {
    const { user, loading } = useAuth();
    const { projects } = useProjects();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'settings' | 'dev_diary'>('projects');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

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
            await setDoc(doc(db, 'projects', p.id), p);
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

    if (loading) return <div className="p-8 text-center">Loading auth...</div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-paper p-8">
                <div className="bg-white p-8 border-2 border-ink shadow-paper max-w-sm w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-ink">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6 font-hand">System Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Email</label>
                            <input
                                className="w-full border-2 border-ink/20 p-2 rounded focus:border-ink outline-none"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Password</label>
                            <input
                                className="w-full border-2 border-ink/20 p-2 rounded focus:border-ink outline-none"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                        <button className="w-full bg-ink text-white py-2 font-bold rounded hover:shadow-lg transition-shadow">
                            Authenticate
                        </button>
                    </form>
                    <div className="mt-4 text-[10px] text-gray-400 text-center">
                        Restricted Area. Authorized Personnel Only.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-paper relative">
            {/* Project Editor Modal - Remains as overlay for creation/editing projects */}
            {isEditing && (
                <ProjectEditor
                    project={currentProject}
                    onSave={handleSaveProject}
                    onCancel={() => { setIsEditing(false); setCurrentProject(null); }}
                />
            )}

            <div className="bg-ink text-white p-4 flex flex-col md:flex-row justify-between items-center z-10 shadow-md gap-4">
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <h1 className="text-xl font-bold font-hand flex items-center gap-2">
                        <Database className="text-tape" /> Admin Console
                    </h1>
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-3 py-1 rounded font-bold text-xs ${activeTab === 'projects' ? 'bg-white text-ink' : 'text-gray-400 hover:text-white'}`}
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${activeTab === 'skills' ? 'bg-white text-ink' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Star size={12} /> Skills
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${activeTab === 'settings' ? 'bg-white text-ink' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Wrench size={12} /> Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('dev_diary')}
                            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 ${activeTab === 'dev_diary' ? 'bg-white text-ink' : 'text-gray-400 hover:text-white'}`}
                        >
                            <BookOpen size={12} /> Dev Diary
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">Logged in as {user.email}</span>
                    <button onClick={() => signOut(auth)} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <LogOut size={12} /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">

                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                    <div className="animate-fade-in">
                        <h3 className="font-bold border-b border-ink/10 pb-2 mb-4 flex items-center gap-2">
                            <Plus size={16} /> Quick Actions
                        </h3>
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => { setCurrentProject(null); setIsEditing(true); }}
                                className="flex-1 py-4 bg-ink text-white rounded font-bold hover:opacity-90 text-sm flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Create New Project
                            </button>
                            <button onClick={() => setActiveTab('skills')} className="flex-1 py-4 bg-white border border-ink text-ink rounded font-bold hover:bg-gray-50 text-sm">
                                Edit Skills
                            </button>
                        </div>

                        {/* Migration Tools (Collapsed by default or small) */}
                        <div className="mb-8 p-4 border border-ink/10 rounded-lg bg-gray-50">
                            <h4 className="font-bold text-xs uppercase text-gray-400 mb-2">System Tools</h4>
                            <div className="flex gap-2">
                                <button onClick={handleSeed} className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-50">
                                    Re-seed Projects
                                </button>
                                <button onClick={handleSeedSkills} className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-50">
                                    Seed Skills (Static)
                                </button>
                                <span className="text-xs text-ink ml-2 self-center">{msg}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                Existing Projects <span className="text-xs font-normal text-gray-500">({projects.length})</span>
                            </h3>

                            <div className="bg-white border-2 border-ink rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b-2 border-ink/10 text-xs uppercase font-bold text-gray-500">
                                        <tr>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Title</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Year</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink/5">
                                        {projects.map(p => (
                                            <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                                                <td className="p-4 font-mono text-xs">{p.id}</td>
                                                <td className="p-4 font-bold">{p.title}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border border-ink/10 ${p.color}`}>
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500">{p.year}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setCurrentProject(p); setIsEditing(true); }}
                                                        className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-ink/20 rounded text-blue-600"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-ink/20 rounded text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {projects.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                                    No projects found. Use Migration or Create New.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* SKILLS TAB */}
                {activeTab === 'skills' && (
                    <div className="animate-fade-in">
                        <SkillsEditor onClose={() => setActiveTab('projects')} />
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-ink pb-4">
                            <h2 className="text-3xl font-hand font-bold flex items-center gap-2">
                                <Wrench size={32} /> General Settings
                            </h2>
                        </div>
                        <SettingsEditor />
                    </div>
                )}

                {/* DEV DIARY TAB */}
                {activeTab === 'dev_diary' && (
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-ink pb-4">
                            <h2 className="text-3xl font-hand font-bold flex items-center gap-2">
                                <BookOpen size={32} /> Dev Diary / Notebook
                            </h2>
                        </div>
                        <DevDiaryEditor />
                    </div>
                )}

            </div >
        </div >
    );
};

export default AdminApp;
