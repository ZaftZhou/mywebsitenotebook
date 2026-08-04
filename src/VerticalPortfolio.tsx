import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  Linkedin,
  Mail,
  Menu,
  Mouse,
  X,
} from 'lucide-react';
import { usePosts, useProjects, useSettings } from './hooks/useContent';
import './vertical-portfolio.css';

type StoryProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  role: string;
  tags: string[];
  outcome: string;
  image: string;
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
    location: 'Turku, Finland',
    note: 'Own mobile engineering, backend architecture, AI content pipelines and release delivery end to end.',
  },
  {
    period: '09—12.2025',
    role: 'Unity Developer Intern',
    company: 'Turku UAS · FIT / VINCE',
    location: 'Turku, Finland',
    note: 'Built a modular avatar system and editor workflow that reduced preset setup from minutes to seconds.',
  },
  {
    period: '2019—2024',
    role: 'Founder & Software Engineering Dev Manager',
    company: 'Shanghai Demu Network',
    location: 'Shanghai, China',
    note: 'Led museum digitization delivery across 1,000+ reconstructed artifacts and about 50 panoramic exhibitions.',
  },
  {
    period: '2018—2019',
    role: '3D Environment Artist',
    company: 'Virtuos',
    location: 'Shanghai, China',
    note: 'Produced environment assets inside an established AAA pipeline for the Need for Speed project.',
  },
  {
    period: '2014—2018',
    role: 'Product Creative Team Leader',
    company: 'Shanghai Zhongxin Info Dev',
    location: 'Shanghai, China',
    note: 'Led digital-twin archive solutions from requirements and production through maintenance and quality control.',
  },
];

const EDUCATION = [
  {
    period: '2024—Present',
    school: 'Turku University',
    degree: "Master’s Studies in Smart Systems",
    location: 'Turku, Finland',
    note: 'Advanced studies connecting intelligent systems, applied AI and human-centered technology.',
  },
  {
    period: 'Graduated 2021',
    school: 'Turku University of Applied Sciences',
    degree: "Bachelor’s Degree in ICT Engineering",
    location: 'Turku, Finland',
    note: 'Software engineering, interactive systems and practical product development.',
  },
];

const LIFE_ITEMS = [
  { label: 'Photography', src: '/images/life/collage/photography.png', className: 'life-photo' },
  { label: 'Gaming', src: '/images/life/collage/gaming.png', className: 'life-gaming' },
  { label: 'Cooking', src: '/images/life/collage/cooking.png', className: 'life-cooking' },
  { label: 'Basketball', src: '/images/life/collage/basketball.png', className: 'life-basketball' },
];

const FALLBACK_PROJECT_IMAGE = '/images/projects/baolu-route/poster-en.png';

const PROJECT_POSTERS = [
  { keywords: ['lilt', 'suomi learning', 'finnish learning'], src: '/images/projects/lilt/poster-page-v3.png' },
  { keywords: ['baolu', 'distribution', 'disturbution', '报路'], src: '/images/projects/baolu-route/poster-page-v2.png' },
];

const getProjectImage = (project: any) => {
  const title = String(project.title || '').toLowerCase();
  const customPoster = PROJECT_POSTERS.find(({ keywords }) => keywords.some((keyword) => title.includes(keyword)));
  if (customPoster) return customPoster.src;
  if (project.coverImage) return project.coverImage;
  return project.media?.find((item: any) => item?.type === 'image' && item?.url)?.url || '';
};

type CaseStudyContent = {
  key: 'lilt' | 'route' | 'default';
  number: string;
  strapline: string;
  opportunity: string;
  approach: string;
  outcome: string;
  outcomeTitle: string;
  outcomeSignals: { value: string; label: string }[];
  stats: { value: string; label: string }[];
  decisions: { title: string; copy: string }[];
  gallery: { src: string; caption: string; format: 'wide' | 'phone' }[];
};

