const fs = require('fs');

let text = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');

// Find the work section
const targetWorkSection = `        {/* --- WORK SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="work"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              <div className="lg:w-1/4 shrink-0">
                <div className="lg:sticky lg:top-40 z-20">
                  <SectionHeading subtitle="Selected Projects" className="mb-0">Case Archive</SectionHeading>
                </div>
              </div>
              
              <div className="lg:w-3/4 flex flex-col border-t border-ink/10 lg:border-t-0 mt-8 lg:mt-0">
                {projects.filter(p => p.featured).map((project, i) => (
                  <ProjectItem key={project.title} project={project} index={i} onClick={() => handleProjectClick(project)} />
                ))}
                
                <div className="mt-12 flex justify-start md:justify-end">
                  <button 
                    onClick={() => setShowAllProjects(true)}
                    className="group flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors px-6 py-3 border border-ink/20 rounded-full hover:border-accent/40"
                  >
                    View All Projects
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </section>`;

// Replace it with the new layout
const newWorkSection = `        {/* --- WORK SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="work"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              <div className="lg:w-1/4 shrink-0 flex flex-row lg:flex-col justify-between items-start">
                <div className="lg:sticky lg:top-40 z-20 pt-4">
                  <div className="overflow-hidden">
                    <motion.p 
                      initial={{ y: "100%" }} whileInView={{ y: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-ink/70"
                    >
                      Selected Projects
                    </motion.p>
                  </div>
                </div>
                
                {/* Mobile Button - Shows only on small screens */}
                <div className="lg:hidden">
                  <button 
                    onClick={() => setShowAllProjects(true)}
                    className="group flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-accent transition-all px-5 md:px-8 py-3 md:py-4 border border-accent/30 rounded-full hover:bg-accent hover:text-white"
                  >
                    SEE ALL CASES
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
              
              <div className="lg:w-3/4 flex flex-col relative mt-12 lg:mt-0">
                {/* Desktop Button - Absolutely positioned at top right of the projects column */}
                <div className="hidden lg:flex absolute -top-4 right-0 z-20">
                  <button 
                    onClick={() => setShowAllProjects(true)}
                    className="group flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-accent transition-all px-6 md:px-8 py-3 md:py-4 border border-accent/30 rounded-full hover:bg-accent hover:text-white"
                  >
                    SEE ALL CASES
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                <div className="flex flex-col">
                  {projects.filter(p => p.featured).map((project, i) => (
                    <ProjectItem key={project.title} project={project} index={i} onClick={() => handleProjectClick(project)} />
                  ))}
                </div>
              </div>
            </div>
          </section>`;

// Wait! If my replacement string does not EXACTLY match the source, it will fail.
// So let's use a regex to replace everything between {/* --- WORK SECTION --- */} and {/* --- NOTEBOOK SECTION --- */}
text = text.replace(
  /\{\/\* --- WORK SECTION --- \*\/\}(.|\n)*?\{\/\* --- NOTEBOOK SECTION --- \*\/\}/g,
  newWorkSection + '\n\n        {/* --- NOTEBOOK SECTION --- */}'
);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', text, 'utf8');
