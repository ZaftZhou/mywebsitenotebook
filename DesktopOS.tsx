import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, User, Mail, Gamepad2, Globe, Smartphone, Box, Hand, Search, Monitor, BookOpen, Wrench } from 'lucide-react';

import { WindowFrame } from './components/WindowFrame';
import { WelcomeApp } from './components/apps/WelcomeApp';
import { ProjectsApp } from './components/apps/ProjectsApp';
import { AboutApp } from './components/apps/AboutApp';

import { BrowserApp } from './components/apps/BrowserApp';
import { DesktopWidgets } from './components/DesktopWidgets';
import { CommandPalette } from './components/CommandPalette';
import AdminApp from './components/apps/AdminApp';
import { NotebookApp } from './components/apps/NotebookApp';
import { ToolsApp } from './components/apps/ToolsApp';
import { SkyhouseIcon } from './components/SkyhouseIcon';
import { WindowData, AppId, AppDefinition } from './types';

const APPS: Record<AppId, AppDefinition> = {
  welcome: { title: "Welcome!", icon: "👋", component: WelcomeApp, color: "bg-white" },
  projects: { title: "Projects.app", icon: "📁", component: ProjectsApp, color: "bg-cat-unity" },
  about: { title: "About.doc", icon: "👤", component: AboutApp, color: "bg-cat-web" },

  browser: { title: "Netscape.exe", icon: "🌎", component: BrowserApp, color: "bg-blue-100" },
  admin: { title: "Admin.exe", icon: "⚙️", component: AdminApp, color: "bg-red-100" },
  notebook: { title: "Notebook", icon: "📔", component: NotebookApp, color: "bg-green-100" },
  tools: { title: "Tools", icon: "🛠️", component: ToolsApp, color: "bg-gray-100" },
};

const DesktopIcon = ({ label, icon, onClick, delay = 0, color = "bg-white", tooltip }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring" }}
    className="group relative flex flex-col items-center gap-2 w-16 md:w-20 cursor-pointer"
    onClick={onClick}
  >
    <div className={`w-12 h-12 md:w-14 md:h-14 ${color} border-2 border-ink rounded-lg shadow-paper flex items-center justify-center text-ink group-hover:-translate-y-1 group-hover:shadow-paper-hover transition-all duration-200`}>
      {React.cloneElement(icon as React.ReactElement, { size: window.innerWidth < 768 ? 20 : 24 })}
    </div>
    <span className="font-sans font-bold bg-white/90 px-1.5 rounded-sm text-[10px] md:text-xs border border-transparent group-hover:border-ink/20 text-center leading-tight shadow-sm whitespace-nowrap">
      {label}
    </span>
    {/* Tooltip - Hidden on mobile */}
    <div className="hidden md:block absolute left-full ml-3 top-2 bg-ink text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-mono shadow-md">
      {tooltip}
      <div className="absolute top-1.5 -left-1 w-2 h-2 bg-ink rotate-45"></div>
    </div>
  </motion.div>
);

