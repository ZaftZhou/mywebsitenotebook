import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';
import { WindowData } from '../types';

interface WindowFrameProps {
  window: WindowData;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  dragConstraints: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

const Tape = ({ className, rotation = -2 }: { className?: string; rotation?: number }) => (
  <div
    className={`absolute w-16 h-4 bg-tape/90 backdrop-blur-[1px] shadow-sm z-50 pointer-events-none ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
  </div>
);

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  dragConstraints,
  children
}) => {
  const dragControls = useDragControls();
  
  const frameStyle = win.isMaximized
    ? { top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0, x: 0, y: 0 }
    : {
        top: "10%",
        left: win.isMobile ? "5%" : "20%",
        width: win.isMobile ? "90vw" : "60vw",
        height: win.isMobile ? "80vh" : "70vh"
      };

  return (
    <motion.div
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      initial={{ scale: 0.95, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0, ...frameStyle }}
      exit={{ scale: 0.9, opacity: 0, y: 15 }}
      style={{ zIndex: win.zIndex, position: 'absolute' }}
      onPointerDown={() => onFocus(win.id)}
      className="bg-paper border-2 border-ink md:rounded-lg shadow-window flex flex-col overflow-hidden transition-all duration-200"
    >
      <div
        onPointerDown={(e) => {
          if (!win.isMaximized) dragControls.start(e);
          onFocus(win.id);
        }}
        onDoubleClick={() => onMaximize(win.id)}
        className="bg-paperDark border-b-2 border-ink p-2 flex justify-between items-center cursor-grab active:cursor-grabbing select-none h-10 flex-shrink-0"
      >
        <div className="flex gap-2 pl-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(win.id); }} 
            className="w-4 h-4 border-2 border-ink rounded-full bg-white hover:bg-red-400 transition-colors flex items-center justify-center group"
          >
            <X className="opacity-0 group-hover:opacity-100 w-2.5 h-2.5" strokeWidth={4} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }} 
            className="w-4 h-4 border-2 border-ink rounded-full bg-white hover:bg-yellow-400 transition-colors flex items-center justify-center group"
          >
            <Minus className="opacity-0 group-hover:opacity-100 w-2.5 h-2.5" strokeWidth={4} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }} 
            className="w-4 h-4 border-2 border-ink rounded-full bg-white hover:bg-green-400 transition-colors flex items-center justify-center group hidden md:flex"
          >
            <Square className="opacity-0 group-hover:opacity-100 w-2 h-2" strokeWidth={4} />
          </button>
        </div>
        <div className="font-hand font-bold text-lg text-ink/80 tracking-wide truncate px-4">
          {win.title}
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-paper flex flex-col">
        {!win.isMaximized && <Tape className="-top-3 -right-6 rotate-[30deg]" />}
        {children}
      </div>
    </motion.div>
  );
};