const getCaseStudyContent = (project: StoryProject): CaseStudyContent => {
  const title = project.title.toLowerCase();

  if (title.includes('lilt') || title.includes('suomi') || title.includes('finnish learning')) return {
    key: 'lilt',
    number: '01',
    strapline: 'A daily learning system that turns a large Finnish curriculum into one clear next step.',
    opportunity: 'Finnish learners often move between disconnected vocabulary lists, listening exercises, news, writing practice and YKI preparation. The product needed to make that breadth feel coherent without hiding the depth of the material.',
    approach: 'LILT uses one shared progress model across the course path, weak-word review, reading, listening, AI conversation and writing. The home screen answers a single question first—what should I learn today?—then lets learners move deeper when they are ready.',
    outcome: 'The result is a cross-platform learning workspace that keeps the next action simple while supporting long-term progression from everyday vocabulary to YKI preparation.',
    outcomeTitle: 'One path. Every skill.',
    outcomeSignals: [
      { value: 'One next step', label: 'Daily direction' },
      { value: 'Every skill counts', label: 'Connected progress' },
      { value: 'YKI in sight', label: 'Long-term goal' },
    ],
    stats: [
      { value: '5,956+', label: 'Finnish words' },
      { value: '597+', label: 'Learning items' },
      { value: 'Web · iOS · Android', label: 'One shared progress' },
    ],
    decisions: [
      { title: 'Path before catalog', copy: 'The daily route selects a manageable next task instead of asking learners to browse the whole library.' },
      { title: 'Weak words return', copy: 'Vocabulary states feed repetition back into the plan, so difficult words reappear at the right moment.' },
      { title: 'Skills stay connected', copy: 'Reading, listening, speaking, writing and YKI work all contribute to the same learning picture.' },
    ],
    gallery: [
      { src: '/images/projects/lilt/case-study/learning-path.webp', caption: 'A course path makes progression visible and approachable.', format: 'wide' },
      { src: '/images/projects/lilt/case-study/home-app.jpg', caption: 'The daily dashboard turns the curriculum into one clear mission.', format: 'phone' },
      { src: '/images/projects/lilt/case-study/vocabulary.jpg', caption: 'Vocabulary state, CEFR level and review status live in one focused view.', format: 'phone' },
      { src: '/images/projects/lilt/case-study/vocabulary-loop.webp', caption: 'The review loop connects discovery, practice and retention.', format: 'wide' },
    ],
  };

  if (title.includes('baolu') || title.includes('distribution') || title.includes('disturbution') || title.includes('报路')) return {
    key: 'route',
    number: '02',
    strapline: 'A field-ready delivery map that turns incomplete building data into a reliable daily workflow.',
    opportunity: 'Newspaper delivery teams need more than a route line. They must understand buildings, apartment entrances, grouped stops, completed deliveries and exceptions—often outdoors, one-handed and under time pressure.',
    approach: 'Baolu Route combines a 3D building map with editable delivery groups, clear green–orange–gray status semantics and account-based cloud sync. Couriers can correct public data, record unit-level issues and continue the same route on another phone.',
    outcome: 'A complex mix of public map data and field knowledge becomes a practical workspace: easy to scan during delivery, precise enough for exceptions and clear enough to share as a read-only report.',
    outcomeTitle: 'Field knowledge, made visible.',
    outcomeSignals: [
      { value: 'Scan fast', label: 'On-route clarity' },
      { value: 'Keep exceptions', label: 'Unit-level detail' },
      { value: 'Sync the route', label: 'Cross-device continuity' },
    ],
    stats: [
      { value: '3D map', label: 'Building context' },
      { value: '3 states', label: 'Done · pending · issue' },
      { value: 'Cloud sync', label: 'Account-based workspace' },
    ],
    decisions: [
      { title: 'Buildings, not pins', copy: '3D footprints make entrances and grouped stops easier to understand than a conventional marker map.' },
      { title: 'Exceptions stay visible', copy: 'Unit-level status records partial deliveries without making the whole building look complete.' },
      { title: 'The route survives the phone', copy: 'Firebase persistence keeps the delivery area, edits and progress attached to the courier account.' },
    ],
    gallery: [
      { src: '/images/projects/baolu-route/case-study-login.png', caption: 'A focused account handoff keeps each delivery area private and recoverable.', format: 'wide' },
      { src: '/images/projects/baolu-route/mobile-map-en.png', caption: 'The live map combines route direction with building-level completion.', format: 'phone' },
      { src: '/images/projects/baolu-route/mobile-groups-en.png', caption: 'Grouped buildings preserve unit-level exceptions and remaining work.', format: 'phone' },
    ],
  };

  return {
    key: 'default',
    number: '00',
    strapline: project.overview,
    opportunity: project.challenge || project.overview,
    approach: project.solution || project.overview,
    outcome: project.results.join(' · ') || project.outcome,
    outcomeTitle: 'The work moves forward.',
    outcomeSignals: [
      { value: project.role, label: 'Ownership' },
      { value: project.tags.slice(0, 2).join(' · ') || 'Product system', label: 'Built with' },
      { value: project.outcome, label: 'Delivered' },
    ],
    stats: [
      { value: project.role, label: 'Role' },
      { value: project.tags.slice(0, 2).join(' · '), label: 'Core stack' },
      { value: project.outcome, label: 'Outcome' },
    ],
    decisions: project.results.slice(0, 3).map((result) => ({ title: result, copy: project.solution || project.overview })),
    gallery: project.image ? [{ src: project.image, caption: `${project.title} selected project interface.`, format: 'wide' }] : [],
  };
};

