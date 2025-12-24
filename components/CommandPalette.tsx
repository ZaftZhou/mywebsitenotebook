import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, AppWindow, FileText, Monitor, Gamepad2, Smartphone, Box, Download } from 'lucide-react';
import { PROJECTS } from '../constants';
import { AppId, Project } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  openApp: (id: AppId, props?: any) => void;
  openProject: (id: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'app' | 'project' | 'action';
  icon: React.ReactNode;
  action: () => void;
  desc?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, openApp, openProject }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define static actions and apps
  const baseItems: SearchResult[] = [
    { id: 'app-projects', title: 'Projects Explorer', type: 'app', icon: <Search size={16} />, desc: 'Browse all works', action: () => openApp('projects') },
    { id: 'app-about', title: 'About Me', type: 'app', icon: <FileText size={16} />, desc: 'Skills & Experience', action: () => openApp('about') },
    { id: 'app-contact', title: 'Contact', type: 'app', icon: <AppWindow size={16} />, desc: 'Send a message', action: () => openApp('contact') },
    { id: 'action-cv', title: 'Download Resume', type: 'action', icon: <Download size={16} />, desc: 'PDF Format', action: () => alert("CV Downloaded!") },
  ];

  // Map projects to search results
  const projectItems: SearchResult[] = PROJECTS.map(p => ({
    id: `proj-${p.id}`,
    title: p.title,
    type: 'project',
    icon: p.category === 'Unity' ? <Gamepad2 size={16} /> : p.category === 'Web' ? <Monitor size={16} /> : p.category === 'App' ? <Smartphone size={16} /> : <Box size={16} />,
    desc: `${p.category} • ${p.year}`,
    action: () => openProject(p.id)
  }));

  const allItems = [...baseItems, ...projectItems];

  // Filter logic
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.desc?.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-lg bg-paper border-2 border-ink rounded-lg shadow-2xl overflow-hidden relative"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-4 border-b-2 border-ink/10">
            <Search className="text-gray-400 w-5 h-5 mr-3" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none font-sans text-lg placeholder-gray-400 text-ink"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">ESC</div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No results found.</div>
            ) : (
              <ul className="space-y-1">
                {filteredItems.map((item, index) => (
                  <li
                    key={item.id}
                    onClick={() => { item.action(); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-3 rounded cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-ink text-paper' : 'hover:bg-paperDark text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${index === selectedIndex ? 'bg-paper/20' : 'bg-gray-200'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-none mb-1">{item.title}</div>
                        <div className={`text-[10px] ${index === selectedIndex ? 'text-paper/70' : 'text-gray-500'}`}>
                          {item.type.toUpperCase()} • {item.desc}
                        </div>
                      </div>
                    </div>
                    {index === selectedIndex && <ArrowRight size={14} className="opacity-50" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-paperDark border-t border-ink/10 px-4 py-2 text-[10px] text-gray-500 flex justify-between">
            <span>ProTip: Use arrows to navigate</span>
            <span>Notebook OS v1.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
