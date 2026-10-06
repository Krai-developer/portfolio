import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Briefcase, Phone, MapPin, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export const ClientProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    company: profile?.company || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    website: profile?.website || ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          CLIENT CREDENTIALS
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account &amp; Profile</h1>
        <p className="text-content-secondary text-sm">
          Manage your contact information, company name, and client organization details.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-accent-muted border border-accent/40 text-accent text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-dark-border space-y-6">
        {/* Read-Only Account Security Banner */}
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-content-secondary">
            <Shield className="w-4 h-4 text-accent" />
            <span>Role: <strong className="text-white uppercase">{user?.role}</strong></span>
          </div>
          <span className="text-content-muted">Client Permissions Enforced &bull; ID: {user?._id.slice(-6)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Email Address (Login Identity)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface/50 border border-dark-border text-content-muted text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Company / Venture
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Acme Ventures"
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Location / Timezone
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="San Francisco, CA (PST)"
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-content-muted mb-2">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-content-muted mb-2">
            Bio / Organization Focus
          </label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Managing partner overseeing digital products..."
            className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
