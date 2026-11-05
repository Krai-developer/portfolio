import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Download,
  MessageSquare,
  Send,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Lock,
  ShieldCheck
} from 'lucide-react';

type PortalTab = 'milestones' | 'files' | 'messages';

interface DemoMilestone {
  id: string;
  title: string;
  description: string;
  due: string;
  status: 'completed' | 'in-progress' | 'pending';
}

const initialMilestones: DemoMilestone[] = [
  {
    id: 'm1',
    title: '01. Discovery & System Architecture',
    description: 'Database schema, API contract design, and interactive wireframe sign-off.',
    due: 'Week 1',
    status: 'completed'
  },
  {
    id: 'm2',
    title: '02. Responsive UI & Design System',
    description: 'Dark + White Smoke theme tokens, glassmorphic components, and motion polish.',
    due: 'Week 2',
    status: 'completed'
  },
  {
    id: 'm3',
    title: '03. Backend API & Auth Integration',
    description: 'JWT role-based authentication, protected endpoints, and MongoDB integration.',
    due: 'Week 3',
    status: 'in-progress'
  },
  {
    id: 'm4',
    title: '04. QA Testing & Production Launch',
    description: 'Lighthouse optimization, custom domain SSL setup, and final handover.',
    due: 'Week 4',
    status: 'pending'
  }
];

const demoFiles = [
  {
    id: 'f1',
    name: 'System-Architecture-Blueprint.pdf',
    type: 'PDF Document',
    size: '2.4 MB',
    uploadedAt: '2 days ago',
    badge: 'Approved'
  },
  {
    id: 'f2',
    name: 'UI-Design-Tokens-v2.fig',
    type: 'Figma Source',
    size: '14.8 MB',
    uploadedAt: 'Yesterday',
    badge: 'Latest'
  },
  {
    id: 'f3',
    name: 'Staging-Environment-Credentials.txt',
    type: 'Encrypted Note',
    size: '4.1 KB',
    uploadedAt: '3 hours ago',
    badge: 'Staging'
  }
];

const initialMessages = [
  {
    id: 'msg1',
    sender: 'Maron Jake Dinopol',
    role: 'Developer',
    time: '10:24 AM',
    text: 'Hey! I just pushed the updated dashboard build to staging and completed Milestone 02. Feel free to test the live preview!'
  },
  {
    id: 'msg2',
    sender: 'Alex Mercer',
    role: 'Client',
    time: '10:31 AM',
    text: 'Just checked it on mobile and desktop—the transitions feel super smooth. Let’s proceed to the API integration phase!'
  }
];

