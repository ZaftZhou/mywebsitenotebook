import { ComponentType } from 'react';

export interface MediaItem {
  type: 'image' | 'video' | 'gallery';
  url?: string; // For gallery, this could be the cover image
  caption?: string;
  aspect: string;
  color?: string;
  items?: MediaItem[]; // For gallery type
  linkUrl?: string; // Optional URL to navigate to when clicked (supports local paths like /projects/demo/)
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

export type AppId = 'welcome' | 'projects' | 'about' | 'browser' | 'admin' | 'notebook' | 'tools';
export interface SiteSettings {
  id?: string;
  profile: {
    status: string;
    isHiring: boolean;
    role: string;
    location: string;
    email: string;
    linkedin: string;
    resumeUrl?: string; // New field for CV download link
  };
  music: {
    title: string;
    artist: string;
    streamUrl?: string;
  };
  welcome: {
    greeting: string;
    tagline: string;
    avatarUrl?: string; // New field for custom welcome image
  };
  widgets: {
    toolboxTitle: string;
    toolboxColor: string; // fallback color if needed
  };
}

export type PostType = 'tech_note' | 'devlog' | 'postmortem';

export type BlockType = 'text' | 'image' | 'video' | 'code';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Markdown text, URL, or code
  caption?: string;
  language?: string; // For code blocks: 'javascript', 'python', 'csharp', etc.
}

export interface PostSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string; // ISO timestamp
  type: PostType;
  projectId?: string; // Optional linkage
  tags: string[];
  sections: PostSection[]; // Replaces old 'content' object
}
