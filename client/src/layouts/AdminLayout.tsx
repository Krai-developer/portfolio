import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  Briefcase,
  Sparkles,
  MessageSquareCode,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-content-muted">Authorizing Administrator...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">403 Forbidden</h2>
          <p className="text-content-secondary text-sm">
            You don't have permission to access the admin studio console.
          </p>
          <div className="pt-2">
            <Link
              to="/client/dashboard"
              className="inline-block px-4 py-2 rounded-lg bg-accent text-black font-semibold text-sm"
            >
              Go to Client Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Clients', href: '/admin/clients', icon: Users2 },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Skills', href: '/admin/skills', icon: Sparkles },
    { name: 'Messages & Inquiries', href: '/admin/messages', icon: MessageSquareCode },
    { name: 'Users & Roles', href: '/admin/users', icon: Shield },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-content-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-dark-border bg-dark-surface/95 backdrop-blur-xl fixed inset-y-0 z-30">
        {/* Brand header */}
        <div className="h-20 flex items-center px-6 border-b border-dark-border/60 justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent text-black flex items-center justify-center font-mono font-bold text-sm shadow-emerald-sm">
              AR
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Studio Admin</span>
              <span className="text-[10px] font-mono text-accent block">SUPERUSER RBAC</span>
            </div>
          </Link>
          <Link to="/" className="text-content-muted hover:text-white p-1" title="View Public Website">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Admin profile snippet */}
        <div className="px-6 py-4 border-b border-dark-border/40 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-dark-card border border-accent/40 overflow-hidden flex items-center justify-center font-bold text-white text-xs">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              'A'
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] font-mono text-accent truncate">Administrator</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/30 shadow-emerald-sm'
                    : 'text-content-secondary hover:text-white hover:bg-dark-card'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-content-muted'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-dark-border/60">
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-content-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-dark-border bg-dark-surface/90 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-dark-card border border-dark-border text-content-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-white">Admin Console</span>
          </div>
          <Link to="/" className="text-xs text-accent hover:underline flex items-center space-x-1">
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 max-w-xs bg-dark-surface border-r border-dark-border flex flex-col z-10">
              <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border">
                <span className="font-bold text-sm text-white">Admin Console</span>
                <button onClick={() => setSidebarOpen(false)} className="text-content-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-content-secondary hover:text-white hover:bg-dark-card"
                  >
                    <item.icon className="w-4 h-4 text-accent" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-dark-border">
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center space-x-2 text-sm text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Container */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
