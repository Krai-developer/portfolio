import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProjectFile } from '../../types';
import { FileText, Download, Folder, Calendar } from 'lucide-react';

export const ClientFilesPage: React.FC = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.client.getFiles();
        if (res.success && res.data) {
          setFiles(res.data);
        }
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          DELIVERABLES VAULT
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Project Files</h1>
        <p className="text-content-secondary text-sm">
          Secure document repository for architectural specs, design token exports, and client assets.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-dark-card/50 border border-dark-border animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center space-y-3">
          <FileText className="w-10 h-10 text-accent mx-auto" />
          <h3 className="text-lg font-bold text-white">No Files Uploaded</h3>
          <p className="text-content-secondary text-sm">
            Files Maron shares with you will appear here, organized by project.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden">
          <div className="divide-y divide-dark-border/60">
            {files.map((file) => {
              const projectTitle =
                typeof file.projectId === 'object' && file.projectId
                  ? (file.projectId as any).title
                  : 'Project File';

              return (
                <div
                  key={file._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-dark-hover/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-accent flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{file.name}</p>
                      <div className="flex items-center space-x-3 text-xs font-mono text-content-muted mt-0.5">
                        <span className="text-accent">{projectTitle}</span>
                        <span>&bull;</span>
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span>&bull;</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-dark-card hover:bg-accent hover:text-black border border-dark-border text-content-secondary transition-all text-xs font-semibold self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
