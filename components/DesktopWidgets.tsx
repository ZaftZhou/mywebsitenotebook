import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS, SKILLS } from '../constants';
import { AppId } from '../types';
import { Pin, Wrench, Mail, Linkedin, Play, Pause, SkipForward, Music } from 'lucide-react';
import { useProjects, useSkills, useSettings } from '../src/hooks/useContent';

const widgetHover: any = {
  scale: 1.05,
  rotate: [0, -1, 1, -1, 0],
  transition: {
    scale: { type: "spring", stiffness: 300, damping: 15 },
    rotate: { duration: 0.5, repeat: 0 }
  }
};

interface WidgetPanelProps {
  openApp: (id: AppId, props?: any) => void;
  openProject: (id: string) => void;
}

const Tape = ({ className, rotation = -2, color = "bg-tape/90" }: { className?: string; rotation?: number, color?: string }) => (
  <div
    className={`absolute w-16 h-4 ${color} backdrop-blur-[1px] shadow-sm z-10 pointer-events-none ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
  </div>
);

export const DesktopWidgets: React.FC<WidgetPanelProps> = ({ openApp, openProject }) => {
  // State logic
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Dynamic Content Hooks
  const { projects } = useProjects();
  const { skills } = useSkills();
  const { settings } = useSettings();

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(settings?.music.streamUrl || "https://stream.zeno.fm/0r0xa792kwzuv");
      audioRef.current.volume = 0.6;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  // Use settings or fallback defaults
  const profile = settings?.profile || {
    status: 'Open to Work',
    isHiring: true,
    role: 'Unity Systems & VFX',
    location: 'Turku, Finland',
    email: 'EMAIL',
    linkedin: 'LINKEDIN'
  };

  const music = settings?.music || {
    title: 'Lo-fi Study Beats',
    artist: 'Chillhop Radio 24/7'
  };

  return (
    <div className="fixed right-6 top-10 bottom-24 w-72 flex flex-col gap-6 pointer-events-none hidden md:flex z-0 overflow-visible no-scrollbar p-6">

      {/* 0. Music Player Widget (Motion) */}
      <motion.div
        whileHover={widgetHover}
        className="bg-ink text-paper rounded-sm p-4 shadow-widget -rotate-1 pointer-events-auto relative flex-shrink-0 border-2 border-gray-700 cursor-pointer origin-center"
      >
        <Tape className="-top-3 right-10" rotation={2} color="bg-rose-400" />
        {/* ... content ... */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
            <Music size={14} />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate">{music.title}</div>
            <div className="text-[10px] text-gray-400 truncate">{music.artist}</div>
          </div>
        </div>
        {/* Fake Audio Visualizer */}
        <div className="flex items-end justify-between h-8 gap-1 mb-3 opacity-50">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1 bg-paper/80 rounded-t-sm transition-all duration-300" style={{ height: isPlaying ? `${Math.random() * 100}%` : '20%' }}></div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <button className="hover:text-tape transition-colors"><SkipForward size={14} className="rotate-180" /></button>
          <button onClick={togglePlay} className="w-8 h-8 bg-paper text-ink rounded-full flex items-center justify-center hover:bg-tape transition-colors">
            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
          </button>
          <button className="hover:text-tape transition-colors"><SkipForward size={14} /></button>
        </div>
      </motion.div>

      {/* 1. Featured Projects Widget (Motion) */}
      <motion.div
        whileHover={widgetHover}
        className="bg-white border-2 border-ink rounded-sm p-4 shadow-widget rotate-1 pointer-events-auto hover:shadow-floating transition-shadow relative flex-shrink-0 origin-center"
      >
        <Tape className="-top-3 left-1/2 -translate-x-1/2" rotation={-2} />
        {/* ... (content same) ... */}
        <div className="flex items-center justify-between mb-3 border-b-2 border-ink/10 pb-1">
          <h4 className="font-hand font-bold text-xl flex items-center gap-2">
            <Pin className="w-4 h-4" /> Pinned Work
          </h4>
        </div>
        <div className="space-y-3">
          {projects.filter(p => p.featured).slice(0, 3).map(p => (
            <div
              key={p.id}
              onClick={() => openProject(p.id)}
              className="group cursor-pointer flex items-center gap-3 p-1 hover:bg-paperDark rounded border border-transparent hover:border-ink/10 transition-colors"
            >
              <div className={`w-8 h-8 rounded border border-ink ${p.color === 'catUnity' ? 'bg-blue-300' : p.color === 'catWeb' ? 'bg-orange-300' : p.color === 'cat3D' ? 'bg-purple-300' : 'bg-green-300'} flex-shrink-0 flex items-center justify-center text-xs font-bold`}>
                {p.category[0]}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs truncate group-hover:text-catWeb transition-colors">{p.title}</div>
                <div className="text-[10px] text-gray-500 truncate">Click to open</div>
              </div>
            </div>
          ))}
          {projects.filter(p => p.featured).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-4 italic">No pinned projects</div>
          )}
        </div>
      </motion.div>

      {/* 2. Skills Badge Wall (Motion) */}
      <motion.div
        whileHover={widgetHover}
        className="bg-white border-2 border-ink rounded-sm p-4 shadow-widget -rotate-1 pointer-events-auto hover:shadow-floating transition-shadow relative flex-shrink-0 origin-center"
      >
        <Tape className="-top-3 right-8" rotation={2} color="bg-blue-200" />
        {/* ... (content same) ... */}
        <div className="mb-3 border-b-2 border-ink/10 pb-1">
          <h4 className="font-hand font-bold text-xl flex items-center gap-2">
            <Wrench className="w-4 h-4" /> {settings?.widgets?.toolboxTitle || 'Toolbox'}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {skills.slice(0, 8).map(skill => (
            <div key={skill.name} className="flip-card w-full h-8 cursor-pointer group perspective-1000">
              <div className="flip-card-inner w-full h-full relative transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className={`absolute inset-0 backface-hidden ${skill.bg || 'bg-gray-100'} border border-ink rounded flex items-center justify-center text-[10px] font-bold text-center`}>
                  {skill.name}
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 backface-hidden rotate-y-180 bg-ink text-white border border-ink rounded flex items-center justify-center text-[8px] text-center font-mono leading-tight hover:underline"
                  onClick={() => openApp('projects')}
                >
                  PROOF &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. Status Widget (Motion) */}
      <motion.div
        whileHover={widgetHover}
        className="bg-[#feff9c] border-2 border-ink rounded-sm p-4 shadow-widget rotate-2 pointer-events-auto hover:shadow-floating transition-shadow relative flex-shrink-0 origin-center"
      >
        {/* Paper Clip Visual */}
        <div className="absolute -top-3 left-6 w-4 h-8 border-2 border-ink rounded-full border-b-0"></div>
        <div className="absolute -top-3 left-7 w-2 h-6 bg-ink/10 rounded-full"></div>

        {/* ... (content same) ... */}
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-3 w-3">
            {profile.isHiring && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 border border-ink ${profile.isHiring ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </span>
          <h4 className="font-black text-sm uppercase tracking-wider">{profile.status}</h4>
        </div>

        <ul className="text-xs space-y-2 font-mono border-t border-ink/10 pt-2 mt-2">
          <li className="flex gap-2"><span>🔨</span> {profile.role}</li>
          <li className="flex gap-2"><span>📍</span> {profile.location}</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              const raw = profile.email || '';
              if (!raw) return openApp('contact');

              let finalUrl = raw;
              if (raw.includes('@') && !raw.startsWith('mailto:') && !raw.startsWith('http')) {
                finalUrl = `mailto:${raw}`;
              } else if (!raw.startsWith('http') && !raw.startsWith('mailto:')) {
                finalUrl = `https://${raw}`;
              }
              window.open(finalUrl, '_blank');
            }}
            className="flex-1 bg-white border border-ink text-[10px] py-1.5 font-bold hover:bg-gray-50 shadow-sm flex items-center justify-center gap-1"
          >
            <Mail className="w-3 h-3" /> EMAIL
          </button>
          <button
            onClick={() => {
              const raw = profile.linkedin || '';
              if (!raw) return;
              const finalUrl = (raw.startsWith('http') || raw.startsWith('mailto:')) ? raw : `https://${raw}`;
              window.open(finalUrl, '_blank');
            }}
            className="flex-1 bg-[#0077b5] text-white border border-ink text-[10px] py-1.5 font-bold hover:opacity-90 shadow-sm flex items-center justify-center gap-1"
          >
            <Linkedin className="w-3 h-3" /> LINKEDIN
          </button>
        </div>
      </motion.div>

    </div>
  );
};
