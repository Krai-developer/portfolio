import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project } from '../../types';
import { FolderGit2, ArrowRight, Clock, FileText, CheckCircle2 } from 'lucide-react';

export const ClientProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.client.getProjects();
        if (res.success && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error('Failed to load client projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'development':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'design':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-dark-card text-content-secondary border-dark-border';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          PROJECT REPOSITORY
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Projects</h1>
        <p className="text-content-secondary text-sm">
          Track milestones, inspect deliverables, and manage file assets for all your active and
          delivered projects.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-dark-card/50 border border-dark-border animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center space-y-4">
          <FolderGit2 className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-lg font-bold text-white">No Projects Active</h3>
          <p className="text-content-secondary text-sm max-w-sm mx-auto">
            You do not currently have any projects assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-border hover:border-accent/40 transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase border ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-content-secondary text-sm">{project.description}</p>
                </div>

                <Link
                  to={`/client/projects/${project._id}`}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all self-start sm:self-auto"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Progress and status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-content-secondary">
                    Active Milestone:{' '}
                    <span className="text-white font-medium">
                      {project.currentMilestone || 'All milestones finished'}
                    </span>
                  </span>
                  <span className="text-accent font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden border border-dark-border">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-700"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Project metrics */}
              <div className="pt-4 border-t border-dark-border/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-content-muted">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{project.milestoneCount || 0} Milestones</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span>{project.fileCount || 0} Project Files</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {project.technologies?.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-dark-card border border-dark-border text-xs text-content-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
