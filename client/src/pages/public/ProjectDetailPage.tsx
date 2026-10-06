import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project } from '../../types';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.public.getProjectBySlug(slug);
        if (res.success && res.data) {
          setProject(res.data);
        } else {
          setError('Project not found or is private.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="h-8 w-32 bg-dark-card rounded mb-8 animate-pulse" />
        <div className="h-96 w-full bg-dark-card rounded-2xl mb-8 animate-pulse" />
        <div className="h-12 w-3/4 bg-dark-card rounded mb-4 animate-pulse" />
        <div className="h-24 w-full bg-dark-card rounded animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Project Not Found</h2>
        <p className="text-content-secondary text-sm">
          {error || 'This project may be private or does not exist.'}
        </p>
        <div className="pt-4">
          <Link
            to="/#work"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/#work"
          className="inline-flex items-center space-x-2 text-sm text-content-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
          <span>{project.category}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {project.title}
        </h1>
        <p className="text-lg sm:text-xl text-content-secondary max-w-3xl leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Hero Showcase Image */}
      {project.image && (
        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-dark-border bg-dark-surface shadow-card-dark">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Meta Bar: Tech stack and Links */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="block text-xs font-mono text-content-muted uppercase tracking-wider mb-2">
            Technologies Used
          </span>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border text-xs font-mono text-content-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-white text-sm font-medium transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Repository</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black text-sm font-semibold hover:bg-accent-hover shadow-emerald-sm transition-all"
            >
              <span>Live Deployment</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Problem & Solution Grid */}
      {(project.problem || project.solution) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {project.problem && (
            <div className="glass-panel p-8 rounded-2xl border border-dark-border space-y-3">
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider block">
                01 &bull; The Challenge
              </span>
              <h3 className="text-xl font-bold text-white">Problem Statement</h3>
              <p className="text-content-secondary text-sm leading-relaxed">{project.problem}</p>
            </div>
          )}

          {project.solution && (
            <div className="glass-panel p-8 rounded-2xl border border-dark-border space-y-3">
              <span className="text-xs font-mono text-accent uppercase tracking-wider block">
                02 &bull; The Architecture
              </span>
              <h3 className="text-xl font-bold text-white">Engineered Solution</h3>
              <p className="text-content-secondary text-sm leading-relaxed">{project.solution}</p>
            </div>
          )}
        </div>
      )}

      {/* Key Features */}
      {project.features && project.features.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Key Functional Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-start space-x-3"
              >
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-sm text-content-secondary leading-relaxed">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Notes */}
      {project.processNotes && project.processNotes.length > 0 && (
        <div className="glass-panel p-8 rounded-2xl border border-dark-border space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span>Development &amp; Optimization Notes</span>
          </h3>
          <ul className="space-y-3">
            {project.processNotes.map((note, idx) => (
              <li key={idx} className="text-sm text-content-secondary flex items-start space-x-2">
                <span className="text-accent font-mono mr-2">&bull;</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Screenshots */}
      {project.screenshots && project.screenshots.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Project Showcase Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.screenshots.map((shot, idx) => (
              <div
                key={idx}
                className="aspect-video rounded-2xl overflow-hidden border border-dark-border bg-dark-surface"
              >
                <img
                  src={shot}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="pt-12 border-t border-dark-border text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Have a similar project in mind?</h3>
        <p className="text-content-secondary text-sm max-w-md mx-auto">
          Let's discuss how we can build a scalable, modern full-stack web application tailored for
          your startup.
        </p>
        <div>
          <Link
            to="/#contact"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all"
          >
            <span>Start a Project Inquiry</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
