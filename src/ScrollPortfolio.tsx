import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Linkedin,
  Mail,
  Mouse,
  X,
} from 'lucide-react';
import { usePosts, useProjects, useSettings } from './hooks/useContent';
import './scroll-portfolio.css';

type ReelProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  role: string;
  tags: string[];
  outcome: string;
  image: string;
  gallery: any[];
  overview: string;
  challenge: string;
  solution: string;
  results: string[];
  link?: string;
};

const EXPERIENCE = [
  {
    period: '2026—Now',
    role: 'Founder & Full-Stack Developer',
    company: 'SkyhouseZhou',
    note: 'AI-powered mobile products, cloud content systems and end-to-end product delivery.',
  },
  {
    period: '2025',
    role: 'Unity Developer Intern',
    company: 'Turku UAS · VINCE',
    note: 'A modular avatar pipeline and editor workflow for a virtual integration environment.',
  },
  {
    period: '2019—2024',
    role: 'Software Engineering Dev Manager',
    company: 'Shanghai Demu Network',
    note: 'Museum digitization, panoramic exhibitions and interactive cultural experiences.',
  },
  {
    period: '2014—2019',
    role: 'Technical Artist & Creative Lead',
    company: 'Virtuos · Zhongxin Info Dev',
    note: 'AAA environment art, realtime 3D production and digital-twin delivery.',
  },
];

const getProjectImage = (project: any) => {
  if (project.coverImage) return project.coverImage;
  const mediaImage = project.media?.find((item: any) => item?.type === 'image' && item?.url)?.url;
  return mediaImage || '';
};

