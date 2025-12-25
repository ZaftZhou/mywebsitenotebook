import { ComponentType } from 'react';

export interface MediaItem {
  type: 'image' | 'video' | 'gallery';
  url?: string; // For gallery, this could be the cover image
  caption?: string;
  aspect: string;
  color?: string;
  items?: MediaItem[]; // For gallery type
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
  coverImage?: string; // Dedicated cover image URL
  demoUrl?: string; // Optional URL for project demo
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

export type AppId = 'welcome' | 'projects' | 'about' | 'contact' | 'browser' | 'admin';
