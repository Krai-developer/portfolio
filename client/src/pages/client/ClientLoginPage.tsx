import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const ClientLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password }, 'client');
      const from = (location.state as any)?.from?.pathname || '/client/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-dark-border shadow-card-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-muted border border-accent/30 text-accent mx-auto flex items-center justify-center font-mono font-bold text-lg mb-3">
            AR
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Client Portal Login
          </h2>
          <p className="text-content-secondary text-sm">
            Access your private project progress, milestone timelines, and files.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@acme.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
              />
              <Mail className="w-4 h-4 text-content-muted absolute left-4 top-3.5" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="client-password" className="block text-xs font-mono uppercase tracking-wider text-content-muted">
                Password
              </label>
              <Link to="/client/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="client-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
              />
              <Lock className="w-4 h-4 text-content-muted absolute left-4 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-content-secondary">
            Don't have a client account yet?{' '}
            <Link to="/client/register" className="text-accent hover:underline font-medium">
              Register here
            </Link>
          </p>
          <p className="text-xs text-content-muted">
            Are you the administrator?{' '}
            <Link to="/admin/login" className="text-content-secondary hover:text-white">
              Admin Login &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
