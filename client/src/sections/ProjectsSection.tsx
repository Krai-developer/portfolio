import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Project } from '../types';
import { ExternalLink, Github, ArrowRight, FolderKanban } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.public.getProjects();
        if (res.success && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="work" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>FEATURED WORK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Selected client &amp; studio projects.
            </h2>
            <p className="text-content-secondary text-base">
              A curated selection of production web applications engineered with modern UI patterns,
              type-safe APIs, and high performance.
            </p>
          </div>

          {/* Categories */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeCategory === cat
                      ? 'bg-accent text-black font-semibold'
                      : 'bg-dark-card border border-dark-border text-content-secondary hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-dark-card/50 border border-dark-border animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-content-muted">New projects are on the way.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.5, delay: (index % 2) * 0.1, ease: 'easeOut' }}
                onMouseMove={handleCardMouseMove}
                className="glass-panel spotlight-card rounded-2xl border border-dark-border overflow-hidden hover:border-accent/40 transition-all group flex flex-col"
              >
                {/* Image Showcase — Clickable to Case Study */}
                <Link
                  to={`/projects/${project.slug}`}
                  className="relative aspect-video w-full overflow-hidden bg-dark-surface block"
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between p-5 bg-gradient-to-br from-[#14141C] via-[#0F0F15] to-[#0B0B0F]">
                      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        </div>
                        <span className="text-[10px] font-mono text-content-muted truncate max-w-[180px]">
                          {project.slug}.app
                        </span>
                      </div>
                      <div className="my-auto py-4 text-center space-y-1.5">
                        <p className="text-xs font-mono uppercase tracking-widest text-accent/80">
                          {project.category}
                        </p>
                        <p className="text-lg font-bold text-white px-4 line-clamp-1">
                          {project.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono text-content-secondary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md border border-dark-border text-xs font-mono text-accent">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-accent text-black font-semibold text-xs shadow-emerald-sm">
                      <span>Read Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                  <div>
                    <Link to={`/projects/${project.slug}`} className="block">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-content-secondary text-sm leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-dark-surface border border-dark-border text-xs font-mono text-content-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-border/60">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="inline-flex items-center space-x-2 text-sm font-semibold text-white group-hover:text-accent transition-colors"
                      >
                        <span>Case Study</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <div className="flex items-center space-x-3">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-dark-surface hover:bg-dark-hover border border-dark-border text-content-secondary hover:text-white transition-all"
                            title="GitHub Source"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent transition-all"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
