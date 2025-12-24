import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Project, Skill } from '../../types';
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
    // Similar logic for skills if needed, for now returning static
    return { skills: STATIC_SKILLS, loading: false };
};
