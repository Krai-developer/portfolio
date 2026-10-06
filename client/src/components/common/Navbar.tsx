import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  ArrowRight,
  Shield,
  LayoutDashboard,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  settings?: {
    availabilityStatus?: string;
    availabilityPeriod?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isClient, isAdmin, isVisitor, logout } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinks = [
    { name: 'About', href: isHome ? '#about' : '/#about' },
    { name: 'Services', href: isHome ? '#services' : '/#services' },
    { name: 'Work', href: isHome ? '#work' : '/#work' },
    { name: 'Contact', href: isHome ? '#contact' : '/#contact' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-border/60 bg-dark-bg/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/40 flex items-center justify-center text-accent font-mono font-bold text-lg shadow-emerald-sm group-hover:scale-105 transition-transform duration-200">
              KD
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block group-hover:text-accent transition-colors">
                KraiDev
              </span>
              <span className="text-[11px] font-mono text-content-muted tracking-widest uppercase block">
                STUDIO &bull; BS COMPUTER ENGINEERING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-content-secondary hover:text-white transition-colors duration-150"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Availability Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/30 text-xs font-medium text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>{settings?.availabilityStatus || 'Available for Projects'}</span>
            </div>

            {/* Auth Dependent Navigation */}
            {isVisitor && (
              <>
                <Link
                  to="/client/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-content-secondary hover:text-white hover:bg-dark-surface border border-transparent hover:border-dark-border transition-all"
                >
                  Client Portal
                </Link>
                <a
                  href={isHome ? '#contact' : '/#contact'}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all hover:scale-[1.02]"
                >
                  <span>Let's Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </>
            )}

            {isClient && (
              <div className="flex items-center space-x-3">
                <Link
                  to="/client/dashboard"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-sm font-medium text-white transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/client/profile"
                  className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-content-secondary hover:text-accent transition-colors"
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-content-muted hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-3">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-content-muted hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-dark-card border border-dark-border text-content-secondary hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-dark-border bg-dark-surface/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/30 text-xs font-medium text-accent w-fit mb-4">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>{settings?.availabilityStatus || 'Available for Projects'}</span>
          </div>

          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-content-secondary hover:text-white py-1"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-dark-border flex flex-col space-y-3">
            {isVisitor && (
              <>
                <Link
                  to="/client/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-dark-card border border-dark-border text-sm font-medium text-white"
                >
                  Client Portal
                </Link>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm"
                >
                  Let's Chat
                </a>
              </>
            )}

            {isClient && (
              <>
                <Link
                  to="/client/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-dark-card border border-dark-border text-sm font-medium text-white flex items-center justify-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <span>Client Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-accent text-black font-semibold text-sm flex items-center justify-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
