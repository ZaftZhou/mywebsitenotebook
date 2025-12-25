import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project, Skill, SiteSettings } from '../../types';
import { PROJECTS as STATIC_PROJECTS, SKILLS as STATIC_SKILLS } from '../../constants';

// Hook to get projects (real-time or static fallback)
export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const q = query(collection(db, 'projects')); // Removing orderBy for now to avoid index issues on init
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                    // Sort manually for now
                    docs.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
                    setProjects(docs);
                }
                setLoading(false);
            }, (err) => {
                console.error("Firestore read error (using static):", err);
                setError(err.message);
                setLoading(false);
                // Keep static projects on error
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Firebase init error:", err);
            setLoading(false);
        }
    }, []);

    return { projects, loading, error };
};

export const useSkills = () => {
    const [skills, setSkills] = useState<Skill[]>(STATIC_SKILLS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const q = query(collection(db, 'skills'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const docs = snapshot.docs.map(doc => ({ ...doc.data() } as Skill));
                    setSkills(docs);
                }
                setLoading(false);
            }, (err) => {
                console.error("Firestore skills read error (using static):", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            console.error("Firebase init error (skills):", err);
            setLoading(false);
        }
    }, []);

    return { skills, loading, error };
};

export const useSettings = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
                if (docSnap.exists()) {
                    setSettings({ id: docSnap.id, ...docSnap.data() } as SiteSettings);
                } else {
                    setSettings(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching settings:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Firebase init error (settings):", err);
            setLoading(false);
        }
    }, []);

    return { settings, loading };
};

export const usePosts = () => {
    const [posts, setPosts] = useState<import('../../types').BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import('../../types').BlogPost));
                    setPosts(docs);
                } else {
                    setPosts([]);
                }
                setLoading(false);
            }, (err) => {
                console.error("Firestore posts read error:", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            console.error("Firebase init error (posts):", err);
            setLoading(false);
        }
    }, []);

    return { posts, loading, error };
};