export const ClientPortalPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortalTab>('milestones');
  const [milestones, setMilestones] = useState<DemoMilestone[]>(initialMilestones);
  const [messages, setMessages] = useState(initialMessages);
  const [draftMessage, setDraftMessage] = useState('');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'in-progress').length;
  const progressPercent = Math.round(
    ((completedCount + inProgressCount * 0.5) / milestones.length) * 100
  );

  const cycleMilestoneStatus = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextStatus: DemoMilestone['status'] =
          m.status === 'completed'
            ? 'pending'
            : m.status === 'in-progress'
            ? 'completed'
            : 'in-progress';
        return { ...m, status: nextStatus };
      })
    );
  };

  const handleSendQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'You (Client Preview)',
        role: 'Client',
        time: 'Just now',
        text: draftMessage.trim()
      }
    ]);
    setDraftMessage('');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="portal" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6"
        >
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>INTERACTIVE CLIENT PORTAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              No guessing games. Track your project in real time.
            </h2>
            <p className="text-content-secondary text-base leading-relaxed">
              Every client gets a dedicated workspace to watch milestone progress, download deliverables,
              and message me directly. Try clicking the tabs and milestones below to test how it works.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/client/login"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border hover:border-accent/40 text-sm font-semibold text-white transition-all"
            >
              <Lock className="w-4 h-4 text-accent" />
              <span>Open Live Client Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Interactive Browser Frame */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onMouseMove={handleMouseMove}
          className="glass-panel spotlight-card rounded-2xl border border-dark-border shadow-card-dark overflow-hidden"
        >
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-dark-border/80 bg-[#0B0B0F]/80">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="w-3 h-3 rounded-full bg-white/15" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md bg-dark-surface border border-dark-border text-xs font-mono text-content-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>krai-dev.vercel.app/client/projects/saas-platform</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Demo — Click to explore</span>
            </div>
          </div>

          {/* Portal Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
            {/* Left Sidebar Summary */}
            <div className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-dark-border/70 flex flex-col justify-between bg-[#0B0B0F]/40">
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] font-mono text-accent mb-3">
                    ACTIVE SPRINT • DEVELOPMENT
                  </span>
                  <h3 className="text-xl font-bold text-white">Next-Gen SaaS Web App</h3>
                  <p className="text-xs text-content-muted mt-1 font-mono">
                    Client: Acme Ventures • Target Delivery: 4 Weeks
                  </p>
                </div>

                {/* Live Synced Progress Bar */}
                <div className="p-4 rounded-xl bg-dark-surface/90 border border-dark-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-content-secondary">OVERALL COMPLETION</span>
                    <span className="text-white font-bold text-sm">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-dark-card rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-white/50 via-[#F5F5F5] to-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[11px] text-content-muted">
                    {completedCount} of {milestones.length} milestones completed (click any milestone on the right to toggle)
                  </p>
                </div>

                {/* Navigation Tabs */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('milestones')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'milestones'
                        ? 'bg-accent text-black font-semibold shadow-emerald-sm'
                        : 'text-content-secondary hover:text-white hover:bg-dark-card/70'
                    }`}
                  >
                    <span className="flex items-center space-x-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1. Milestone Roadmap</span>
                    </span>
                    <span className="text-xs font-mono opacity-80">{milestones.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('files')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'files'
                        ? 'bg-accent text-black font-semibold shadow-emerald-sm'
                        : 'text-content-secondary hover:text-white hover:bg-dark-card/70'
                    }`}
                  >
                    <span className="flex items-center space-x-3">
                      <FileText className="w-4 h-4" />
                      <span>2. Files &amp; Deliverables</span>
                    </span>
                    <span className="text-xs font-mono opacity-80">{demoFiles.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('messages')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'messages'
                        ? 'bg-accent text-black font-semibold shadow-emerald-sm'
                        : 'text-content-secondary hover:text-white hover:bg-dark-card/70'
                    }`}
                  >
                    <span className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4" />
                      <span>3. Direct Project Chat</span>
                    </span>
                    <span className="text-xs font-mono opacity-80">{messages.length}</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-dark-border/60 flex items-center justify-between text-xs text-content-muted">
                <span>Role-based encrypted portal</span>
                <a href="#contact" className="text-accent hover:underline font-mono">
                  Start a project &rarr;
                </a>
              </div>
            </div>

            {/* Right Interactive Panel */}
            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {activeTab === 'milestones' && (
                  <motion.div
                    key="milestones"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-base font-bold text-white">Live Milestone Checklist</h4>
                        <p className="text-xs text-content-muted">
                          Click any milestone card below to simulate real-time progress updates.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-accent px-2.5 py-1 rounded-md bg-dark-card border border-dark-border">
                        Auto-Sync Enabled
                      </span>
                    </div>

                    <div className="space-y-3">
                      {milestones.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => cycleMilestoneStatus(m.id)}
                          className="w-full text-left p-4 rounded-xl bg-dark-surface/80 hover:bg-dark-card border border-dark-border hover:border-accent/40 transition-all flex items-start justify-between gap-4 group"
                        >
                          <div className="flex items-start space-x-3.5">
                            <div className="mt-0.5">
                              {m.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : m.status === 'in-progress' ? (
                                <Clock className="w-5 h-5 text-accent animate-pulse" />
                              ) : (
                                <Circle className="w-5 h-5 text-content-muted group-hover:text-white" />
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-sm font-semibold transition-colors ${
                                  m.status === 'completed'
                                    ? 'text-white'
                                    : m.status === 'in-progress'
                                    ? 'text-accent'
                                    : 'text-content-secondary'
                                }`}
                              >
                                {m.title}
                              </p>
                              <p className="text-xs text-content-muted mt-1">{m.description}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end flex-shrink-0 gap-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                                m.status === 'completed'
                                  ? 'bg-white/15 text-white border-white/30'
                                  : m.status === 'in-progress'
                                  ? 'bg-accent/10 text-accent border-accent/30'
                                  : 'bg-dark-card text-content-muted border-dark-border'
                              }`}
                            >
                              {m.status === 'completed'
                                ? 'Completed'
                                : m.status === 'in-progress'
                                ? 'In Progress'
                                : 'Pending'}
                            </span>
                            <span className="text-[11px] font-mono text-content-muted">{m.due}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-base font-bold text-white">Shared Project Deliverables</h4>
                        <p className="text-xs text-content-muted">
                          All design files, staging links, and documentation organized in one vault.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {demoFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-4 rounded-xl bg-dark-surface/80 border border-dark-border hover:border-accent/40 transition-all flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-accent flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                              <p className="text-xs text-content-muted font-mono mt-0.5">
                                {file.type} • {file.size} • {file.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 flex-shrink-0">
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-mono text-white">
                              {file.badge}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDownloadedId(file.id)}
                              className="px-3 py-1.5 rounded-lg bg-dark-card hover:bg-accent hover:text-black border border-dark-border text-xs font-mono text-white transition-all inline-flex items-center space-x-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{downloadedId === file.id ? 'Ready ✓' : 'Preview'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'messages' && (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col h-full justify-between space-y-4"
                  >
                    <div>
                      <div className="mb-3">
                        <h4 className="text-base font-bold text-white">Direct Project Thread</h4>
                        <p className="text-xs text-content-muted">
                          Ask questions or leave feedback right alongside your project milestones.
                        </p>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-xl border ${
                              msg.role === 'Developer'
                                ? 'bg-dark-surface/90 border-dark-border'
                                : 'bg-white/[0.06] border-white/20 ml-6'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-white">
                                {msg.sender}{' '}
                                <span className="font-mono text-[11px] text-accent ml-1">
                                  ({msg.role})
                                </span>
                              </span>
                              <span className="font-mono text-content-muted text-[11px]">
                                {msg.time}
                              </span>
                            </div>
                            <p className="text-sm text-content-secondary leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendQuickReply} className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        placeholder="Type a test message in the demo thread..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-white placeholder-content-muted focus:outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-all inline-flex items-center space-x-1.5"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
