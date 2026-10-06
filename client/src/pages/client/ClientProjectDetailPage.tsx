import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project, Milestone, ProjectFile, Message } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Send,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Layers,
  UploadCloud
} from 'lucide-react';

export const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'files' | 'messages'>(
    'overview'
  );

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.client.getProjectDetails(id);
      if (res.success && res.data) {
        setProject(res.data);
        setMilestones(res.data.milestones || []);
        setFiles(res.data.files || []);
        setMessages(res.data.messages || []);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Forbidden')) {
        setForbidden(true);
      } else {
        setError(err.message || 'Failed to load project details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      const res = await api.client.sendMessage({
        projectId: id,
        content: newMessage.trim()
      });
      if (res.success && res.data) {
        setMessages([...messages, res.data]);
        setNewMessage('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileUrl.trim() || !id) return;

    try {
      const res = await api.admin.uploadFile(id, {
        name: newFileName.trim(),
        url: newFileUrl.trim(),
        type: 'document',
        size: 1024 * 512
      });
      if (res.success && res.data) {
        setFiles([res.data, ...files]);
        setUploadModalOpen(false);
        setNewFileName('');
        setNewFileUrl('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload file record.');
    }
  };

  if (forbidden) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">403 Access Forbidden</h2>
        <p className="text-content-secondary text-sm">
          You do not have permission to view this project. It belongs to another client account or is
          restricted.
        </p>
        <div className="pt-4">
          <Link
            to="/client/projects"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-dark-card rounded animate-pulse" />
        <div className="h-44 w-full bg-dark-card rounded-2xl animate-pulse" />
        <div className="h-96 w-full bg-dark-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-red-400">{error || 'Project not found'}</p>
        <Link to="/client/projects" className="text-accent underline text-sm">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/client/projects"
          className="inline-flex items-center space-x-2 text-sm text-content-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Projects</span>
        </Link>
      </div>

      {/* Project Banner & Status */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
                {project.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-xs font-mono uppercase text-content-secondary">
                Status: {project.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h1>
            <p className="text-content-secondary text-sm max-w-2xl mt-1">{project.description}</p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-card border border-dark-border text-center min-w-[140px]">
            <span className="text-xs font-mono text-content-muted block">Overall Progress</span>
            <span className="text-3xl font-extrabold text-accent font-mono">
              {project.progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-dark-surface h-3 rounded-full overflow-hidden border border-dark-border">
          <div
            className="bg-accent h-full rounded-full transition-all duration-700 shadow-emerald-sm"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        {/* Timeline Dates */}
        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-content-muted border-t border-dark-border/60">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>
              Start Date:{' '}
              <span className="text-content-secondary">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>
              Target Delivery:{' '}
              <span className="text-content-secondary">
                {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'Active'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-dark-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-accent text-black font-semibold'
              : 'text-content-secondary hover:text-white'
          }`}
        >
          Overview &amp; Scope
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'milestones'
              ? 'bg-accent text-black font-semibold'
              : 'text-content-secondary hover:text-white'
          }`}
        >
          Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'files'
              ? 'bg-accent text-black font-semibold'
              : 'text-content-secondary hover:text-white'
          }`}
        >
          Files &amp; Assets ({files.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'messages'
              ? 'bg-accent text-black font-semibold'
              : 'text-content-secondary hover:text-white'
          }`}
        >
          Project Messages ({messages.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
            <h3 className="text-lg font-bold text-white">Project Objective &amp; Problem</h3>
            <p className="text-content-secondary text-sm leading-relaxed">
              {project.problem ||
                'Project objective defined in initial technical scoping sessions with Maron Jake Dinopol.'}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
            <h3 className="text-lg font-bold text-white">Technical Architecture</h3>
            <p className="text-content-secondary text-sm leading-relaxed">
              {project.solution ||
                'Full-stack architecture leveraging TypeScript, React components, and secure backend REST APIs.'}
            </p>
            <div className="pt-2">
              <span className="text-xs font-mono text-content-muted block mb-2">Stack Elements</span>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-dark-card border border-dark-border text-xs text-content-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Project Milestones Timeline</h3>
            <span className="text-xs font-mono text-content-muted">
              Updates from Maron Jake Dinopol
            </span>
          </div>

          {milestones.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-dark-border text-center text-content-muted">
              No milestones created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={m._id}
                  className={`p-6 rounded-2xl border transition-all ${
                    m.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : m.status === 'in-progress'
                      ? 'bg-accent/5 border-accent/40 shadow-emerald-sm'
                      : 'bg-dark-card/60 border-dark-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {m.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : m.status === 'in-progress' ? (
                          <Clock className="w-5 h-5 text-accent animate-pulse" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-content-muted" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-base">{m.title}</h4>
                        <p className="text-content-secondary text-sm mt-0.5">{m.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-mono pl-8 sm:pl-0">
                      {m.dueDate && (
                        <span className="text-content-muted">
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full uppercase font-medium ${
                          m.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : m.status === 'in-progress'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-dark-surface text-content-muted'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Files */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Project Files &amp; Deliverables</h3>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent-hover transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Attach File Link</span>
            </button>
          </div>

          {files.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-dark-border text-center text-content-muted">
              No files shared for this project yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="glass-panel p-5 rounded-xl border border-dark-border hover:border-accent/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-accent flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                      <p className="text-xs text-content-muted font-mono">
                        {(file.size / 1024).toFixed(1)} KB &bull;{' '}
                        {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-dark-card hover:bg-accent hover:text-black text-content-secondary transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Modal for adding file */}
          {uploadModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
                <h3 className="text-lg font-bold text-white">Attach Project File Link</h3>
                <form onSubmit={handleUploadFile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-content-muted mb-1">
                      File Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="e.g. Q4_Specs.pdf"
                      className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-content-muted mb-1">
                      File URL (Google Drive, Figma, S3, or link)
                    </label>
                    <input
                      type="url"
                      required
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-sm text-content-secondary hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-accent text-black font-semibold text-sm hover:bg-accent-hover"
                    >
                      Save File Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Messages */}
      {activeTab === 'messages' && (
        <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-dark-border/60 bg-dark-surface/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Chat with Maron</span>
            <span className="text-xs font-mono text-accent">Active Project Thread</span>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-content-muted space-y-2">
                <MessageSquare className="w-8 h-8 text-accent/50" />
                <p className="text-sm">No messages yet. Send Maron a note about this project.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId?.role === 'client';
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-white">{msg.senderId?.name}</span>
                      <span className="text-[10px] font-mono text-content-muted">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div
                      className={`max-w-md p-4 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-accent text-black rounded-tr-none font-medium'
                          : 'bg-dark-card border border-dark-border text-white rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-border bg-dark-surface/80 flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message to Maron..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border focus:border-accent focus:outline-none text-white text-sm"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-accent text-black hover:bg-accent-hover transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
