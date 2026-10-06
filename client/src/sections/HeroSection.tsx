import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Settings } from '../types';
import { HeroStats } from '../components/common/HeroStats';
import { HeroVideoCarousel } from '../components/common/HeroVideoCarousel';

interface HeroSectionProps {
  settings?: Settings | null;
}

const proofPoints = [
  'React and TypeScript on the front end',
  'Node.js and MongoDB behind the scenes',
  'A client portal for project updates and files'
];

const oldDefaultHeadline = 'Engineering digital experiences that scale.';
const oldDefaultDescription =
  'Freelance Full-Stack Developer & student building modern, scalable digital experiences with thoughtful UI and production-ready technology.';
const heroHeadline = 'I turn ideas into working websites.';
const heroDescription =
  'I’m a Computer Engineering student and freelance developer. I work with you to plan, build, and polish websites and web apps, and keep you in the loop along the way.';

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const savedHeadline = settings?.heroHeadline?.trim();
  const savedDescription = settings?.heroDescription?.trim();
  const headline = savedHeadline && savedHeadline !== oldDefaultHeadline ? savedHeadline : heroHeadline;
  const description = savedDescription && savedDescription !== oldDefaultDescription
    ? savedDescription
    : heroDescription;
  const availabilityPeriod = settings?.availabilityPeriod?.trim() || 'Q4 2026';
  const availability = /openings?$/i.test(availabilityPeriod)
    ? availabilityPeriod
    : `${availabilityPeriod} Openings`;

  return (
    <section className="relative overflow-hidden pb-4 pt-6 sm:pb-6 sm:pt-8 lg:pb-8 lg:pt-10">
      <div className="w-full">
        <div className="grid items-center gap-y-12 md:grid-cols-2 md:gap-y-10 lg:grid-cols-[45%_55%]">
          <div className="relative z-10 flex flex-col items-start px-4 text-left md:px-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-accent/30 px-4 py-2 text-xs font-mono text-content-secondary shadow-card-dark glass-panel"
            >
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="font-medium text-white">
                {settings?.title &&
                settings.title !== 'Freelance Full-Stack Developer & CS Student' &&
                settings.title !== 'Freelance Developer & CS Student' &&
                settings.title !== 'Full-Stack Developer & CS Student'
                  ? settings.title
                  : 'Freelance Developer & Computer Engineering Student'}
              </span>
              <span className="text-content-muted" aria-hidden="true">·</span>
              <span className="text-accent">{availability}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-[3.65rem] xl:text-7xl"
            >
              {headline === heroHeadline ? (
                <>I turn ideas into <span className="emerald-gradient-text">working websites.</span></>
              ) : headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-content-secondary sm:text-xl"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 text-base font-semibold text-black shadow-emerald-glow transition-all hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
              >
                <span>Explore Work</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-xl border border-dark-border bg-dark-card px-7 py-4 text-base font-semibold text-white transition-all hover:border-accent/50 hover:bg-dark-hover"
              >
                View Services
              </a>
            </motion.div>

          </div>

          <HeroVideoCarousel />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 flex flex-col items-start gap-3 text-xs font-mono text-content-muted sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-3"
          >
            {proofPoints.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent" />
                <span>{point}</span>
              </div>
            ))}
          </motion.div>

          <div className="mt-12 lg:mt-14">
            <HeroStats />
          </div>
        </div>
      </div>
    </section>
  );
};
