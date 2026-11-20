import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Settings } from '../types';
import { HeroStats } from '../components/common/HeroStats';
import { HeroWorkspace3D } from '../components/common/HeroWorkspace3D';

interface HeroSectionProps {
  settings?: Settings | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const availabilityPeriod = settings?.availabilityPeriod?.trim() || 'Q4 2026';
  const availability = /openings?$/i.test(availabilityPeriod)
    ? availabilityPeriod
    : `${availabilityPeriod} Openings`;

  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14 min-h-[88vh] flex flex-col justify-between">
      {/* Interactive 3D Developer Workspace Environment */}
      <HeroWorkspace3D />

      {/* Left readability scrim + seamless bottom transition into #0B0B0F */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050b16]/90 via-[#050b16]/55 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/85 to-transparent"
        aria-hidden="true"
      />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-auto">
        <div className="max-w-xl flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-auto inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-cyan-400/30 bg-[#081426]/80 px-4 py-2 text-xs font-mono text-content-secondary shadow-card-dark"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-medium text-white">Software Engineer &amp; AI Engineer</span>
            <span className="text-content-muted" aria-hidden="true">·</span>
            <span className="text-cyan-300">{availability}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Hi, I&apos;m <span className="emerald-gradient-text">Maron Jake Dinopol.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300 sm:text-xl"
          >
            I build intelligent software that turns complex business problems into simple,
            scalable products.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pointer-events-auto mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <a
              href="#work"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 text-base font-semibold text-black shadow-emerald-glow transition-all hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
            >
              <span>Explore My Work</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-[#081426]/80 px-7 py-4 text-base font-semibold text-white transition-all hover:border-cyan-300/70 hover:bg-[#0c1e38]"
            >
              Let&apos;s Talk
            </a>
          </motion.div>
        </div>

        <div className="pointer-events-auto mt-14 lg:mt-16">
          <HeroStats />
        </div>
      </div>
    </section>
  );
};