const App: React.FC = () => {
  // Redundant APPS definition removed, using the global one.


  const [windows, setWindows] = useState<WindowData[]>([]);
  const [showTip, setShowTip] = useState(true);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false); // Command Palette State
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openApp('welcome');
    const timer = setTimeout(() => setShowTip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Command Palette Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openApp = (appId: AppId, props: any = {}) => {
    const existing = windows.find(w => w.id === appId);
    if (existing) {
      focusWindow(appId);
      if (existing.isMinimized) {
        toggleMinimize(appId);
      }
      if (Object.keys(props).length > 0) {
        setWindows(prev => prev.map(w => w.id === appId ? { ...w, props: { ...w.props, ...props } } : w));
      }
      return;
    }

    const isMobile = window.innerWidth < 768;
    const appDef = APPS[appId];
    const maxZ = Math.max(0, ...windows.map(w => w.zIndex));

    const newWindow: WindowData = {
      id: appId,
      title: appDef.title,
      icon: appDef.icon,
      component: appDef.component,
      color: appDef.color,
      zIndex: maxZ + 1,
      isMinimized: false,
      isMaximized: isMobile,
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

  return (
    <div ref={containerRef} className="h-screen w-full relative overflow-hidden bg-paper">

      {/* Background Layers */}
      {/* Dot Grid Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23a1a1aa' /%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Desktop Centerpiece Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
        <SkyhouseIcon size={window.innerWidth < 768 ? 120 : 180} className="scale-110 md:scale-125" />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        openApp={openApp}
        openProject={openProjectDirectly}
      />

      {/* Pro Tip - Better position on mobile */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-4 md:left-8 z-40 bg-[#feff9c] border-2 border-ink px-4 py-3 text-xs font-hand font-bold shadow-md rotate-2 max-w-[160px] md:max-w-[200px]"
          >
            <span className="text-lg md:text-xl block mb-1">💡 Pro Tip:</span>
            {window.innerWidth < 768 ? "Tap windows to focus!" : "Drag windows by the title bar!"} <br />
            {window.innerWidth < 768 ? "" : "Cmd+K to search."}
            <button onClick={() => setShowTip(false)} className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-4 h-4 flex items-center justify-center border border-ink">x</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons Left - Stacked better on mobile */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-4 md:gap-8 z-0">
        <div className="flex flex-row md:flex-col gap-4 md:gap-8">
          <DesktopIcon
            label="Projects"
            icon={<Folder size={24} />}
            tooltip="My Work"
            onClick={() => openApp('projects')}
            color="bg-tape"
          />
          <DesktopIcon
            label="Notebook"
            icon={<BookOpen size={24} />}
            tooltip="Dev Diary"
            onClick={() => openApp('notebook')}
            color="bg-green-100"
          />
          <DesktopIcon
            label="Tools"
            icon={<Wrench size={24} />}
            tooltip="Experiments"
            onClick={() => openApp('tools')}
            color="bg-gray-100"
          />
        </div>


        <div className="hidden md:block">
          <div className="font-hand font-bold text-gray-400 text-xs mb-3 ml-2 border-b-2 border-ink/10 inline-block pr-4">Categories</div>
          <div className="flex flex-col gap-6 pl-2 border-l-2 border-ink/10">
            <DesktopIcon label="Unity" icon={<Gamepad2 size={24} />} tooltip="Game Dev" onClick={() => openApp('projects')} />
            <DesktopIcon label="Web" icon={<Globe size={24} />} tooltip="Websites" onClick={() => openApp('projects')} />
            <DesktopIcon label="App" icon={<Smartphone size={24} />} tooltip="Mobile Apps" onClick={() => openApp('projects')} />
            <DesktopIcon label="3D" icon={<Box size={24} />} tooltip="Blender / Modeling" onClick={() => openApp('projects')} />
          </div>
        </div>
      </div>

      {/* Right Widgets - Hidden on mobile */}
      {window.innerWidth >= 768 && <DesktopWidgets openApp={openApp} openProject={openProjectDirectly} />}

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
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,max-content)]">
        <div className="bg-white/90 backdrop-blur-md border-2 border-ink rounded-xl md:rounded-2xl px-2 md:px-4 py-2 md:py-3 flex gap-2 md:gap-4 shadow-floating items-center overflow-x-auto no-scrollbar">

          {/* Search Trigger */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="group relative transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:scale-105 md:hover:scale-110 active:scale-95 flex-shrink-0"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-ink text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
              <Search size={window.innerWidth < 768 ? 20 : 24} />
            </div>
            {/* Tooltip */}
            <div className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              Search (Cmd+K)
            </div>
          </button>

          {/* Divider */}
          <div className="w-0.5 h-6 md:h-8 bg-ink/10 rounded-full mx-0.5 md:mx-1 flex-shrink-0"></div>

          {(Object.keys(APPS) as AppId[]).map((key) => {
            const app = APPS[key];
            const isOpen = windows.find(w => w.id === key);

            // Only show browser/admin/tools in dock if it's currently running
            if ((key === 'browser' || key === 'admin' || key === 'tools') && !isOpen) return null;

            return (
              <div key={key} className="relative group flex-shrink-0">
                <button
                  onClick={() => isOpen ? (isOpen.isMinimized ? toggleMinimize(key) : focusWindow(key)) : openApp(key)}
                  className={`
                    relative transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:scale-105 md:hover:scale-110 active:scale-95
                    ${isOpen && !isOpen.isMinimized ? 'scale-110 -translate-y-1' : ''}
                  `}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-ink/20 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-sm ${isOpen ? 'border-ink shadow-md' : ''}`}>
                    {key === 'welcome' && <Hand className="text-ink" size={window.innerWidth < 768 ? 20 : 24} />}
                    {key === 'projects' && <Folder className="text-cat-unity" size={window.innerWidth < 768 ? 20 : 24} />}
                    {key === 'about' && <User className="text-cat-web" size={window.innerWidth < 768 ? 20 : 24} />}

                    {key === 'browser' && <Globe className="text-blue-500" size={window.innerWidth < 768 ? 20 : 24} />}
                    {key === 'admin' && <Monitor className="text-red-500" size={window.innerWidth < 768 ? 20 : 24} />}
                    {key === 'notebook' && <BookOpen className="text-green-600" size={window.innerWidth < 768 ? 20 : 24} />}
                    {key === 'tools' && <span className="text-2xl">🛠️</span>}
                  </div>
                </button>
                {/* Active Dot */}
                {isOpen && <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 -translate-x-1/2 w-1 md:w-1.5 h-1 md:h-1.5 bg-ink rounded-full"></div>}
                {/* Tooltip */}
                <div className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
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