function ProjectModal({ project, onClose }: { project: StoryProject; onClose: () => void }) {
  const caseStudy = getCaseStudyContent(project);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeChapter, setActiveChapter] = useState(0);
  const { scrollYProgress: caseProgress } = useScroll({ container: modalRef });
  const smoothCaseProgress = useSpring(caseProgress, { stiffness: 130, damping: 28, mass: .25 });
  const heroCopyY = useTransform(caseProgress, [0, .18], [0, reduceMotion ? 0 : -72]);
  const heroCopyOpacity = useTransform(caseProgress, [0, .14], [1, reduceMotion ? 1 : .34]);
  const heroPosterY = useTransform(caseProgress, [0, .2], [0, reduceMotion ? 0 : 110]);
  const heroPosterScale = useTransform(caseProgress, [0, .2], [1, reduceMotion ? 1 : .92]);
  const titleClassName = project.title.length > 16 ? 'story-case-title-long' : '';

  const jumpToCaseChapter = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const root = modalRef.current;
    if (!root) return;
    const chapterIds = ['case-context', 'case-interface', 'case-decisions', 'case-outcome'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = chapterIds.indexOf(entry.target.id);
        if (index >= 0) setActiveChapter(index);
      });
    }, { root, rootMargin: '-34% 0px -54% 0px', threshold: 0 });
    chapterIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div ref={modalRef} className={`story-modal story-case-${caseStudy.key}`} role="dialog" aria-modal="true" aria-label={`${project.title} case study`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.i className="story-case-progress" style={{ scaleY: smoothCaseProgress }} />
      <button type="button" className="story-modal-close" onClick={onClose} aria-label="Close case study"><X size={22} /></button>
      <nav className="story-case-nav" aria-label="Case study chapters">
        {[
          ['01', 'Context', 'case-context'],
          ['02', 'Interface', 'case-interface'],
          ['03', 'Decisions', 'case-decisions'],
          ['04', 'Outcome', 'case-outcome'],
        ].map(([number, label, id], index) => <button type="button" className={activeChapter === index ? 'is-active' : ''} key={id} onClick={() => jumpToCaseChapter(id)} aria-label={`Go to ${label}`}><span>{number}</span><b>{label}</b></button>)}
      </nav>
      <motion.article className="story-modal-sheet story-case-sheet" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}>
        <header className="story-case-hero">
          <motion.div className="story-case-hero-copy" style={{ y: heroCopyY, opacity: heroCopyOpacity }}>
            <div className="story-case-overline"><span>Case study · {caseStudy.number}</span><span>{project.category} · {project.year}</span></div>
            <h2 className={titleClassName}>{project.title}</h2>
            <p>{caseStudy.strapline}</p>
            <dl>
              <div><dt>Role</dt><dd>{project.role}</dd></div>
              <div><dt>Stack</dt><dd>{project.tags.slice(0, 4).join(' · ')}</dd></div>
            </dl>
            {project.link && <a className="story-case-link" href={project.link} target="_blank" rel="noreferrer">Open live product <ArrowUpRight size={18} /></a>}
          </motion.div>
          <motion.figure className="story-case-poster" style={{ y: heroPosterY, scale: heroPosterScale }}>
            <img src={project.image || FALLBACK_PROJECT_IMAGE} alt={`${project.title} product poster`} />
            <figcaption>Product system / selected interface</figcaption>
          </motion.figure>
        </header>

        <section className="story-case-stats" aria-label="Project highlights">
          {caseStudy.stats.map((stat, index) => <motion.div key={stat.label} initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .45 }} transition={{ delay: index * .08 }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stat.value}</strong><small>{stat.label}</small></motion.div>)}
        </section>

        <section id="case-context" className="story-case-story">
          <p className="story-case-index">01 / Context</p>
          <motion.div initial={{ opacity: 0, y: 52 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }}><span>The opportunity</span><h3>Make complexity feel actionable.</h3><p>{caseStudy.opportunity}</p></motion.div>
        </section>

        {!!caseStudy.gallery.length && <section id="case-interface" className="story-case-gallery" aria-label={`${project.title} interface gallery`}>
          <div className="story-case-gallery-heading"><span>02 / Product in use</span><h3>From system idea<br />to working interface.</h3></div>
          <div className="story-case-gallery-grid">
            {caseStudy.gallery.map((item, index) => <motion.figure className={`story-case-frame story-case-frame-${item.format}`} key={item.src} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ delay: (index % 2) * .08 }}>
              <img src={item.src} alt={item.caption} />
              <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{item.caption}</figcaption>
            </motion.figure>)}
          </div>
        </section>}

        <section id="case-decisions" className="story-case-system">
          <div className="story-case-system-copy"><span>03 / System response</span><h3>One model,<br />clear decisions.</h3><p>{caseStudy.approach}</p></div>
          <div className="story-case-decisions">
            {caseStudy.decisions.map((decision, index) => <motion.div key={decision.title} initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .5 }} transition={{ delay: index * .07 }}><span>0{index + 1}</span><h4>{decision.title}</h4><p>{decision.copy}</p></motion.div>)}
          </div>
        </section>

        <footer id="case-outcome" className="story-case-outcome">
          <div className="story-case-outcome-heading">
            <motion.div initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .45 }}>
              <span>04 / Outcome</span>
              <h3>{caseStudy.outcomeTitle}</h3>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .5 }} transition={{ delay: .08 }}>{caseStudy.outcome}</motion.p>
          </div>
          <div className="story-case-outcome-signals">
            {caseStudy.outcomeSignals.map((signal, index) => <motion.div key={signal.label} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .55 }} transition={{ delay: index * .08 }}>
              <span>0{index + 1}</span>
              <strong>{signal.value}</strong>
              <small>{signal.label}</small>
            </motion.div>)}
          </div>
          <div className="story-case-outcome-footer">
            <strong>{project.title}</strong>
            {project.link && <a href={project.link} target="_blank" rel="noreferrer">Visit live project <ArrowRight size={20} /></a>}
          </div>
        </footer>
      </motion.article>
    </motion.div>
  );
}

