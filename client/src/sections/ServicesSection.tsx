import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Service } from '../types';
import { Layout, Palette, Cpu, Zap, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.public.getServices();
        if (res.success && res.data) {
          setServices(res.data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getServiceIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'layout':
        return <Layout className="w-6 h-6" />;
      case 'palette':
        return <Palette className="w-6 h-6" />;
      case 'cpu':
        return <Cpu className="w-6 h-6" />;
      case 'zap':
        return <Zap className="w-6 h-6" />;
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <section id="services" className="py-24 relative">
      <div className="w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
            <Layers className="w-3.5 h-3.5" />
            <span>SERVICES &amp; DELIVERABLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How we can collaborate.
          </h2>
          <p className="text-content-secondary text-base">
            High-impact freelance engagements designed for fast delivery, clean architecture, and
            delightful user experience.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-dark-card/50 border border-dark-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service._id}
                className="glass-panel p-8 rounded-2xl border border-dark-border hover:border-accent/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/15 transition-all pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center text-accent mb-6 group-hover:scale-105 transition-transform">
                    {getServiceIcon(service.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-content-secondary text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div>
                  <div className="pt-4 border-t border-dark-border/60">
                    <p className="text-xs font-mono text-content-muted uppercase tracking-wider mb-2">
                      Technologies
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {service.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-dark-card border border-dark-border text-xs font-mono text-content-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-accent hover:text-white transition-colors"
                  >
                    <span>Request Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
