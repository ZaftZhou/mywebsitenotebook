import { ComponentType } from 'react';

export interface MediaItem {
  type: 'image' | 'video';
  url?: string;
  caption?: string;
  aspect: string; // Tailwind aspect class (e.g. 'aspect-video', 'aspect-[3/4]')
  color?: string; // For placeholder background
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  role: string;
  tags: string[];
  outcome: string;
  color: string; // Tailwind class
  featured: boolean;
  oneLiner: string;
  content: {
    overview: string;
    stack: string[];
    results: string[];
    challenges: string;
    solutions: string;
  };
  media: MediaItem[];
}

export interface Skill {
  name: string;
  desc: string;
  bg: string;
  value: number; // For charts
  category: string;
}

export interface WindowData {
  id: string;
  title: string;
  icon: string;
  component: ComponentType<any>;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isMobile: boolean;
  props?: Record<string, any>;
  color?: string;
}

export interface AppDefinition {
  title: string;
  icon: string;
  component: ComponentType<any>;
  color: string;
}

export type AppId = 'welcome' | 'projects' | 'about' | 'contact';
