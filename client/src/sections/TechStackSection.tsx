import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Skill } from '../types';
import { Terminal } from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.public.getSkills();
        if (res.success && res.data) {
          setSkills(res.data);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Tools', 'Design'];

  const filteredSkills =
    activeCategory === 'All'
      ? skills
      : skills.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());

  // Top technologies for the marquee strip
  const marqueeTech = [
    'React.js',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'Node.js',
    'Express.js',
    'MongoDB',
    'Framer Motion',
    'REST APIs',
    'Figma',
    'Docker',
    'Git & GitHub'
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Infinite Marquee strip - seamlessly edge-faded with no hard borders */}
      <div className="w-full py-5 mb-20 overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex w-[200%] animate-marquee space-x-12 items-center">
          {[...marqueeTech, ...marqueeTech].map((tech, idx) => (
            <div key={idx} className="flex items-center space-x-3 text-content-secondary whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
              <span className="font-mono text-sm tracking-wider uppercase text-content-primary/90 font-medium">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
            <Terminal className="w-3.5 h-3.5" />
            <span>TECHNICAL CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated modern stack.
          </h2>
          <p className="text-content-secondary text-base">
            Every layer selected for performance, developer velocity, and maintainability.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-accent text-black font-semibold shadow-emerald-sm'
                  : 'bg-dark-card border border-dark-border text-content-secondary hover:text-white hover:border-accent/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-dark-card/50 border border-dark-border animate-pulse" />
            ))}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-12 text-content-muted">No skills found in this category.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: 'easeOut' }}
                className="glass-panel p-5 rounded-xl border border-dark-border hover:border-accent/40 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-white group-hover:text-accent transition-colors">
                    {skill.name}
                  </span>
                  <span className="text-xs font-mono text-accent">{skill.proficiency}%</span>
                </div>
                <div>
                  <div className="w-full bg-dark-surface h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.proficiency}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.85, delay: 0.1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-white/50 to-accent h-full rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] font-mono text-content-muted uppercase">
                      {skill.category}
                    </span>
                    {skill.featured && (
                      <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                        Core
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
