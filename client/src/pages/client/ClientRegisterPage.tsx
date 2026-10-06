import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Briefcase, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const ClientRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/client/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-dark-border shadow-card-dark relative overflow-hidden">
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-muted border border-accent/30 text-accent mx-auto flex items-center justify-center font-mono font-bold text-lg mb-3">
            AR
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Client Account
          </h2>
          <p className="text-content-secondary text-sm">
            Sign up to collaborate, submit specs, and track real-time project milestones.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sarah Jenkins"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
              />
              <User className="w-4 h-4 text-content-muted absolute left-4 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
              />
              <Mail className="w-4 h-4 text-content-muted absolute left-4 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-1.5">
              Company / Organization
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Ventures (Optional)"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
              />
              <Briefcase className="w-4 h-4 text-content-muted absolute left-4 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
                />
                <Lock className="w-4 h-4 text-content-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-1.5">
                Confirm
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
                />
                <CheckCircle className="w-4 h-4 text-content-muted absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Client Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-content-secondary">
            Already have an account?{' '}
            <Link to="/client/login" className="text-accent hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
