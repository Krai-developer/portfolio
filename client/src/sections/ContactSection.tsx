import React, { useState } from 'react';
import { api } from '../services/api';
import { Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectBrief: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name.trim() || !formData.email.trim() || !formData.projectBrief.trim()) {
      setError('Please fill out all fields before submitting.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.public.submitContact(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', projectBrief: '' });
      } else {
        setError(res.message || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="w-full">
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-dark-border relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-xs font-mono text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>START A CONVERSATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tell me about your project.
            </h2>
            <p className="text-content-secondary text-sm">
              Share your timeline, product goals, or design specifications. I review every submission
              and reply within 24 hours.
            </p>
          </div>

          {success ? (
            <div className="p-8 rounded-2xl bg-accent-muted border border-accent/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent text-black mx-auto flex items-center justify-center font-bold">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Project Brief Received!</h3>
              <p className="text-content-secondary text-sm max-w-md mx-auto">
                Thank you for reaching out. Your project inquiry has been logged in the studio database,
                and I'll get back to you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-5 py-2 rounded-xl bg-dark-card border border-dark-border text-sm font-medium text-white hover:border-accent"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@company.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">
                  Project Brief &amp; Scope
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.projectBrief}
                  onChange={(e) => setFormData({ ...formData, projectBrief: e.target.value })}
                  placeholder="Outline your project scope, target timeline, key feature requirements, or link to Figma wireframes..."
                  className="w-full px-4 py-3.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-accent text-black font-semibold text-base hover:bg-accent-hover shadow-emerald-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Project Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
