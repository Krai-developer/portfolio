import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Rocket,
  Layers,
  Sparkles,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

export const AboutBentoSection: React.FC = () => {
  return (
    <section id="about" className="relative pb-24 pt-8 sm:pt-10 lg:pt-12">
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>A LITTLE ABOUT ME</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            I’m learning, building, and getting better with every project.
          </h2>
          <p className="text-content-secondary text-base leading-relaxed">
            I’m a Computer Engineering student and freelance developer. I enjoy turning ideas into useful
            websites, learning as I go, and paying attention to the details people use every day.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Fast Learner & Modern Stack (2 cols on lg) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center text-accent mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Learning by building
            </h3>
            <p className="text-content-secondary text-sm leading-relaxed mb-4">
              I learn new tools by putting them to work in real projects. My focus is on clear
              interfaces, useful features, and code that’s straightforward to maintain.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-dark-card border border-dark-border text-xs font-mono text-accent">
                React & TypeScript
              </span>
              <span className="px-2.5 py-1 rounded-md bg-dark-card border border-dark-border text-xs font-mono text-content-secondary">
                Node.js
              </span>
              <span className="px-2.5 py-1 rounded-md bg-dark-card border border-dark-border text-xs font-mono text-content-secondary">
                MongoDB
              </span>
            </div>
          </motion.div>

          {/* Card 2: Direct Communication (1 col) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center text-accent mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Work directly with me</h3>
              <p className="text-content-secondary text-sm leading-relaxed">
                You’ll talk with the person designing and building your project, from our first
                conversation through delivery.
              </p>
            </div>
            <div className="pt-6">
            <p className="text-xs font-mono text-accent">Clear updates along the way &rarr;</p>
            </div>
          </motion.div>

          {/* Card 3: Production Security Rigor (1 col) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center text-accent mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Security from the start</h3>
              <p className="text-content-secondary text-sm leading-relaxed">
                I use sensible safeguards like protected sessions and role-based access, and take care
                with how an app handles people’s information.
              </p>
            </div>
            <div className="pt-6">
              <span className="inline-block px-2 py-0.5 rounded bg-accent/10 text-accent text-[11px] font-mono">
                Role-based access
              </span>
            </div>
          </motion.div>

          {/* Card 4: Built-in Client Portal (1 col) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center text-accent mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">A clear view of your project</h3>
            <p className="text-content-secondary text-sm leading-relaxed">
              The client portal brings project updates, files, and messages together, so you can see
              what’s happening and find what you need in one place.
            </p>
          </motion.div>

          {/* Card 5: Creative Developer Polish (3 cols on lg) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-3 glass-panel p-8 rounded-2xl border border-dark-border relative overflow-hidden group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center text-accent mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Thoughtful details, not just decoration
                </h3>
                <p className="text-content-secondary text-sm max-w-xl leading-relaxed">
                  I build responsive pages with considered spacing and small interactions that help
                  the interface feel clear and natural.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:min-w-64">
                <div className="p-4 rounded-xl bg-dark-card border border-dark-border text-center">
                  <p className="text-sm font-semibold text-accent">Responsive</p>
                  <p className="mt-1 text-xs text-content-muted">For mobile and desktop</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-card border border-dark-border text-center">
                  <p className="text-sm font-semibold text-white">Considered</p>
                  <p className="mt-1 text-xs text-content-muted">Motion and interaction</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
