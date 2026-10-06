import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ContactMessage, Message } from '../../types';
import {
  Inbox,
  MessageSquare,
  CheckCircle,
  Archive,
  Trash2,
  Send,
  Mail,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'clientChats'>('contacts');
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [clientMessages, setClientMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply modal / state for client messages
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyProjectId, setReplyProjectId] = useState('');
  const [replyClientId, setReplyClientId] = useState('');
  const [replyClientName, setReplyClientName] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getMessages();
      if (res.success && res.data) {
        setContactMessages(res.data.contactMessages || []);
        setClientMessages(res.data.clientMessages || []);
      }
    } catch (err) {
      console.error('Failed to load admin messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMessages();
  }, []);

  const handleUpdateContactStatus = async (id: string, status: string) => {
    try {
      await api.admin.updateContactStatus(id, status);
      fetchAllMessages();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Delete this contact inquiry permanently?')) return;
    try {
      await api.admin.deleteContactMessage(id);
      fetchAllMessages();
    } catch (err) {
      alert('Failed to delete contact message.');
    }
  };

  const openReplyModal = (msg: Message) => {
    const pId = typeof msg.projectId === 'object' ? (msg.projectId as any)._id : msg.projectId;
    const cId = msg.senderId?._id;
    setReplyProjectId(pId);
    setReplyClientId(cId);
    setReplyClientName(msg.senderId?.name || 'Client');
    setReplyContent('');
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyProjectId || !replyClientId) return;

    try {
      await api.admin.replyMessage({
        projectId: replyProjectId,
        clientId: replyClientId,
        content: replyContent.trim()
      });
      setReplyModalOpen(false);
      setReplyContent('');
      fetchAllMessages();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          COMMUNICATIONS HUB
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Messages &amp; Inquiries</h1>
        <p className="text-content-secondary text-sm">
          Review website inquiries and new project requests from clients, then reply to active project threads.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-dark-border pb-3">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'contacts'
              ? 'bg-accent text-black font-semibold'
              : 'text-content-secondary hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Project Requests &amp; Inquiries ({contactMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clientChats')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'clientChats'
              ? 'bg-accent text-black font-semibold'
              : 'text-content-secondary hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Client Project Threads ({clientMessages.length})</span>
        </button>
      </div>

      {/* Tab 1: Project Requests and Public Inquiries */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-dark-card/50 animate-pulse" />
              ))}
            </div>
          ) : contactMessages.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center text-content-muted">
              No project requests or website inquiries yet.
            </div>
          ) : (
            contactMessages.map((msg) => (
              <div
                key={msg._id}
                className="glass-panel p-6 rounded-2xl border border-dark-border space-y-4 hover:border-accent/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {msg.projectName && (
                        <h3 className="font-bold text-white text-base">{msg.projectName}</h3>
                      )}
                      <h3 className="font-bold text-white text-base">{msg.name}</h3>
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-mono uppercase text-accent">
                        {msg.source === 'client_portal' ? 'Client portal request' : 'Website inquiry'}
                      </span>
                      <span
                        className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                          msg.status === 'new'
                            ? 'bg-accent/20 text-accent border-accent/40'
                            : msg.status === 'replied'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-dark-surface text-content-muted border-dark-border'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-accent hover:underline flex items-center space-x-1 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{msg.email}</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-content-muted">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => handleUpdateContactStatus(msg._id, 'read')}
                      className="px-2.5 py-1 rounded bg-dark-card hover:bg-dark-hover border border-dark-border text-content-secondary"
                    >
                      Read
                    </button>
                    <button
                      onClick={() => handleUpdateContactStatus(msg._id, 'replied')}
                      className="px-2.5 py-1 rounded bg-dark-card hover:bg-dark-hover border border-dark-border text-accent"
                    >
                      Replied
                    </button>
                    <button
                      onClick={() => handleUpdateContactStatus(msg._id, 'archived')}
                      className="p-1 rounded bg-dark-card hover:bg-dark-hover border border-dark-border text-content-muted"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(msg._id)}
                      className="p-1 rounded bg-dark-card hover:bg-red-500/10 border border-dark-border text-content-muted hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-surface/60 border border-dark-border/60 text-sm text-content-secondary leading-relaxed">
                  {msg.projectBrief}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Client Project Threads */}
      {activeTab === 'clientChats' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-dark-card/50 animate-pulse" />
              ))}
            </div>
          ) : clientMessages.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center text-content-muted">
              No client conversations recorded.
            </div>
          ) : (
            <div className="divide-y divide-dark-border glass-panel rounded-2xl border border-dark-border overflow-hidden">
              {clientMessages.map((msg) => {
                const projectTitle =
                  typeof msg.projectId === 'object' && msg.projectId
                    ? (msg.projectId as any).title
                    : 'Project';

                return (
                  <div key={msg._id} className="p-6 space-y-3 hover:bg-dark-hover/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-white text-sm">
                          {msg.senderId?.name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-dark-card text-accent">
                          {projectTitle}
                        </span>
                        <span className="text-xs text-content-muted font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <button
                        onClick={() => openReplyModal(msg)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-accent-hover transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>

                    <p className="text-sm text-content-secondary leading-relaxed pl-2 border-l-2 border-accent/40">
                      {msg.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
            <h3 className="text-lg font-bold text-white">Reply to {replyClientName}</h3>
            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-content-muted mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write message to client..."
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 text-sm text-content-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
