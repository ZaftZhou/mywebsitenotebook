import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowLeft, ArrowUpRight, Play, Image as ImageIcon, Database, X, Folder } from 'lucide-react';
import { Project, MediaItem, AppId } from '../../types';
import { useProjects } from '../../src/hooks/useContent';

interface ProjectsAppProps {
  initialProjectId?: string;
  openApp?: (id: AppId, props?: any) => void;
}

const TechChip: React.FC<{ label: string; colorClass: string }> = ({ label, colorClass }) => {
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 bg-white border-[1px] border-ink rounded-md text-[10px] font-mono text-ink whitespace-nowrap shadow-sm">
      <div className={`w-1.5 h-1.5 rounded-full ${colorClass || 'bg-gray-400'}`}></div>
      {label}
    </span>
  );
};

// Local Tape Component for the gallery feel
const Tape = ({ className, rotation = -2 }: { className?: string; rotation?: number }) => (
  <div
    className={`absolute w-12 h-3 bg-tape/80 backdrop-blur-[1px] shadow-sm z-20 pointer-events-none ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
  </div>
);

const getAspectStyle = (aspectClass: string) => {
  if (aspectClass?.startsWith('aspect-[')) {
    const ratio = aspectClass.replace('aspect-[', '').replace(']', '');
    return { aspectRatio: ratio };
  }
  return {};
};

const MediaGalleryItem: React.FC<{ item: MediaItem; index: number; openApp?: (id: AppId, props?: any) => void }> = ({ item, index, openApp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = index % 2 === 0 ? 'rotate-1' : '-rotate-1';

  // Handle click with linkUrl support
  const handleItemClick = (mediaItem: MediaItem) => {
    if (mediaItem.linkUrl && openApp) {
      // Open in internal browser for local paths, external for https
      openApp('browser', { initialUrl: mediaItem.linkUrl });
    }
  };

  // FOLDER STYLE GALLERY
  if (item.type === 'gallery' && item.items && item.items.length > 0) {
    // EXPANDED FOLDER VIEW
    if (isOpen) {
      return (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="relative break-inside-avoid mb-6"
        >
          <div className="relative z-10 w-full mb-8 pt-4 border-t-2 border-dashed border-ink/10">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">
                Folder Content ({item.items.length})
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="flex items-center gap-1 text-xs font-bold text-ink hover:text-red-500 transition-colors"
              >
                <X size={14} /> Close
              </button>
            </div>

            <div className="space-y-8 px-2 pb-4">
              {item.items.map((subItem, idx) => {
                const subRotation = idx % 2 === 0 ? 'rotate-1' : '-rotate-1';
                return (
                  <div key={idx} className={`relative group ${subRotation}`}>
                    <Tape className="-top-3 left-1/2 -translate-x-1/2" rotation={idx % 3 === 0 ? 2 : -2} />
                    <div
                      className={`bg-white p-2 pb-8 border-2 border-ink shadow-paper group-hover:shadow-paper-hover transition-shadow duration-300 ${subItem.linkUrl ? 'cursor-pointer' : ''}`}
                      onClick={() => handleItemClick(subItem)}
                    >
                      <div
                        className={`w-full ${!subItem.aspect.startsWith('aspect-[') ? subItem.aspect : ''} bg-gray-200 relative overflow-hidden border border-ink/10 flex items-center justify-center bg-cover bg-center`}
                        style={{
                          backgroundImage: subItem.url ? `url("${subItem.url}")` : undefined,
                          ...getAspectStyle(subItem.aspect)
                        }}
                      >
                        {!subItem.url && (subItem.type === 'video' ? <Play className="text-ink/20" size={48} /> : <ImageIcon className="text-ink/20" size={48} />)}
                        {subItem.type === 'video' && subItem.url && (
                          <video src={subItem.url} controls className="w-full h-full object-cover" />
                        )}
                        {subItem.linkUrl && (
                          <div className="absolute bottom-2 right-2 bg-ink/80 text-white text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
                            <ArrowUpRight size={10} /> Open
                          </div>
                        )}
                      </div>
                      {subItem.caption && <p className="text-center font-hand font-bold text-lg mt-4 text-ink rotate-1 leading-tight">{subItem.caption}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-ink/30 hover:text-ink hover:underline uppercase tracking-widest"
              >
                Close Group
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    // CLOSED FOLDER VIEW
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => setIsOpen(true)}
        className="relative cursor-pointer group break-inside-avoid mb-6 pt-6" // pt-6 for peeking content
      >
        {/* Peeking Content (Behind Folder) */}
        <div className="absolute top-0 left-4 w-3/4 aspect-video bg-white border border-ink/20 shadow-sm rotate-[-3deg] z-0 opacity-80"
          style={{
            backgroundImage: item.items[0]?.url ? `url("${item.items[0].url}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {item.items[1] && (
          <div className="absolute top-1 right-8 w-2/3 aspect-square bg-white border border-ink/20 shadow-sm rotate-[4deg] z-0 opacity-70"
            style={{
              backgroundImage: item.items[1]?.url ? `url("${item.items[1].url}")` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* Folder Tab */}
        <div className="absolute top-[1.3rem] left-0 bg-[#e6dcc3] w-1/3 h-8 rounded-t-lg border-t-2 border-l-2 border-r-2 border-ink/20 z-10 flex items-center px-3">
          <span className="text-[10px] font-bold text-ink/60 uppercase">{item.items.length} FILES</span>
        </div>

        {/* Folder Body */}
        <div className="relative bg-[#f0e68c] w-full aspect-[4/3] rounded-b-lg rounded-tr-lg border-2 border-ink/20 shadow-md group-hover:shadow-lg transition-all z-20 flex flex-col items-center justify-center p-4">
          {/* Folder Texture/Decor */}
          <div className="w-full h-full border border-dashed border-ink/10 rounded flex flex-col items-center justify-center relative px-2 text-center">
            <Folder size={48} className="text-ink/20 mb-2" strokeWidth={1.5} />
            <h4 className="font-hand font-bold text-xl text-ink/80 rotate-[-1deg] leading-tight">
              {item.caption || 'Project Gallery'}
            </h4>
            <p className="text-xs text-ink/40 font-mono mt-2 uppercase tracking-widest">Click to Open</p>

            {/* Paper Clip or Tape visual could go here */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <Database size={14} className="text-black/20" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // STANDARD ITEM (OLD logic preserved but cleaned up)
  return (
    <div
      className={`break-inside-avoid mb-6 relative group ${rotation} ${item.linkUrl ? 'cursor-pointer' : ''}`}
      onClick={() => handleItemClick(item)}
    >
      {/* Tape Effect */}
      <Tape className="-top-2 left-1/2 -translate-x-1/2" rotation={index % 3 === 0 ? 2 : -2} />

      <div className="bg-white p-2 pb-8 border-2 border-ink shadow-paper group-hover:shadow-paper-hover transition-shadow duration-300">
        <div
          className={`w-full ${!item.aspect.startsWith('aspect-[') ? item.aspect : ''} ${item.color || 'bg-gray-200'} relative overflow-hidden border border-ink/10 flex items-center justify-center bg-cover bg-center`}
          style={{
            backgroundImage: item.url ? `url("${item.url}")` : undefined,
            ...getAspectStyle(item.aspect)
          }}
        >
          {!item.url && (item.type === 'video' ? <Play className="text-ink/20" size={48} /> : <ImageIcon className="text-ink/20" size={48} />)}
          {item.type === 'video' && item.url && (
            <video src={item.url} controls className="w-full h-full object-cover" />
          )}
          {item.linkUrl && (
            <div className="absolute bottom-2 right-2 bg-ink/80 text-white text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
              <ArrowUpRight size={10} /> Open
            </div>
          )}
        </div>
        {item.caption && <p className="text-center font-hand font-bold text-lg mt-4 text-ink rotate-1 leading-tight">{item.caption}</p>}
      </div>
    </div>
  );
};


export const ProjectsApp: React.FC<ProjectsAppProps> = ({ initialProjectId, openApp }) => {
  const { projects } = useProjects();
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (initialProjectId) {
      const p = projects.find(proj => proj.id === initialProjectId);
      if (p) setSelectedProject(p);
    }
  }, [initialProjectId, projects]);

  const categories = ['All', 'Unity', 'Web', 'App', '3D'];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="flex flex-col h-full bg-white/50">
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-white h-full overflow-y-auto"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b-2 border-ink/10 z-10 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedProject(null)}
                className="text-xs font-bold hover:text-catWeb flex items-center gap-1 group transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Gallery</span>
              </button>

              <div className="flex gap-2">
                <span className="px-2 py-1 border border-ink/20 rounded-md text-[10px] uppercase font-bold tracking-wider bg-paper">{selectedProject.year}</span>
                <span className={`px-2 py-1 border border-ink/20 rounded-md text-[10px] uppercase font-bold tracking-wider text-ink ${selectedProject.color}`}>{selectedProject.category}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-6xl mx-auto">
              {/* Title Section */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-6xl font-sans font-black mb-2 tracking-tight text-ink">{selectedProject.title}</h2>
                <p className="text-lg text-gray-500 font-hand">{selectedProject.oneLiner}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Sidebar / Info Column */}
                <div className="lg:col-span-4 space-y-8">
                  <div>
                    <h3 className="font-hand font-bold text-xl border-b border-ink/10 mb-3 inline-block bg-tape/30 px-2 transform -rotate-1">The Mission</h3>
                    <p className="text-sm leading-relaxed text-gray-700 font-sans">{selectedProject.content.overview}</p>
                  </div>

                  <div>
                    <h3 className="font-hand font-bold text-xl border-b border-ink/10 mb-3 inline-block">Tech Stack</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedProject.content.stack.map(t => (
                        <span key={t} className="bg-paperDark border-2 border-ink/10 px-2 py-1 rounded text-[10px] font-mono font-bold">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-paper p-4 border-l-4 border-ink/20 rounded-r-lg">
                    <h3 className="font-mono text-xs font-bold uppercase text-gray-400 mb-2">Key Outcome</h3>
                    <p className="font-bold text-ink">{selectedProject.outcome}</p>
                  </div>

                  {/* Demo Button */}
                  {/* Demo Button */}
                  {selectedProject.demoUrl && (
                    <button
                      onClick={() => openApp && openApp('browser', { initialUrl: selectedProject.demoUrl })}
                      className="w-full py-3 bg-ink text-white font-bold rounded shadow-paper hover:shadow-paper-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>View Project Demo</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  )}

                  <div className="space-y-4 pt-4 border-t-2 border-dashed border-ink/10">
                    <div>
                      <h4 className="font-bold text-xs uppercase text-gray-400 mb-1">Challenge</h4>
                      <p className="text-xs text-gray-600">{selectedProject.content.challenges}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase text-gray-400 mb-1">Solution</h4>
                      <p className="text-xs text-gray-600">{selectedProject.content.solutions}</p>
                    </div>
                  </div>
                </div>

                {/* Main Content / Gallery Column */}
                <div className="lg:col-span-8">
                  <div className="mb-6 flex items-center gap-2">
                    <h3 className="font-hand font-bold text-2xl">Project Gallery</h3>
                    <span className="text-[10px] font-mono bg-ink text-white px-1.5 rounded-full">{selectedProject.media?.length || 0}</span>
                  </div>

                  {/* Masonry Layout */}
                  <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                    {selectedProject.media?.map((mediaItem, index) => (
                      <MediaGalleryItem key={index} item={mediaItem} index={index} openApp={openApp} />
                    ))}
                    {!selectedProject.media && (
                      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                        No media available for this project.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 bg-white/80 border-b-2 border-ink/10 gap-4 shrink-0 backdrop-blur-sm z-10">
              <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`
                      px-3 py-1.5 rounded-md border-2 text-xs font-bold transition-all whitespace-nowrap
                      ${filter === cat
                        ? 'bg-ink text-white border-ink shadow-sm'
                        : 'bg-white text-gray-500 border-transparent hover:border-ink/20 hover:bg-paper'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-7 pr-3 py-1.5 w-full md:w-32 bg-white border-2 border-ink/10 rounded-md text-xs font-bold focus:border-ink focus:outline-none transition-colors"
                  />
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-ink/10 rounded-md text-xs font-bold hover:border-ink transition-colors text-gray-600">
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">Sort</span>
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                <AnimatePresence mode="popLayout">
                  {filtered.map(p => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedProject(p)}
                      className="group bg-white border-2 border-ink rounded-lg overflow-hidden shadow-paper cursor-pointer relative flex flex-col h-full hover:shadow-paper-hover transition-all duration-200"
                    >
                      <div
                        className="aspect-video bg-paperDark border-b-2 border-ink/10 relative overflow-hidden flex items-center justify-center bg-contain bg-center bg-no-repeat transition-all duration-500"
                        style={{ backgroundImage: (p.coverImage || p.media?.[0]?.url) ? `url('${p.coverImage || p.media?.[0]?.url}')` : undefined }}
                      >
                        {!(p.coverImage || p.media?.[0]?.url) && (
                          <span className="text-3xl opacity-20 transition-transform duration-500 group-hover:scale-105 grayscale">
                            🖼️
                          </span>
                        )}
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] group-hover:scale-[1.02] transition-transform duration-500"></div>
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-white/90 backdrop-blur border border-ink/10 px-2 py-1 rounded text-[10px] font-bold text-ink flex items-center gap-1 shadow-sm">
                            Open <ArrowUpRight className="w-2 h-2" />
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm text-ink truncate flex-1">{p.title}</h3>
                          {p.featured && <span className="text-[9px] bg-yellow-100 border border-yellow-300 px-1 rounded text-yellow-800">★</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate mb-2 font-mono leading-relaxed opacity-80">
                          {p.oneLiner}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {p.tags.slice(0, 3).map(t => (
                            <TechChip key={t} label={t} colorClass={p.color} />
                          ))}
                          {p.tags.length > 3 && (
                            <span className="text-[10px] text-gray-400 py-1 px-1 font-mono">+{p.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};