import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BarChart3, PieChart, Activity, CheckCircle, TrendingUp, Layers } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.admin.getAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-dark-card rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-dark-card/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-dark-card/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const statusBreakdown = data?.statusBreakdown || {};
  const typeBreakdown = data?.typeBreakdown || {};
  const inquiryBreakdown = data?.inquiryBreakdown || {};

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          STUDIO PERFORMANCE
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics &amp; Metrics</h1>
        <p className="text-content-secondary text-sm">
          Quantitative metrics covering lifecycle distribution, client pipelines, and inquiries.
        </p>
      </div>

      {/* Average Progress Metric */}
      <div className="glass-panel p-8 rounded-3xl border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-content-muted uppercase">Execution Velocity</span>
          <h3 className="text-2xl font-bold text-white mt-1">Average Project Completion</h3>
          <p className="text-content-secondary text-sm">
            Aggregate completion percentage across active and delivered studio deliverables.
          </p>
        </div>

        <div className="text-center sm:text-right">
          <span className="text-4xl font-extrabold text-accent font-mono">
            {data?.averageProgress || 0}%
          </span>
          <div className="w-48 bg-dark-surface h-2 rounded-full overflow-hidden border border-dark-border mt-2">
            <div
              className="bg-accent h-full rounded-full"
              style={{ width: `${data?.averageProgress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Activity className="w-4 h-4 text-accent" />
            <span>Projects by Lifecycle Status</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(statusBreakdown).length === 0 ? (
              <p className="text-xs text-content-muted">No projects recorded.</p>
            ) : (
              Object.entries(statusBreakdown).map(([status, count]: [string, any]) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-content-secondary uppercase">{status}</span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${Math.min(count * 25, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Types Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Layers className="w-4 h-4 text-accent" />
            <span>Project Classification</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(typeBreakdown).map(([type, count]: [string, any]) => (
              <div key={type} className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white capitalize text-sm">{type} Projects</span>
                  <p className="text-xs text-content-muted font-mono">
                    {type === 'portfolio' ? 'Publicly published showcase' : 'Confidential client workspace'}
                  </p>
                </div>
                <span className="text-2xl font-bold font-mono text-accent">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
