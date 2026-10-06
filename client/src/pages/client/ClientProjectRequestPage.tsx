import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const ClientProjectRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.client.submitProjectRequest({ projectName, projectBrief });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Could not send your project request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        to="/client/dashboard"
        className="inline-flex items-center gap-2 text-sm text-content-secondary transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to your dashboard
      </Link>

      <div>
        <span className="mb-1 block text-xs font-mono uppercase tracking-wider text-accent">
          NEW PROJECT
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white">Request a project</h1>
        <p className="mt-2 text-sm leading-relaxed text-content-secondary">
          Tell Maron what you have in mind. Your request will go to his admin inbox. Once you agree on
          the details, he’ll create a project here so you can follow its progress.
        </p>
      </div>

      {submitted ? (
        <div className="glass-panel space-y-5 rounded-2xl border border-accent/30 p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Request sent</h2>
            <p className="mt-2 text-sm text-content-secondary">
              Maron has your project request and will follow up with you. The project will appear in
              your workspace after you’ve agreed on the details.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/client/dashboard"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              Back to dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setProjectName('');
                setProjectBrief('');
              }}
              className="rounded-xl border border-dark-border bg-dark-card px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/50"
            >
              Request another project
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel space-y-6 rounded-2xl border border-dark-border p-6 sm:p-8">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-dark-border bg-dark-surface/70 px-4 py-3 text-sm">
            <p className="font-medium text-white">Sending as {user?.name}</p>
            <p className="mt-0.5 text-content-muted">{user?.email}</p>
          </div>

          <div>
            <label htmlFor="project-name" className="mb-2 block text-xs font-mono uppercase tracking-wider text-content-muted">
              Project name
            </label>
            <input
              id="project-name"
              required
              maxLength={120}
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="e.g. Company website redesign"
              className="w-full rounded-xl border border-dark-border bg-dark-surface px-4 py-3 text-sm text-white placeholder:text-content-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="project-brief" className="mb-2 block text-xs font-mono uppercase tracking-wider text-content-muted">
              What do you need?
            </label>
            <textarea
              id="project-brief"
              required
              maxLength={5000}
              rows={6}
              value={projectBrief}
              onChange={(event) => setProjectBrief(event.target.value)}
              placeholder="Share what you’re hoping to build, who it’s for, and any timeline or features you already have in mind."
              className="w-full resize-y rounded-xl border border-dark-border bg-dark-surface px-4 py-3 text-sm leading-relaxed text-white placeholder:text-content-muted focus:border-accent focus:outline-none"
            />
            <p className="mt-2 text-right text-xs text-content-muted">{projectBrief.length}/5000</p>
          </div>

          <button
            type="submit"
            disabled={loading || !projectName.trim() || !projectBrief.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-black shadow-emerald-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending request…' : 'Send project request'}
            {!loading && <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  );
};