function PostModal({ post, onClose }: { post: any; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const paragraphs = (post.sections || []).flatMap((section: any) => section.blocks || []).filter((block: any) => block.type === 'text' && block.content).slice(0, 5);
  return (
    <motion.div className="story-modal" role="dialog" aria-modal="true" aria-label={post.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" className="story-modal-close" onClick={onClose} aria-label="Close article"><X size={22} /></button>
      <motion.article className="story-modal-sheet story-post-sheet" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }}>
        <header><p>Notebook · {post.date ? new Date(post.date).toLocaleDateString('en-GB') : 'Recent'}</p><h2>{post.title}</h2><span>{post.tags?.join(' · ') || 'Build notes'}</span></header>
        <div className="story-modal-body story-prose">
          {paragraphs.length ? paragraphs.map((block: any, index: number) => <p key={block.id || index}>{block.content}</p>) : <p>Notes from an ongoing build, documenting decisions, trade-offs and the ideas behind the work.</p>}
        </div>
      </motion.article>
    </motion.div>
  );
}

function ProjectChapter({ project, index, onOpen }: { project: StoryProject; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, .5, 1], [reduceMotion ? 0 : 100, 0, reduceMotion ? 0 : -90]);
  const imageScale = useTransform(scrollYProgress, [0, .5, 1], [reduceMotion ? 1 : 1.13, 1, reduceMotion ? 1 : 1.06]);
  const titleX = useTransform(scrollYProgress, [0, .5, 1], [reduceMotion ? 0 : (index % 2 ? 120 : -120), 0, reduceMotion ? 0 : (index % 2 ? -45 : 45)]);
  const reveal = useTransform(scrollYProgress, [.08, .34, .72, .94], [0, 1, 1, 0]);
  const modes = ['cinematic', 'split', 'poster', 'slice', 'editorial'];

  return (
    <section ref={ref} id={`project-${project.id}`} className={`story-project story-project-${modes[index % modes.length]}`}>
      <div className="story-project-sticky">
        <motion.div className="story-project-number" style={{ x: titleX }}>{String(index + 1).padStart(2, '0')}</motion.div>
        <motion.div className="story-project-image" style={{ y: imageY, scale: imageScale, opacity: reveal }}>
          <img src={project.image || FALLBACK_PROJECT_IMAGE} alt={`${project.title} project cover`} />
        </motion.div>
        <motion.div className="story-project-copy" style={{ opacity: reveal }}>
          <p className="story-kicker">{project.category} · {project.year}</p>
          <h3>{project.title}</h3>
          <p>{project.overview}</p>
          <dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Stack</dt><dd>{project.tags.slice(0, 4).join(' · ')}</dd></div></dl>
          <button type="button" onClick={onOpen}>View case study <ArrowUpRight size={19} /></button>
        </motion.div>
      </div>
    </section>
  );
}

