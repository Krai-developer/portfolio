import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Settings } from '../../types';
import {
  FileText,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react';

const getEmbeddableResumeUrl = (url: string): string | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:application/pdf;base64,')) {
    return trimmed;
  }
  // Convert Google Drive sharing link to embeddable /preview link
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  if (/\.pdf(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
};

export const ClientResumePage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.public.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load resume details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-dark-card/50 border border-dark-border" />
        <div className="h-[600px] rounded-2xl bg-dark-card/50 border border-dark-border" />
      </div>
    );
  }

  const resumeUrl = settings?.resumeUrl?.trim() || '';
  const resumeFileName = settings?.resumeFileName?.trim() || 'Maron_Jake_Dinopol_CV.pdf';
  const isDataPdf = resumeUrl.startsWith('data:application/pdf;base64,');
  const embedUrl = resumeUrl ? getEmbeddableResumeUrl(resumeUrl) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            DEVELOPER CREDENTIALS
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {settings?.name || 'Maron Jake Dinopol'} &mdash; Resume / CV
          </h1>
          <p className="text-content-secondary text-sm mt-1">
            {settings?.title || 'Software Engineer & AI Engineer'}
          </p>
        </div>

        {resumeUrl && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={resumeUrl}
              download={isDataPdf ? resumeFileName : undefined}
              target={isDataPdf ? undefined : '_blank'}
              rel={isDataPdf ? undefined : 'noreferrer'}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download CV</span>
            </a>

            {!isDataPdf && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-accent/50 text-white font-medium text-sm transition-all"
              >
                <ExternalLink className="w-4 h-4 text-accent" />
                <span>Open Original</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Quick Admin Info Strip */}
      <div className="glass-panel p-5 rounded-2xl border border-dark-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-content-secondary">
        <div className="flex flex-wrap items-center gap-6">
          {settings?.email && (
            <span className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-accent" />
              <span>{settings.email}</span>
            </span>
          )}
          {settings?.location && (
            <span className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{settings.location}</span>
            </span>
          )}
          {settings?.resumeUpdatedAt && (
            <span className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>
                Updated {new Date(settings.resumeUpdatedAt).toLocaleDateString()}
              </span>
            </span>
          )}
        </div>
        <Link
          to="/client/messages"
          className="inline-flex items-center space-x-1.5 text-accent hover:underline"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Message Developer</span>
        </Link>
      </div>

      {/* Resume Viewer or Empty State */}
      {!resumeUrl ? (
        <div className="glass-panel p-14 rounded-2xl border border-dark-border text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-content-muted mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Resume / CV Not Uploaded Yet</h2>
          <p className="text-content-secondary text-sm max-w-md mx-auto">
            {settings?.name || 'The administrator'} hasn&apos;t published a Resume/CV file yet.
            Please check back shortly or reach out directly via Messages.
          </p>
          <Link
            to="/client/messages"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-all mt-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Request CV via Messages</span>
          </Link>
        </div>
      ) : embedUrl ? (
        <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden">
          <div className="px-5 py-3 border-b border-dark-border/70 flex items-center justify-between bg-dark-surface/60">
            <div className="flex items-center space-x-2 text-xs font-mono text-white">
              <FileText className="w-4 h-4 text-accent" />
              <span>{resumeFileName}</span>
            </div>
            <span className="text-[11px] font-mono text-content-muted">PDF PREVIEW</span>
          </div>
          <iframe
            src={embedUrl}
            title="Admin Resume / CV"
            className="w-full h-[760px] bg-white"
          />
        </div>
      ) : (
        <div className="glass-panel p-10 rounded-2xl border border-dark-border text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">External Resume / CV Link</h2>
          <p className="text-content-secondary text-sm max-w-md mx-auto">
            Click below to view {settings?.name || 'the developer'}&apos;s latest Resume / CV in a new tab.
          </p>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all"
          >
            <span>View Resume / CV</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
