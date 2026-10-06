import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Message, Project } from '../../types';
import { MessageSquare, Send, User, CheckCheck, Clock } from 'lucide-react';

export const ClientMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await api.client.getMessages();
      if (res.success) {
        setMessages(res.messages || []);
        setProjects(res.projects || []);
        if (res.projects?.length && !selectedProjectId) {
          setSelectedProjectId(res.projects[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;

    try {
      const res = await api.client.sendMessage({
        projectId: selectedProjectId,
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

  const filteredMessages = selectedProjectId
    ? messages.filter((m) => {
        const pId = typeof m.projectId === 'object' ? (m.projectId as any)._id : m.projectId;
        return pId === selectedProjectId;
      })
    : messages;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          COMMUNICATIONS
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Project Messages</h1>
        <p className="text-content-secondary text-sm">
          Direct communication channel with your developer Maron Jake Dinopol.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Project Selector List */}
        <div className="lg:col-span-1 glass-panel p-4 rounded-2xl border border-dark-border space-y-3">
          <span className="text-xs font-mono uppercase text-content-muted block mb-2">
            Active Projects
          </span>
          {projects.length === 0 ? (
            <p className="text-xs text-content-muted">No projects found.</p>
          ) : (
            projects.map((proj) => (
              <button
                key={proj._id}
                onClick={() => setSelectedProjectId(proj._id)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all ${
                  selectedProjectId === proj._id
                    ? 'bg-accent text-black font-semibold shadow-emerald-sm'
                    : 'bg-dark-card border border-dark-border text-content-secondary hover:text-white'
                }`}
              >
                <p className="truncate">{proj.title}</p>
              </button>
            ))
          )}
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-3 glass-panel rounded-2xl border border-dark-border overflow-hidden flex flex-col h-[580px]">
          <div className="p-4 border-b border-dark-border bg-dark-surface/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Conversation with Maron Jake Dinopol</span>
            <span className="text-xs font-mono text-accent">Private project conversation</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 w-3/4 rounded-xl bg-dark-card/50 animate-pulse" />
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-content-muted space-y-2">
                <MessageSquare className="w-8 h-8 text-accent/40" />
                <p className="text-sm">No messages in this project thread yet.</p>
                <p className="text-xs">Type a message below to start chatting!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
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

          {/* Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-dark-border bg-dark-surface/80 flex items-center space-x-3"
          >
            <input
              type="text"
              required
              disabled={!selectedProjectId}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                selectedProjectId
                  ? 'Write a message to Maron...'
                  : 'Select an active project first'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border focus:border-accent focus:outline-none text-white text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedProjectId || !newMessage.trim()}
              className="p-2.5 rounded-xl bg-accent text-black hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
