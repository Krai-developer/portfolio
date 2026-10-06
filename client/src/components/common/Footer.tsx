import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Dribbble, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { Settings } from '../../types';

interface FooterProps {
  settings?: Settings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="border-t border-dark-border bg-dark-surface/50 backdrop-blur-md pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-dark-border/60">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-mono font-bold text-base">
                KD
              </div>
              <span className="font-bold text-lg text-white">
                KraiDev
              </span>
            </div>
            <p className="text-content-secondary text-sm max-w-sm leading-relaxed">
              I’m a Computer Engineering student and freelance developer. I build websites and web apps
              with a focus on clear design, reliable features, and making them easy to use.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href={settings?.socialLinks?.github || 'https://github.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-content-secondary hover:text-white hover:border-accent transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.linkedin || 'https://linkedin.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-content-secondary hover:text-white hover:border-accent transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.twitter || 'https://twitter.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-content-secondary hover:text-white hover:border-accent transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.dribbble || 'https://dribbble.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-content-secondary hover:text-white hover:border-accent transition-all"
                aria-label="Dribbble"
              >
                <Dribbble className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-content-muted">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-content-secondary">
              <li>
                <a href="#work" className="hover:text-accent transition-colors">
                  Selected Work
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-accent transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-content-muted">
              Client Portal
            </h4>
            <ul className="space-y-2 text-sm text-content-secondary">
              <li>
                <Link
                  to="/client/login"
                  className="inline-flex items-center space-x-1 hover:text-accent transition-colors"
                >
                  <span>Sign in</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="/client/register"
                  className="inline-flex items-center space-x-1 hover:text-accent transition-colors"
                >
                  <span>Create an account</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center space-x-1 text-content-muted hover:text-content-secondary transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-accent/60 mr-1" />
                  <span>Admin sign in</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-4">
          <p>
            &copy; {new Date().getFullYear()} KraiDev. Built with React, TypeScript, Node.js & MongoDB.
          </p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-content-secondary">
              Status: {settings?.availabilityStatus || 'Available for Projects'} ({settings?.availabilityPeriod || 'Q4 2026'})
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
