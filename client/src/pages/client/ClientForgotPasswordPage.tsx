import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ClientForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.auth.requestPasswordReset(email);
      setSubmitted(true);
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-dark-border shadow-card-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
        {submitted ? (
          <div className="relative text-center space-y-5" role="status" aria-live="polite">
            <CheckCircle className="w-12 h-12 text-accent mx-auto" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold text-white">Forget password? follow the steps: </h1>
            <h2 className="text-2xl font-extrabold text-white">1.Open to your email acc</h2>
            <h2 className="text-2xl font-extrabold text-white">2.Go to spam</h2>
            <h2 className="text-2xl font-extrabold text-white">3.Click the link to reset password</h2>
            <p className="text-sm text-content-secondary">
              If an active account uses that email, a password reset link will be sent. The link expires in 60 minutes.
            </p>
            <Link to="/client/login" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to client login
            </Link>
          </div>
        ) : (
          <>
            <div className="relative text-center mb-8 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-accent-muted border border-accent/30 text-accent mx-auto flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Forgot your password?</h1>
              <p className="text-content-secondary text-sm">Enter the email address for your account and we’ll send a reset link.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6 flex items-center gap-3" role="alert">
                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-mono uppercase tracking-wider text-content-muted mb-2">Email address</label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border focus:border-accent focus:outline-none text-white text-sm placeholder:text-content-muted"
                  />
                  <Mail className="w-4 h-4 text-content-muted absolute left-4 top-3.5" aria-hidden="true" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" aria-label="Sending request" /> : <><span>Send reset link</span><ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
              </button>
            </form>
            <div className="relative mt-6 text-center">
              <Link to="/client/login" className="inline-flex items-center gap-2 text-xs text-content-secondary hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Back to client login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
