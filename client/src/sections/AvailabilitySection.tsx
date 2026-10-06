import React from 'react';
import { Settings } from '../types';
import { Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface AvailabilitySectionProps {
  settings?: Settings | null;
}

export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({ settings }) => {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dark-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Status overview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="uppercase tracking-widest font-semibold">
                  {settings?.availabilityStatus || '● AVAILABLE'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Accepting new client projects for{' '}
                <span className="text-accent">{settings?.availabilityPeriod || 'Q4 2026'}</span>.
              </h3>
              <p className="text-content-secondary text-sm max-w-xl leading-relaxed">
                Whether you need a high-converting startup landing page, an end-to-end full-stack
                MVP, or a custom internal client portal, let's schedule an initial discovery call.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-content-secondary">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Typical response: {settings?.typicalResponseTime || 'Within 24 hours'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>Sprints: 2 to 6 week turnarounds</span>
                </div>
              </div>
            </div>

            {/* CTA action */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <a
                href="#contact"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all text-center"
              >
                <span>Initiate Project Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings?.email || 'cloudyuu124@gmail.com'}`}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-dark-card border border-dark-border text-white font-medium text-sm hover:bg-dark-hover transition-all text-center"
              >
                <span>Direct Email ({settings?.email || 'cloudyuu124@gmail.com'})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
