import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Project } from '../../types';
import {
  FolderKanban,
  CheckCircle2,
  MessageSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';

export const ClientDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    unreadMessages: 0,
    pendingMilestones: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.client.getDashboard();
        if (res.success && res.data) {
          setStats(res.data.stats);
          setRecentProjects(res.data.recentProjects || []);
        }
      } catch (err) {
        console.error('Failed to load client dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'development':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'design':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'review':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-dark-card text-content-secondary border-dark-border';
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            CLIENT PORTAL OVERVIEW
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-content-secondary text-sm">
            {profile?.company
              ? `Workspace for ${profile.company} &bull; Real-time development progress`
              : 'Real-time project tracking, milestone updates, and deliverables.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/client/request-project"
            className="inline-flex items-center space-x-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-accent-hover"
          >
            <span>Request a Project</span>
          </Link>
          <Link
            to="/client/messages"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-sm font-medium text-white hover:border-accent transition-all"
          >
            <MessageSquare className="w-4 h-4 text-accent" />
            <span>Message Maron</span>
          </Link>
          <Link
            to="/client/projects"
            className="inline-flex items-center space-x-2 rounded-xl border border-dark-border bg-dark-card px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-accent"
          >
            <span>All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.activeProjects}</p>
          <p className="text-xs text-content-muted">In active development</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.completedProjects}</p>
          <p className="text-xs text-content-muted">Delivered &amp; live</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase tracking-wider">Unread Messages</span>
            <MessageSquare className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.unreadMessages}</p>
          <p className="text-xs text-content-muted">From Maron Jake Dinopol</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase tracking-wider">Pending Milestones</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.pendingMilestones}</p>
          <p className="text-xs text-content-muted">Upcoming delivery dates</p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Your Assigned Projects</span>
            <span className="text-xs font-mono text-content-muted">({recentProjects.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-dark-card/50 border border-dark-border animate-pulse" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-dark-card border border-dark-border text-accent mx-auto flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Assigned Projects Yet</h3>
            <p className="text-content-secondary text-sm max-w-md mx-auto">
              Send Maron a project request from your portal. Once you’ve agreed on the details, he’ll
              add it here so you can follow its progress.
            </p>
            <div className="pt-2">
              <Link
                to="/client/request-project"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm"
              >
                <span>Request a Project</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recentProjects.map((project) => (
              <div
                key={project._id}
                className="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-border hover:border-accent/40 transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase border ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-content-secondary text-sm line-clamp-1">{project.description}</p>
                  </div>

                  <Link
                    to={`/client/projects/${project._id}`}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all self-start sm:self-auto"
                  >
                    <span>View Project Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-content-secondary">
                      Current Milestone:{' '}
                      <span className="text-white font-medium">
                        {project.currentMilestone || 'In Development'}
                      </span>
                    </span>
                    <span className="text-accent font-bold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-dark-surface h-2.5 rounded-full overflow-hidden border border-dark-border/50">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-700 shadow-emerald-sm"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-4 border-t border-dark-border/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-content-muted">
                  <div className="flex items-center space-x-4">
                    <span>
                      Target Delivery:{' '}
                      <span className="text-content-secondary">
                        {project.targetEndDate
                          ? new Date(project.targetEndDate).toLocaleDateString()
                          : 'In Progress'}
                      </span>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Last Updated:{' '}
                      <span className="text-content-secondary">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/client/projects/${project._id}#milestones`}
                      className="text-accent hover:underline"
                    >
                      Milestones &rarr;
                    </Link>
                    <Link
                      to={`/client/projects/${project._id}#files`}
                      className="text-accent hover:underline"
                    >
                      Files &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
