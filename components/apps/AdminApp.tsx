import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, storage } from '../../src/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { PROJECTS } from '../../constants';
import { Project, MediaItem } from '../../types';
import { Lock, LogOut, Upload, Database, Plus, Trash2, Edit2, Save, Image as ImageIcon, Film, X, Loader, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { useProjects } from '../../src/hooks/useContent';

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

    useEffect(() => {
        const fetchFiles = async () => {
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
        fetchFiles();
    }, [projectId]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg flex flex-col shadow-2xl border-2 border-ink">
                <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Database size={18} /> Media Library
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-paper">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                            <Loader className="animate-spin" /> Loading Library...
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 border-2 border-dashed border-ink/10 rounded-lg m-4">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>No files found in server storage.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((f, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSelect(f.url, f.type)}
                                    className="group relative aspect-square bg-gray-100 border-2 border-transparent hover:border-ink rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md"
                                >
                                    {f.type === 'image' ? (
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${f.url}")` }} />
                                    ) : (
                                        <video src={f.url} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {f.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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
            </h4>

            <div className="space-y-4 min-h-[100px]">
                {media.map((item, idx) => (
                    <div key={idx} className="bg-paper p-3 border border-ink/20 rounded relative group transition-all duration-300">
                        {/* Header Actions */}
                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                            <button
                                onClick={() => handleMove(idx, 'up')}
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

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">One Liner</label>
                        <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.oneLiner} onChange={e => handleChange('oneLiner', e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Overview</label>
                        <textarea className="w-full border-2 border-ink/20 p-2 rounded h-24" value={formData.content.overview} onChange={e => handleContentChange('overview', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Tags (comma sep)</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.tags.join(', ')} onChange={e => handleChange('tags', e.target.value.split(',').map((s: string) => s.trim()))} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Color Class</label>
                            <input className="w-full border-2 border-ink/20 p-2 rounded" value={formData.color} onChange={e => handleChange('color', e.target.value)} />
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

    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
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
            {isEditing && (
                <ProjectEditor
                    project={currentProject}
                    onSave={handleSaveProject}
                    onCancel={() => { setIsEditing(false); setCurrentProject(null); }}
                />
            )}

            <div className="bg-white border-b-2 border-ink/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-200 rounded-md border border-ink flex items-center justify-center font-bold">A</div>
                    <span className="font-bold">Admin Console</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <button onClick={() => signOut(auth)} className="text-red-500 hover:underline text-xs font-bold flex items-center gap-1">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border-2 border-ink p-4 shadow-sm">
                        <h3 className="font-bold border-b border-ink/10 pb-2 mb-4 flex items-center gap-2">
                            <Database size={16} /> Data Migration
                        </h3>
                        <div className="space-y-2">
                            <button onClick={handleSeed} className="w-full py-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-900 font-bold hover:bg-yellow-200 text-sm flex items-center justify-center gap-2">
                                <Upload size={14} /> Re-run Migration
                            </button>
                            {msg && <p className="text-xs text-center font-mono py-2">{msg}</p>}
                            <p className="text-[10px] text-gray-500 leading-tight">
                                This will read from <code>constants.ts</code> and overwrite ALL projects in Firestore.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-ink p-4 shadow-sm md:col-span-2">
                        <h3 className="font-bold border-b border-ink/10 pb-2 mb-4 flex items-center gap-2">
                            <Plus size={16} /> Quick Actions
                        </h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setCurrentProject(null); setIsEditing(true); }}
                                className="flex-1 py-4 bg-ink text-white rounded font-bold hover:opacity-90 text-sm flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Create New Project
                            </button>
                            <button className="flex-1 py-4 bg-white border border-ink text-ink rounded font-bold hover:bg-gray-50 text-sm">
                                Edit Skills (Coming Soon)
                            </button>
                        </div>
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
        </div>
    );
};

export default AdminApp;
