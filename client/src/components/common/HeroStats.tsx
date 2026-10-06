import React, { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, BriefcaseBusiness, Heart, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { PortfolioStats } from '../../types';

const metrics = [
  { key: 'yearsLearning', label: 'Years of Learning', suffix: '+', icon: BookOpen },
  { key: 'projectsCompleted', label: 'Projects Completed', suffix: '+', icon: BriefcaseBusiness },
  { key: 'happyClients', label: 'Happy Clients', suffix: '+', icon: Heart },
  { key: 'dedication', label: 'Dedication to Growth', suffix: '%', icon: TrendingUp }
] as const;

const AnimatedValue: React.FC<{ value: number; suffix: string }> = ({ value, suffix }) => {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(Math.round(value));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', setDisplay);
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, rounded, value]);

  return <>{display}{suffix}</>;
};

export const HeroStats: React.FC = () => {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const response = await api.public.getStats();
        if (!response.success || !response.data) throw new Error('Statistics unavailable');
        if (active) {
          setStats(response.data);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStats();
    const interval = window.setInterval(fetchStats, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (stats?.enabled === false) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.4 }}
      aria-live="polite"
      className="mt-14 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-card-dark backdrop-blur-xl sm:p-6"
    >
      {loading && !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Loading portfolio statistics">
          {metrics.map(({ key }) => <div key={key} className="h-24 animate-pulse rounded-xl bg-white/5" />)}
        </div>
      ) : error && !stats ? (
        <p className="py-5 text-center text-sm text-content-muted">Statistics are temporarily unavailable.</p>
      ) : !stats ? (
        <p className="py-5 text-center text-sm text-content-muted">Portfolio statistics will appear here soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {metrics.map(({ key, label, suffix, icon: Icon }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-black/10 px-2 py-4 text-center"
            >
              <Icon className="mb-2 h-4 w-4 text-accent" aria-hidden="true" />
              <div className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                <AnimatedValue value={stats[key] ?? 0} suffix={suffix} />
              </div>
              <div className="mt-1 text-[10px] font-mono uppercase tracking-wide text-content-muted sm:text-xs">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {error && stats && <p className="mt-3 text-center text-xs text-content-muted">Showing the latest saved statistics.</p>}
    </motion.div>
  );
};