const ProjectModal = ({ project, onClose }: { project: ReelProject; onClose: () => void }) => {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <motion.div
      className="reel-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button type="button" className="reel-modal-close" onClick={onClose} aria-label="Close case study">
        <X size={22} />
      </button>
      <motion.div
        className="reel-modal-sheet"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="reel-modal-header">
          <p>{project.category} · {project.year}</p>
          <h2>{project.title}</h2>
          <span>{project.role}</span>
        </header>

        {project.image && (
          <div className="reel-modal-image">
            <img src={project.image} alt={`${project.title} project cover`} />
          </div>
        )}

        <div className="reel-modal-content">
          <div>
            <p className="reel-kicker">Overview</p>
            <p className="reel-modal-lead">{project.overview}</p>
          </div>
          <dl className="reel-modal-facts">
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            <div><dt>Stack</dt><dd>{project.tags.join(' · ')}</dd></div>
            <div><dt>Outcome</dt><dd>{project.outcome}</dd></div>
          </dl>
          {(project.challenge || project.solution) && (
            <div className="reel-modal-columns">
              <div><p className="reel-kicker">Challenge</p><p>{project.challenge}</p></div>
              <div><p className="reel-kicker">Response</p><p>{project.solution}</p></div>
            </div>
          )}
          {!!project.results.length && (
            <div>
              <p className="reel-kicker">Results</p>
              <ul className="reel-results">
                {project.results.map((result) => <li key={result}>{result}</li>)}
              </ul>
            </div>
          )}
          {project.link && (
            <a className="reel-text-link" href={project.link} target="_blank" rel="noreferrer">
              Visit live project <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const PostModal = ({ post, onClose }: { post: any; onClose: () => void }) => {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const paragraphs = (post.sections || [])
    .flatMap((section: any) => section.blocks || [])
    .filter((block: any) => block.type === 'text' && block.content)
    .slice(0, 4);

  return (
    <motion.div className="reel-modal" role="dialog" aria-modal="true" aria-label={post.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" className="reel-modal-close" onClick={onClose} aria-label="Close article"><X size={22} /></button>
      <motion.article className="reel-modal-sheet reel-post-sheet" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}>
        <header className="reel-modal-header">
          <p>Notebook · {post.date ? new Date(post.date).toLocaleDateString('en-GB') : 'Recent'}</p>
          <h2>{post.title}</h2>
          <span>{post.tags?.join(' · ') || 'Build notes'}</span>
        </header>
        <div className="reel-modal-content reel-prose">
          {paragraphs.length ? paragraphs.map((block: any, index: number) => <p key={block.id || index}>{block.content}</p>) : <p>Notes from an ongoing build, documenting decisions, trade-offs and the ideas behind the work.</p>}
        </div>
      </motion.article>
    </motion.div>
  );
};

const ProjectFrame = ({ project, index, onOpen }: { project: ReelProject; index: number; onOpen: () => void }) => (
  <article className={`reel-project-frame reel-project-tone-${index % 5}`}>
    <div className="reel-project-media">
      {project.image ? (
        <img src={project.image} alt={`${project.title} project cover`} />
      ) : (
        <div className="reel-project-type-art" aria-hidden="true">{project.title.slice(0, 2).toUpperCase()}</div>
      )}
      <div className="reel-project-wash" />
    </div>
    <div className="reel-project-topline">
      <span>{String(index + 1).padStart(2, '0')}</span>
      <p>{project.title}</p>
    </div>
    <div className="reel-project-copy">
      <p className="reel-project-description">{project.overview}</p>
      <dl>
        <div><dt>Role</dt><dd>{project.role}</dd></div>
        <div><dt>Stack</dt><dd>{project.tags.slice(0, 4).join(' · ')}</dd></div>
      </dl>
    </div>
    <button type="button" className="reel-project-action" onClick={onOpen}>
      View case study <ArrowUpRight size={20} />
    </button>
  </article>
);

export default function ScrollPortfolio() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const { projects: rawProjects } = useProjects();
  const { posts } = usePosts();
  const { settings } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ReelProject | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const projects = useMemo<ReelProject[]>(() => {
    const featured = rawProjects.filter((project: any) => project.featured);
    return (featured.length ? featured : rawProjects).slice(0, 5).map((project: any) => ({
      id: project.id,
      title: project.title,
      category: project.category || 'Project',
      year: project.year || '2026',
      role: project.role || 'Designer & Developer',
      tags: project.tags || project.content?.stack || [],
      outcome: project.outcome || project.content?.results?.[0] || 'Built and shipped',
      image: getProjectImage(project),
      gallery: project.media || [],
      overview: project.content?.overview || project.description || project.oneLiner || 'An exploration in interactive product design and engineering.',
      challenge: project.content?.challenges || '',
      solution: project.content?.solutions || '',
      results: project.content?.results || [],
      link: project.liveUrl || project.demoUrl || project.githubUrl,
    }));
  }, [rawProjects]);

  const projectCount = projects.length || 5;
  const totalWidth = 400 + projectCount * 72;
  const totalMove = totalWidth - 100;
  const stageHeight = (projectCount + 5) * 100;

  const chapters = useMemo(() => [
    { id: 'identity', label: 'Identity', target: 0 },
    ...projects.map((project, index) => ({
      id: project.id,
      label: project.title,
      target: (86 + index * 72) / totalMove,
    })),
    { id: 'notebook', label: 'Notebook', target: (100 + projectCount * 72) / totalMove },
    { id: 'profile', label: 'Experience', target: (200 + projectCount * 72) / totalMove },
    { id: 'contact', label: 'Contact', target: 1 },
  ], [projects, projectCount, totalMove]);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start start', 'end end'] });
  const trackX = useTransform(scrollYProgress, [0, 1], ['0vw', `-${totalMove}vw`]);
  const backgroundX = useTransform(scrollYProgress, [0, 1], ['3vw', '-90vw']);
  const markerX = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    chapters.forEach((chapter, index) => {
      const nextDistance = Math.abs(progress - chapter.target);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    setActiveIndex(closest);
  });

  useEffect(() => {
    document.documentElement.classList.add('reel-document');
    return () => document.documentElement.classList.remove('reel-document');
  }, []);

  const openProject = (project: ReelProject) => {
    if (project.title.toLowerCase().includes('notebook os') || project.title.toLowerCase().includes('personal site')) {
      navigate('/os');
      return;
    }
    setSelectedProject(project);
  };

  const scrollToChapter = (index: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageTop = window.scrollY + stage.getBoundingClientRect().top;
    const scrollable = stage.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: stageTop + chapters[index].target * scrollable,
      behavior: 'auto',
    });
  };

  const email = settings?.profile?.email || 'zhoubowen.skyhouse@gmail.com';
  const linkedIn = settings?.profile?.linkedin || 'https://linkedin.com/in/bowen-zhou-skyhouse';
  const resumeUrl = settings?.profile?.resumeUrl || '/resume.pdf';
  const portrait = settings?.welcome?.homePhotoUrl || settings?.welcome?.avatarUrl || '/images/life/center-person.png';
  const recentPosts = posts.slice(0, 4);
  const activeProject = activeIndex > 0 && activeIndex <= projects.length ? projects[activeIndex - 1] : null;

  const content = (
    <>
      <section className="reel-hero-panel reel-track-panel" aria-label="Introduction">
        <div className="reel-hero-words" aria-hidden="true">
          <span>INTERACTIVE</span>
          <span>AI-DRIVEN</span>
          <span>ENGINEER.</span>
        </div>
        <img className="reel-hero-portrait" src={portrait} alt="Zhou Bowen portrait" />
        <div className="reel-hero-summary">
          <p>I connect technical art, AI and software engineering to build clear, memorable digital products.</p>
          <span>Based in Turku, Finland</span>
        </div>
        <button type="button" className="reel-hero-cta" onClick={() => scrollToChapter(1)}>
          Explore selected work <ArrowRight size={20} />
        </button>
      </section>

      {projects.map((project, index) => (
        <div className="reel-project-slot reel-track-panel" key={project.id || project.title}>
          <ProjectFrame project={project} index={index} onOpen={() => openProject(project)} />
        </div>
      ))}

      <section className="reel-notebook-panel reel-track-panel" aria-label="Notebook">
        <div className="reel-panel-index">N / 01</div>
        <div className="reel-notebook-title">
          <p className="reel-kicker">Thoughts, build logs and field notes</p>
          <h2>Notebook</h2>
          <p>What changed, what broke, and what I learned while building.</p>
        </div>
        <div className="reel-post-list">
          {recentPosts.length ? recentPosts.map((post: any, index: number) => (
            <button type="button" key={post.id || post.title} onClick={() => setSelectedPost(post)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{post.title}</strong>
              <small>{post.tags?.slice(0, 2).join(' · ') || 'Build note'}</small>
              <ArrowUpRight size={18} />
            </button>
          )) : (
            ['Prototyping the interaction', 'Designing for useful motion', 'Building systems with AI'].map((title, index) => (
              <div className="reel-post-placeholder" key={title}><span>0{index + 1}</span><strong>{title}</strong><small>Field note</small></div>
            ))
          )}
        </div>
      </section>

      <section className="reel-profile-panel reel-track-panel" aria-label="Experience">
        <div className="reel-panel-index">E / 02</div>
        <div className="reel-profile-heading">
          <p className="reel-kicker">Selected experience</p>
          <h2>Design.<br />Build.<br />Ship.</h2>
          <p>More than a decade moving between 3D production, interactive systems, product engineering and team delivery.</p>
        </div>
        <div className="reel-experience-list">
          {EXPERIENCE.map((item) => (
            <article key={`${item.period}-${item.role}`}>
              <time>{item.period}</time>
              <div><h3>{item.role}</h3><p>{item.company}</p><span>{item.note}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="reel-contact-panel reel-track-panel" aria-label="Contact">
        <div className="reel-panel-index">C / 03</div>
        <p className="reel-kicker">Available for thoughtful products and ambitious teams</p>
        <h2>LET'S BUILD<br />SOMETHING<br /><span>REAL.</span></h2>
        <div className="reel-contact-copy">
          <p>I’m based in Turku and open to full-time roles, collaborations and focused product work.</p>
          <a href={`mailto:${email}`} className="reel-contact-primary">Start a conversation <Mail size={21} /></a>
          <div>
            <a href={linkedIn} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a>
            <a href={resumeUrl} target="_blank" rel="noreferrer"><Download size={18} /> Resume</a>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <main className="reel-site">
      {!reduceMotion && (
        <div className="reel-desktop" ref={stageRef} style={{ height: `${stageHeight}vh` }}>
          <div className="reel-stage">
            <header className="reel-fixed-header">
              <button type="button" onClick={() => scrollToChapter(0)} className="reel-brand">
                <strong>Zhou Bowen</strong>
                <span>Interactive AI-driven engineer</span>
                <small>Turku / FI</small>
              </button>
              <div className="reel-scroll-cue"><span /> <Mouse size={17} /> Scroll to explore</div>
            </header>

            <motion.div className="reel-background-type" style={{ x: backgroundX }} aria-hidden="true">
              <span>DESIGN</span><span>BUILD</span><span>SHIP</span>
            </motion.div>

            <motion.div className="reel-track" style={{ x: trackX, width: `${totalWidth}vw` }}>
              {content}
            </motion.div>

            <footer className="reel-progress-shell">
              <div className="reel-progress-line">
                <span className="reel-progress-base" />
                <motion.span className="reel-progress-fill" style={{ scaleX: scrollYProgress }} />
                <motion.span className="reel-progress-dot" style={{ left: markerX }} />
                {chapters.map((chapter, index) => (
                  <button
                    type="button"
                    key={chapter.id}
                    onClick={() => scrollToChapter(index)}
                    className={activeIndex === index ? 'is-active' : ''}
                    aria-current={activeIndex === index ? 'step' : undefined}
                  >
                    {chapter.label}
                  </button>
                ))}
              </div>
              <div className="reel-progress-meta">
                <div className="reel-wheel-note"><Mouse size={18} /><span>Use mouse wheel<br />to move through the reel</span></div>
                <div className="reel-velocity" aria-hidden="true">{Array.from({ length: 25 }).map((_, index) => <i key={index} />)}<span>Scroll velocity</span></div>
                {activeProject ? (
                  <button type="button" className="reel-active-cta" onClick={() => openProject(activeProject)}>View case study <ArrowUpRight size={20} /></button>
                ) : (
                  <span className="reel-active-cta reel-active-label">{chapters[activeIndex]?.label}</span>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      <div className={`reel-mobile ${reduceMotion ? 'reel-mobile-reduced' : ''}`}>
        <header className="reel-mobile-header">
          <a href="#mobile-identity"><strong>Zhou Bowen</strong><span>Interactive AI-driven engineer</span></a>
          <span>Turku / FI</span>
        </header>
        <div id="mobile-identity" className="reel-mobile-content">
          {content}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
        {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>
    </main>
  );
}
