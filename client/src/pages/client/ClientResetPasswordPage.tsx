import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ClientResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loginPath, setLoginPath] = useState('/client/login');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.querySelector('meta[name="referrer"]');
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
      if (previous) document.head.appendChild(previous);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.resetPassword({ token, password, confirmPassword });
      if (result.data?.role === 'admin') setLoginPath('/admin/login');
      setCompleted(true);
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to reset your password. Request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-dark-border shadow-card-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
        {completed ? (
          <div className="relative text-center space-y-5" role="status" aria-live="polite">
            <CheckCircle className="w-12 h-12 text-accent mx-auto" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold text-white">Password updated</h1>
            <p className="text-sm text-content-secondary">Your new password is ready. Sign in to continue to your account.</p>
            <Link to={loginPath} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover">
              Go to sign in <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        ) : !token ? (
          <div className="relative text-center space-y-5">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold text-white">Reset link is missing</h1>
            <p className="text-sm text-content-secondary">Request a new password reset link to continue.</p>
            <Link to="/client/forgot-password" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">Request another link <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
          </div>
        ) : (
          <>
            <div className="relative text-center mb-8 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-accent-muted border border-accent/30 text-accent mx-auto flex items-center justify-center mb-3"><Lock className="w-5 h-5" aria-hidden="true" /></div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Set a new password</h1>
              <p className="text-content-secondary text-sm">Choose a password with at least 6 characters.</p>
            </div>
            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6 flex items-center gap-3" role="alert"><AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm" />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">Confirm new password</label>
                <input id="confirm-new-password" type="password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" aria-label="Updating password" /> : <><span>Update password</span><ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
              </button>
            </form>
            <div className="relative mt-6 text-center"><Link to="/client/login" className="inline-flex items-center gap-2 text-xs text-content-secondary hover:text-white"><ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Back to client login</Link></div>
          </>
        )}
      </div>
    </div>
  );
};
