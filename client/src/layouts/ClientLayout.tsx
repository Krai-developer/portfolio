import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderGit2,
  CirclePlus,
  MessageSquare,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Briefcase
} from 'lucide-react';

export const ClientLayout: React.FC = () => {
  const { user, profile, loading, isAuthenticated, isClient, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-content-muted">Verifying Client Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  if (!isClient) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const navItems = [
    { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', href: '/client/projects', icon: FolderGit2 },
    { name: 'Request a Project', href: '/client/request-project', icon: CirclePlus },
    { name: 'Messages', href: '/client/messages', icon: MessageSquare },
    { name: 'Files', href: '/client/files', icon: FileText },
    { name: 'Profile', href: '/client/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-content-primary flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-dark-border bg-dark-surface/90 backdrop-blur-xl fixed inset-y-0 z-30">
        {/* Brand header */}
        <div className="h-20 flex items-center px-6 border-b border-dark-border/60 justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-mono font-bold text-sm">
              MD
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Maron Jake Dinopol</span>
              <span className="text-[10px] font-mono text-accent block">CLIENT PORTAL</span>
            </div>
          </Link>
          <Link to="/" className="text-content-muted hover:text-white p-1" title="View Public Portfolio">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Client Profile Snippet */}
        <div className="px-6 py-5 border-b border-dark-border/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-dark-card border border-accent/40 overflow-hidden flex items-center justify-center font-bold text-white text-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name.charAt(0)
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-content-secondary truncate flex items-center space-x-1">
                <Briefcase className="w-3 h-3 text-accent inline mr-1" />
                <span>{profile?.company || 'Client Account'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom sign out */}
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
            <span className="font-bold text-sm text-white">Client Portal</span>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-xs text-accent hover:underline flex items-center space-x-1">
              <span>Studio</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 max-w-xs bg-dark-surface border-r border-dark-border flex flex-col z-10">
              <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border">
                <span className="font-bold text-sm text-white">Client Portal</span>
                <button onClick={() => setSidebarOpen(false)} className="text-content-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-dark-border">
                <p className="font-medium text-sm text-white">{user?.name}</p>
                <p className="text-xs text-accent">{profile?.company || 'Client Account'}</p>
              </div>
              <nav className="flex-1 p-4 space-y-1">
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

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
