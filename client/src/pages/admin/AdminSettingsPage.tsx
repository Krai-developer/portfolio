import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Settings } from '../../types';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  FileText,
  Upload,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    name: 'Maron Jake Dinopol',
    title: 'Software Engineer & AI Engineer',
    bio: '',
    heroHeadline: "Hi, I'm Maron Jake Dinopol.",
    heroDescription:
      'I build intelligent software that turns complex business problems into simple, scalable products.',
    availabilityStatus: 'Available for Projects',
    availabilityPeriod: 'Q4 2026',
    typicalResponseTime: 'Within 24 hours',
    email: 'cloudyuu124@gmail.com',
    phone: '',
    location: 'Remote',
    socialLinks: {
      github: 'https://github.com/ForFunn-gg',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      dribbble: 'https://dribbble.com'
    },
    learningStartDate: '',
    dedicationPercentage: 100,
    statsPublic: true,
    statsOverrides: {}
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.public.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF (.pdf) file for your Resume / CV.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume PDF must be 5 MB or smaller.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettings((prev) => ({
          ...prev,
          resumeUrl: reader.result as string,
          resumeFileName: file.name
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.admin.updateSettings(settings);
      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          CONFIGURATION
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Website &amp; Availability</h1>
        <p className="text-content-secondary text-sm">
          Update the hero copy, availability period, and contact details shown across the public
          portfolio.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-accent-muted border border-accent/40 text-accent text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Website settings updated successfully! Public pages reflect changes immediately.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-dark-border space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-dark-border pb-3">
          Hero &amp; Identity Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Studio Owner Name
            </label>
            <input
              type="text"
              required
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Professional Title
            </label>
            <input
              type="text"
              required
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-content-muted mb-2">
            Hero Headline
          </label>
          <input
            type="text"
            required
            value={settings.heroHeadline}
            onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-content-muted mb-2">
            Hero Description
          </label>
          <textarea
            required
            rows={2}
            value={settings.heroDescription}
            onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm resize-none"
          />
        </div>

        <section className="space-y-5 rounded-2xl border border-accent/20 bg-accent/[0.03] p-5">
          <div>
            <h3 className="text-lg font-bold text-white">Statistics &amp; Visibility</h3>
            <p className="mt-1 text-xs text-content-muted">Statistics are calculated from completed projects and settings in MongoDB.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-mono uppercase text-content-muted">Learning Start Date</label>
              <input
                type="date"
                value={settings.learningStartDate ? settings.learningStartDate.slice(0, 10) : ''}
                onChange={(e) => setSettings({ ...settings, learningStartDate: e.target.value || undefined })}
                className="w-full rounded-xl border border-dark-border bg-dark-surface px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-mono uppercase text-content-muted">Dedication Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.dedicationPercentage ?? 100}
                onChange={(e) => setSettings({ ...settings, dedicationPercentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-dark-border bg-dark-surface px-4 py-2.5 text-sm text-white"
              />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-content-secondary">
            <input
              type="checkbox"
              checked={settings.statsPublic ?? true}
              onChange={(e) => setSettings({ ...settings, statsPublic: e.target.checked })}
              className="accent-emerald-500"
            />
            Display statistics on the public portfolio
          </label>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-white">Optional Manual Overrides</h4>
            <p className="mb-3 text-xs text-content-muted">Leave a field blank to use its calculated value.</p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {([
                ['projectsCompleted', 'Projects built'],
                ['happyClients', 'Technologies used'],
                ['yearsLearning', 'Years learning'],
                ['dedication', 'Dedication %']
              ] as const).map(([key, label]) => (
                <label key={key} className="text-xs text-content-muted">
                  {label}
                  <input
                    type="number"
                    min="0"
                    max={key === 'dedication' ? 100 : undefined}
                    value={settings.statsOverrides?.[key] ?? ''}
                    onChange={(e) => {
                      const statsOverrides = { ...settings.statsOverrides };
                      if (e.target.value === '') delete statsOverrides[key];
                      else statsOverrides[key] = Number(e.target.value);
                      setSettings({ ...settings, statsOverrides });
                    }}
                    className="mt-1 w-full rounded-xl border border-dark-border bg-dark-surface px-3 py-2 text-sm text-white"
                  />
                </label>
              ))}
            </div>
          </div>
        </section>

        <h3 className="text-lg font-bold text-white border-b border-dark-border pb-3 pt-4">
          Availability Status &amp; Turnaround
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Availability Status
            </label>
            <input
              type="text"
              required
              value={settings.availabilityStatus}
              onChange={(e) => setSettings({ ...settings, availabilityStatus: e.target.value })}
              placeholder="e.g. Available for Projects"
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Availability Period
            </label>
            <input
              type="text"
              required
              value={settings.availabilityPeriod}
              onChange={(e) => setSettings({ ...settings, availabilityPeriod: e.target.value })}
              placeholder="e.g. Q4 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Typical Response Time
            </label>
            <input
              type="text"
              required
              value={settings.typicalResponseTime}
              onChange={(e) => setSettings({ ...settings, typicalResponseTime: e.target.value })}
              placeholder="e.g. Within 24 hours"
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white border-b border-dark-border pb-3 pt-4">
          Direct Contact &amp; Social Links
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.github || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, github: e.target.value }
                })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.linkedin || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Twitter / X URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.twitter || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
            />
          </div>
        </div>

        {/* Resume / CV Management (Visible to Clients in Client Portal) */}
        <h3 className="text-lg font-bold text-white border-b border-dark-border pb-3 pt-4 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-accent" />
          <span>Resume / CV (Visible to Clients)</span>
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-content-secondary">
            Upload your PDF Resume/CV (max 5 MB) or paste an external link (Google Drive / PDF URL).
            Logged-in clients can view and download it from their Client Portal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-xs font-mono uppercase text-content-muted mb-2">
                Upload PDF File
              </label>
              <label className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl bg-dark-surface border border-dashed border-dark-border hover:border-accent/60 text-sm text-content-secondary hover:text-white cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-accent" />
                <span>Choose PDF Resume (Max 5 MB)</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-content-muted mb-2">
                Or External Resume / CV URL
              </label>
              <input
                type="url"
                value={
                  settings.resumeUrl?.startsWith('data:application/pdf;base64,')
                    ? ''
                    : settings.resumeUrl || ''
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    resumeUrl: e.target.value,
                    resumeFileName: e.target.value ? 'Resume / CV Link' : ''
                  })
                }
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
              />
            </div>
          </div>

          {settings.resumeUrl && (
            <div className="p-4 rounded-xl bg-dark-surface/80 border border-accent/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {settings.resumeFileName || 'Resume / CV Configured'}
                  </p>
                  <p className="text-[11px] font-mono text-content-muted">
                    {settings.resumeUrl.startsWith('data:application/pdf;base64,')
                      ? 'Uploaded PDF ready (click Save Settings to publish)'
                      : 'External URL ready (click Save Settings to publish)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={settings.resumeUrl}
                  download={
                    settings.resumeUrl.startsWith('data:application/pdf;base64,')
                      ? settings.resumeFileName || 'Resume.pdf'
                      : undefined
                  }
                  target={
                    settings.resumeUrl.startsWith('data:application/pdf;base64,')
                      ? undefined
                      : '_blank'
                  }
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border hover:border-accent text-xs text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-accent" />
                  <span>Preview</span>
                </a>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, resumeUrl: '', resumeFileName: '' })
                  }
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-xs text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-dark-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
