import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, User, Mail, Gamepad2, Globe, Smartphone, Box, GripHorizontal, Hand } from 'lucide-react';

import { WindowFrame } from './components/WindowFrame';
import { WelcomeApp } from './components/apps/WelcomeApp';
import { ProjectsApp } from './components/apps/ProjectsApp';
import { AboutApp } from './components/apps/AboutApp';
import { ContactApp } from './components/apps/ContactApp';
import { DesktopWidgets } from './components/DesktopWidgets';
import { WindowData, AppId, AppDefinition } from './types';

const App: React.FC = () => {
  const APPS: Record<AppId, AppDefinition> = {
    welcome: { title: "Welcome!", icon: "👋", component: WelcomeApp, color: "bg-white" },
    projects: { title: "Projects.app", icon: "📁", component: ProjectsApp, color: "bg-catUnity" },
    about: { title: "About.doc", icon: "👤", component: AboutApp, color: "bg-catWeb" },
    contact: { title: "Contact.txt", icon: "✏️", component: ContactApp, color: "bg-tape" },
  };

  const [windows, setWindows] = useState<WindowData[]>([]);
  const [showTip, setShowTip] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openApp('welcome');
    const timer = setTimeout(() => setShowTip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const openApp = (appId: AppId, props: any = {}) => {
    // If window exists, focus and update props
    const existing = windows.find(w => w.id === appId);
    if (existing) {
      focusWindow(appId);
      if (existing.isMinimized) {
          toggleMinimize(appId);
      }
      if (Object.keys(props).length > 0) {
        setWindows(prev => prev.map(w => w.id === appId ? { ...w, props: {...w.props, ...props} } : w));
      }
      return;
    }

    const isMobile = window.innerWidth < 768;
    const appDef = APPS[appId];
    const newWindow: WindowData = {
      id: appId,
      title: appDef.title,
      icon: appDef.icon,
      component: appDef.component,
      color: appDef.color,
      zIndex: windows.length + 1,
      isMinimized: false,
      isMaximized: isMobile, // Auto maximize on mobile
      isMobile,
      props
    };
    setWindows([...windows, newWindow]);
  };

  const openProjectDirectly = (projectId: string) => {
    openApp('projects', { initialProjectId: projectId });
  };

  const closeWindow = (id: string) => setWindows(prev => prev.filter(w => w.id !== id));
  
  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };
  
  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };
  
  const focusWindow = (id: string) => {
    const maxZ = Math.max(0, ...windows.map(w => w.zIndex));
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
  };

  const DesktopIcon = ({ label, icon, onClick, delay = 0, color = "bg-white", tooltip }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      className="group relative flex flex-col items-center gap-2 w-20 cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-14 h-14 ${color} border-2 border-ink rounded-lg shadow-paper flex items-center justify-center text-ink group-hover:-translate-y-1 group-hover:shadow-paper-hover transition-all duration-200`}>
        {icon}
      </div>
      <span className="font-sans font-bold bg-white/90 px-1.5 rounded-sm text-xs border border-transparent group-hover:border-ink/20 text-center leading-tight shadow-sm whitespace-nowrap">
        {label}
      </span>
      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-2 bg-ink text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-mono shadow-md">
         {tooltip}
         <div className="absolute top-1.5 -left-1 w-2 h-2 bg-ink rotate-45"></div>
      </div>
    </motion.div>
  );

  return (
    <div ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-paper bg-grid-paper bg-[length:24px_24px]">
      
      {/* Pro Tip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-8 z-40 bg-[#feff9c] border-2 border-ink px-4 py-3 text-xs font-hand font-bold shadow-md rotate-2 max-w-[200px]"
          >
            <span className="text-xl block mb-1">💡 Pro Tip:</span>
            Drag windows by the title bar!
            <button onClick={() => setShowTip(false)} className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-4 h-4 flex items-center justify-center border border-ink">x</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons Left */}
      <div className="absolute top-8 left-8 flex flex-col gap-8 z-0">
        <div>
          <DesktopIcon 
            label="Projects" 
            icon={<Folder size={24} />} 
            tooltip="My Work" 
            onClick={() => openApp('projects')} 
            color="bg-tape" 
          />
        </div>
        <div>
          <div className="font-hand font-bold text-gray-400 text-xs mb-3 ml-2 border-b-2 border-ink/10 inline-block pr-4">Categories</div>
          <div className="flex flex-col gap-6 pl-2 border-l-2 border-ink/10">
            <DesktopIcon label="Unity" icon={<Gamepad2 size={24} />} tooltip="Game Dev" onClick={() => openApp('projects')} />
            <DesktopIcon label="Web" icon={<Globe size={24} />} tooltip="Websites" onClick={() => openApp('projects')} />
            <DesktopIcon label="App" icon={<Smartphone size={24} />} tooltip="Mobile Apps" onClick={() => openApp('projects')} />
            <DesktopIcon label="3D" icon={<Box size={24} />} tooltip="Blender / Modeling" onClick={() => openApp('projects')} />
          </div>
        </div>
      </div>

      {/* Right Widgets */}
      <DesktopWidgets openApp={openApp} openProject={openProjectDirectly} />

      {/* Windows Layer */}
      <AnimatePresence>
        {windows.map(win => (
          !win.isMinimized && (
            <WindowFrame
              key={win.id}
              window={win}
              onClose={closeWindow}
              onMinimize={toggleMinimize}
              onMaximize={toggleMaximize}
              onFocus={focusWindow}
              dragConstraints={containerRef}
            >
              <win.component openApp={openApp} {...win.props} />
            </WindowFrame>
          )
        ))}
      </AnimatePresence>

      {/* Bottom Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="bg-white/90 backdrop-blur-md border-2 border-ink rounded-2xl px-4 py-3 flex gap-4 shadow-floating items-center">
          {(Object.keys(APPS) as AppId[]).map((key) => {
            const app = APPS[key];
            const isOpen = windows.find(w => w.id === key);
            return (
              <div key={key} className="relative group">
                <button
                  onClick={() => isOpen ? (isOpen.isMinimized ? toggleMinimize(key) : focusWindow(key)) : openApp(key)}
                  className={`
                    relative transition-all hover:-translate-y-2 hover:scale-110 active:scale-95
                    ${isOpen && !isOpen.isMinimized ? 'scale-110 -translate-y-1' : ''}
                  `}
                >
                  <div className={`w-12 h-12 bg-white border-2 border-ink/20 rounded-xl flex items-center justify-center text-2xl shadow-sm ${isOpen ? 'border-ink shadow-md' : ''}`}>
                    {key === 'welcome' && <Hand className="text-ink" size={24} />}
                    {key === 'projects' && <Folder className="text-catUnity" size={24} />}
                    {key === 'about' && <User className="text-catWeb" size={24} />}
                    {key === 'contact' && <Mail className="text-tape" fill="#F4E04D" size={24} />}
                  </div>
                </button>
                {/* Active Dot */}
                {isOpen && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-ink rounded-full"></div>}
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                  {app.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default App;