function LifeChapter({ portrait }: { portrait: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const portraitY = useTransform(scrollYProgress, [0, .55, 1], [reduceMotion ? 0 : 50, 0, reduceMotion ? 0 : -30]);
  const portraitScale = useTransform(scrollYProgress, [0, .45, 1], [reduceMotion ? 1 : .92, 1, reduceMotion ? 1 : .97]);
  const wordY = useTransform(scrollYProgress, [0, .55, 1], [reduceMotion ? 0 : 30, 0, reduceMotion ? 0 : -40]);
  const photoY = useTransform(scrollYProgress, [0, .55, 1], [reduceMotion ? 0 : 70, 0, reduceMotion ? 0 : -20]);
  const gamingY = useTransform(scrollYProgress, [0, .55, 1], [reduceMotion ? 0 : 120, 0, reduceMotion ? 0 : -10]);
  const cookingY = useTransform(scrollYProgress, [0, .55, 1], [reduceMotion ? 0 : 160, 0, reduceMotion ? 0 : 10]);
  const ballY = useTransform(scrollYProgress, [0, .55, 1], [reduceMotion ? 0 : 210, 0, reduceMotion ? 0 : 20]);
  const lineScale = useTransform(scrollYProgress, [.12, .82], [0, 1]);
  const itemTransforms = [photoY, gamingY, cookingY, ballY];

  return (
    <section ref={ref} id="life" className="story-life">
      <div className="story-life-sticky">
        <div className="story-life-intro">
          <p className="story-kicker">06 · Beyond the screen</p>
          <h2>BEYOND<br />THE SCREEN</h2>
          <p>I’m Zhou Bowen—an engineer, designer and lifelong learner based in Turku, Finland. I’m driven by curiosity and the joy of making things that matter. Whether I’m coding, cooking, capturing moments or playing a game, I stay grounded in real life and keep growing every day.</p>
          <img src="/images/life/love-life-growing.png" alt="Love life; keep growing" />
        </div>

        <motion.div className="story-life-words" style={{ y: wordY }} aria-hidden="true"><span>CURIOUS</span><span>PLAYFUL</span><span>GROUNDED</span></motion.div>
        <motion.div className="story-life-person" style={{ y: portraitY, scale: portraitScale }}>
          <img src={portrait} alt="Zhou Bowen" />
        </motion.div>

        <div className="story-life-collage">
          {LIFE_ITEMS.map((item, index) => <motion.figure key={item.label} className={item.className} style={{ y: itemTransforms[index] }}>
            <img src={item.src} alt={`${item.label} collage`} />
            <figcaption>{item.label}</figcaption>
          </motion.figure>)}
        </div>

        <div className="story-life-timeline">
          <motion.i style={{ scaleX: lineScale }} />
          <div><b>1990s</b><span>Born with curiosity.</span></div>
          <div><b>2015</b><span>Fell in love with code and problem solving.</span></div>
          <div><b>2023</b><span>Moved to Finland. New place, new perspective.</span></div>
          <div><b>Now</b><span>Building, learning and growing.</span></div>
        </div>
      </div>
    </section>
  );
}

export default function VerticalPortfolio() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const { projects: rawProjects } = useProjects();
  const { posts } = usePosts();
  const { settings } = useSettings();
  const [manifestoWord, setManifestoWord] = useState(0);
  const [selectedProject, setSelectedProject] = useState<StoryProject | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const projects = useMemo<StoryProject[]>(() => {
    const featured = rawProjects.filter((project: any) => project.featured);
    const mapped = (featured.length ? featured : rawProjects).slice(0, 5).map((project: any) => ({
      id: project.id,
      title: project.title,
      category: project.category || 'Project',
      year: project.year || '2026',
      role: project.role || 'Designer & Developer',
      tags: project.tags || project.content?.stack || [],
      outcome: project.outcome || project.content?.results?.[0] || 'Built and shipped',
      image: getProjectImage(project),
      overview: project.content?.overview || project.description || project.oneLiner || 'An exploration in interactive product design and engineering.',
      challenge: project.content?.challenges || '',
      solution: project.content?.solutions || '',
      results: project.content?.results || [],
      link: project.liveUrl || project.demoUrl || project.githubUrl,
    }));
    const priority = ['lilt', 'baolu', 'vince', 'notebook', 'museum'];
    return mapped.sort((a, b) => {
      const aRank = priority.findIndex((name) => a.title.toLowerCase().includes(name));
      const bRank = priority.findIndex((name) => b.title.toLowerCase().includes(name));
      return (aRank < 0 ? priority.length : aRank) - (bRank < 0 ? priority.length : bRank);
    });
  }, [rawProjects]);

  const { scrollYProgress: pageProgress } = useScroll();
  const smoothProgress = useSpring(pageProgress, { stiffness: 120, damping: 28, mass: .25 });
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroPortraitY = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 180]);
  const heroPortraitScale = useTransform(heroProgress, [0, 1], [1, reduceMotion ? 1 : 1.1]);
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : -120]);
  const heroOpacity = useTransform(heroProgress, [0, .78, 1], [1, 1, 0]);

  const { scrollYProgress: manifestoProgress } = useScroll({ target: manifestoRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(manifestoProgress, 'change', (value) => setManifestoWord(Math.min(2, Math.floor(value * 3))));

  useEffect(() => {
    document.documentElement.classList.add('story-document');
    return () => document.documentElement.classList.remove('story-document');
  }, []);

  const email = settings?.profile?.email || 'zhoubowen.skyhouse@gmail.com';
  const linkedIn = settings?.profile?.linkedin || 'https://linkedin.com/in/bowen-zhou-skyhouse';
  const resumeUrl = settings?.profile?.resumeUrl || '/resume.pdf';
  const portrait = settings?.welcome?.homePhotoUrl || settings?.welcome?.avatarUrl || '/images/life/center-person.png';
  const recentPosts = posts.slice(0, 4);

  const openProject = (project: StoryProject) => {
    if (project.title.toLowerCase().includes('notebook os') || project.title.toLowerCase().includes('personal site')) { navigate('/os'); return; }
    setSelectedProject(project);
  };

  const jumpTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const jumpFromMobileMenu = (id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => jumpTo(id), 220);
  };

  return (
    <main className="story-site">
      <motion.div className="story-progress" style={{ scaleY: smoothProgress }} />
      <header className="story-header">
        <button type="button" className="story-brand" onClick={() => jumpTo('home')}><strong>Zhou Bowen</strong><span>Interactive AI-driven engineer</span></button>
        <button type="button" className="story-menu-toggle" aria-expanded={mobileMenuOpen} aria-controls="story-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)}><span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>{mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        <AnimatePresence>{mobileMenuOpen && <motion.nav id="story-mobile-menu" className="story-mobile-menu" aria-label="Portfolio sections" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .2 }}>
          {[
            ['01', 'Work', 'work'],
            ['02', 'Life', 'life'],
            ['03', 'Career', 'experience'],
            ['04', 'Contact', 'contact'],
          ].map(([number, label, id]) => <button type="button" key={id} onClick={() => jumpFromMobileMenu(id)}><span>{number}</span>{label}</button>)}
        </motion.nav>}</AnimatePresence>
      </header>

      <nav className="story-chapter-rail" aria-label="Chapter navigation">
        {[
          ['01', 'Home', 'home'],
          ['02', 'Work', 'work'],
          ['03', 'Life', 'life'],
          ['04', 'Notebook', 'notebook'],
          ['05', 'Experience', 'experience'],
          ['06', 'Education', 'education'],
          ['07', 'Contact', 'contact'],
        ].map(([number, label, id]) => <button type="button" key={id} onClick={() => jumpTo(id)} aria-label={`Go to ${label}`}><i /><span>{number}<b>{label}</b></span></button>)}
      </nav>

      <section ref={heroRef} id="home" className="story-hero">
        <motion.div className="story-hero-copy" style={{ y: heroCopyY, opacity: heroOpacity }}>
          <motion.h1 initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: .11, delayChildren: .12 } } }}>
            {['ZHOU', 'BOWEN'].map((line) => <motion.span key={line} variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: .8, ease: [0.22, 1, 0.36, 1] } } }}>{line}</motion.span>)}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55 }}>Interactive AI-driven engineer</motion.p>
          <motion.blockquote initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .75 }}>I design and build intelligent, interactive products that <em>learn, adapt, and empower.</em></motion.blockquote>
          <motion.button type="button" onClick={() => jumpTo('work')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }}>View selected work <ArrowRight size={18} /></motion.button>
        </motion.div>
        <motion.div className="story-hero-portrait" style={{ y: heroPortraitY, scale: heroPortraitScale, opacity: heroOpacity }}><img src={portrait} alt="Zhou Bowen portrait" /></motion.div>
        <div className="story-hero-meta"><span>Turku, Finland</span><span>Design · Code · AI</span></div>
        <button type="button" className="story-scroll-cue" onClick={() => jumpTo('manifesto')}><Mouse size={18} /><span>Scroll to explore</span><ArrowDown size={16} /></button>
      </section>

      <section ref={manifestoRef} id="manifesto" className="story-manifesto">
        <div className="story-manifesto-sticky">
          <p className="story-kicker">What I bring to a project</p>
          <div className="story-manifesto-line">I turn</div>
          <div className="story-manifesto-word" aria-live="polite">
            <AnimatePresence mode="wait">{['complexity', 'ideas', 'systems'].map((word, index) => index === manifestoWord && <motion.strong key={word} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} transition={{ duration: .42 }}>{word}</motion.strong>)}</AnimatePresence>
          </div>
          <div className="story-manifesto-line story-manifesto-end">into something people can use.</div>
          <p className="story-manifesto-note">Technical art taught me to see systems. Engineering taught me to make them dependable. Product work taught me to keep people at the center.</p>
        </div>
      </section>

      <section id="work" className="story-work-intro">
        <p className="story-kicker">Selected work · 01—05</p>
        <h2>Projects with<br />a point of view.</h2>
        <p>Five projects, five different visual rhythms. Scroll naturally; each chapter responds in its own way.</p>
      </section>

      <div className="story-projects">{projects.map((project, index) => <ProjectChapter key={project.id || project.title} project={project} index={index} onOpen={() => openProject(project)} />)}</div>

      <LifeChapter portrait="/images/life/center-person.png" />

      <section id="notebook" className="story-notebook">
        <div className="story-notebook-heading"><p className="story-kicker">07 · Experiments, ideas, work in progress</p><h2>Notebook</h2><p>What changed, what broke, and what I learned while building.</p></div>
        <div className="story-posts">
          {recentPosts.length ? recentPosts.map((post: any, index: number) => <motion.button type="button" key={post.id || post.title} onClick={() => setSelectedPost(post)} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .45 }} transition={{ delay: index * .08 }} whileHover={{ x: 14 }}>
            <span>{String(index + 1).padStart(2, '0')}</span><strong>{post.title}</strong><small>{post.tags?.slice(0, 2).join(' · ') || 'Field note'}</small><ArrowUpRight size={19} />
          </motion.button>) : ['Prototyping useful motion', 'Designing systems with AI', 'Notes from a solo build'].map((title, index) => <div className="story-post-fallback" key={title}><span>0{index + 1}</span><strong>{title}</strong><small>Field note</small></div>)}
        </div>
      </section>

      <section id="experience" className="story-experience">
        <div className="story-experience-heading"><p className="story-kicker">08 · Career</p><h2>Work<br />Experience</h2><p>More than a decade moving between 3D production, interactive systems, product engineering and team delivery.</p></div>
        <div className="story-experience-list">{EXPERIENCE.map((item, index) => <motion.article key={`${item.period}-${item.role}`} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .5 }} transition={{ delay: index * .08 }}>
          <time>{item.period}</time><div><h3>{item.role}</h3><p>{item.company} · {item.location}</p><span>{item.note}</span></div>
        </motion.article>)}</div>
      </section>

      <section id="education" className="story-education">
        <div className="story-education-heading">
          <p className="story-kicker">09 · Education</p>
          <h2>Education</h2>
          <p>Formal study gives my cross-disciplinary practice a stronger technical foundation.</p>
        </div>
        <div className="story-education-list">
          {EDUCATION.map((item, index) => <motion.article key={item.school} initial={{ opacity: 0, y: 70, scale: .96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: .45 }} transition={{ duration: .65, delay: index * .1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="story-education-period"><span>0{index + 1}</span><time>{item.period}</time></div>
            <div><h3>{item.school}</h3><strong>{item.degree}</strong><p>{item.note}</p><small>{item.location}</small></div>
          </motion.article>)}
        </div>
      </section>

      <section id="contact" className="story-contact">
        <motion.p className="story-kicker" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Available for thoughtful products and ambitious teams</motion.p>
        <motion.h2 initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .8 }}>LET’S BUILD<br />SOMETHING <span>CLEAR.</span></motion.h2>
        <div className="story-contact-grid"><p>I’m based in Turku and open to full-time roles, collaborations and focused product work.</p><a className="story-contact-primary" href={`mailto:${email}`}>Start a conversation <Mail size={20} /></a><div><a href={linkedIn} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a><a href={resumeUrl} target="_blank" rel="noreferrer"><Download size={18} /> Resume</a></div></div>
      </section>

      <AnimatePresence>{selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}{selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}</AnimatePresence>
    </main>
  );
}
