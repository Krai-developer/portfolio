import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <section id="work" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
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
        </div>

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
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="glass-panel rounded-2xl border border-dark-border overflow-hidden hover:border-accent/40 transition-all group flex flex-col"
              >
                {/* Image Showcase */}
                <div className="relative aspect-video w-full overflow-hidden bg-dark-surface">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-content-muted font-mono text-sm">
                      Interactive Preview
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md border border-dark-border text-xs font-mono text-accent">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
