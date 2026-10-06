import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  FolderKanban,
  Users2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.admin.getDashboard();
        if (res.success && res.data) {
          setStats(res.data.stats || {});
          setRecentProjects(res.data.recentProjects || []);
          setRecentContacts(res.data.recentContacts || []);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            EXECUTIVE CONSOLE
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Studio Overview</h1>
          <p className="text-content-secondary text-sm">
            Real-time analytics across public portfolio, client engagements, and message channels.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/projects"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all"
          >
            <span>Manage Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalProjects || 0}</p>
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>Portfolio: {stats.portfolioProjects || 0}</span>
            <span>Client: {stats.activeClientProjects || 0}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase">Total Clients</span>
            <Users2 className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalClients || 0}</p>
          <p className="text-xs text-content-muted">Registered accounts</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase">Unread Messages</span>
            <MessageSquare className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.unreadMessages || 0}</p>
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>Inquiries: {stats.unreadContacts || 0}</span>
            <span>Chats: {stats.unreadClientChats || 0}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-content-muted">
            <span className="text-xs font-mono uppercase">Active Offerings</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalServices || 0}</p>
          <p className="text-xs text-content-muted">{stats.totalSkills || 0} Skills published</p>
        </div>
      </div>

      {/* Two Column Section: Recent Projects & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <FolderKanban className="w-4 h-4 text-accent" />
              <span>Active Projects Breakdown</span>
            </h3>
            <Link to="/admin/projects" className="text-xs text-accent hover:underline">
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-dark-card/50 animate-pulse" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <p className="text-sm text-content-muted py-6 text-center">No projects registered.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-xl bg-dark-card/60 border border-dark-border flex items-center justify-between"
                >
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                    <div className="flex items-center space-x-2 text-xs font-mono text-content-muted">
                      <span className="capitalize text-accent">{p.projectType}</span>
                      <span>&bull;</span>
                      <span className="uppercase">{p.status}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-white font-mono">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Public Inquiries */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-accent" />
              <span>Recent Contact Inquiries</span>
            </h3>
            <Link to="/admin/messages" className="text-xs text-accent hover:underline">
              Inbox &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-dark-card/50 animate-pulse" />
              ))}
            </div>
          ) : recentContacts.length === 0 ? (
            <p className="text-sm text-content-muted py-6 text-center">No inquiries received yet.</p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <div
                  key={c._id}
                  className="p-3.5 rounded-xl bg-dark-card/60 border border-dark-border space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'new'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-dark-surface text-content-muted'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary line-clamp-2">{c.projectBrief}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
