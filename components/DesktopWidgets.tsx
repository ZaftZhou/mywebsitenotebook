import React from 'react';
import { PROJECTS, SKILLS } from '../constants';
import { AppId } from '../types';
import { Pin, Wrench, Mail, Linkedin } from 'lucide-react';

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
  return (
    <div className="fixed right-6 top-10 bottom-24 w-64 flex flex-col gap-6 pointer-events-none hidden md:flex z-0 overflow-y-auto no-scrollbar py-2 px-1">
      
      {/* 1. Featured Projects Widget */}
      <div className="bg-white border-2 border-ink rounded-sm p-4 shadow-widget rotate-1 pointer-events-auto hover:shadow-floating transition-all relative flex-shrink-0">
        <Tape className="-top-3 left-1/2 -translate-x-1/2" rotation={-2} />
        <div className="flex items-center justify-between mb-3 border-b-2 border-ink/10 pb-1">
          <h4 className="font-hand font-bold text-xl flex items-center gap-2">
            <Pin className="w-4 h-4" /> Pinned Work
          </h4>
        </div>
        <div className="space-y-3">
          {PROJECTS.filter(p => p.featured).slice(0, 3).map(p => (
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
        </div>
      </div>

      {/* 2. Skills Badge Wall */}
      <div className="bg-white border-2 border-ink rounded-sm p-4 shadow-widget -rotate-1 pointer-events-auto hover:shadow-floating transition-all relative flex-shrink-0">
        <Tape className="-top-3 right-8" rotation={2} color="bg-blue-200" />
        <div className="mb-3 border-b-2 border-ink/10 pb-1">
          <h4 className="font-hand font-bold text-xl flex items-center gap-2">
             <Wrench className="w-4 h-4" /> Toolbox
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SKILLS.map(skill => (
            <div key={skill.name} className="flip-card w-full h-8 cursor-pointer group perspective-1000">
              <div className="flip-card-inner w-full h-full relative transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className={`absolute inset-0 backface-hidden ${skill.bg} border border-ink rounded flex items-center justify-center text-[10px] font-bold text-center`}>
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
      </div>

      {/* 3. Status Widget */}
      <div className="bg-[#feff9c] border-2 border-ink rounded-sm p-4 shadow-widget rotate-2 pointer-events-auto relative flex-shrink-0">
        {/* Paper Clip Visual */}
        <div className="absolute -top-3 left-6 w-4 h-8 border-2 border-ink rounded-full border-b-0"></div>
        <div className="absolute -top-3 left-7 w-2 h-6 bg-ink/10 rounded-full"></div>

        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-ink"></span>
          </span>
          <h4 className="font-black text-sm uppercase tracking-wider">Open to Work</h4>
        </div>
        
        <ul className="text-xs space-y-2 font-mono border-t border-ink/10 pt-2 mt-2">
          <li className="flex gap-2"><span>🔨</span> Building SaaS</li>
          <li className="flex gap-2"><span>📍</span> Turku, FI</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <button onClick={() => openApp('contact')} className="flex-1 bg-white border border-ink text-[10px] py-1.5 font-bold hover:bg-gray-50 shadow-sm flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" /> EMAIL
          </button>
          <button className="flex-1 bg-[#0077b5] text-white border border-ink text-[10px] py-1.5 font-bold hover:opacity-90 shadow-sm flex items-center justify-center gap-1">
            <Linkedin className="w-3 h-3" /> LINKEDIN
          </button>
        </div>
      </div>

    </div>
  );
};
