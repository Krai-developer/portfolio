import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Project, User } from '../../types';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
  X,
  Search,
  Filter
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'portfolio' | 'client'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Full-Stack Application',
    description: '',
    image: '',
    technologies: 'React, TypeScript, Node.js, MongoDB',
    liveUrl: '',
    githubUrl: '',
    projectType: 'portfolio',
    clientId: '',
    status: 'development',
    progress: 50,
    featured: false,
    published: true,
    isPrivate: false,
    includeInStats: false,
    problem: '',
    solution: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getProjects();
      if (res.success && res.data) {
        setProjects(res.data);
      }
      const clientRes = await api.admin.getClients();
      if (clientRes.success && clientRes.data) {
        setClients(clientRes.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Full-Stack Application',
      description: '',
      image: '',
      technologies: 'React, TypeScript, Node.js, MongoDB',
      liveUrl: '',
      githubUrl: '',
      projectType: 'portfolio',
      clientId: '',
      status: 'development',
      progress: 50,
      featured: false,
      published: true,
      isPrivate: false,
      includeInStats: false,
      problem: '',
      solution: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.description,
      image: project.image || '',
      technologies: project.technologies?.join(', ') || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      projectType: project.projectType,
      clientId:
        typeof project.clientId === 'object' && project.clientId
          ? (project.clientId as any)._id
          : (project.clientId as string) || '',
      status: project.status,
      progress: project.progress,
      featured: project.featured,
      published: project.published,
      isPrivate: project.isPrivate,
      includeInStats: project.includeInStats || false,
      problem: project.problem || '',
      solution: project.solution || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      technologies: formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      clientId: formData.projectType === 'client' && formData.clientId ? formData.clientId : null
    };

    try {
      if (editingProject) {
        await api.admin.updateProject(editingProject._id, payload);
      } else {
        await api.admin.createProject(payload);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to save project.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await api.admin.deleteProject(id);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    }
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      await api.admin.updateProject(project._id, { published: !project.published });
      fetchProjects();
    } catch (err: any) {
      alert('Failed to update published state');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await api.admin.updateProject(project._id, { featured: !project.featured });
      fetchProjects();
    } catch (err: any) {
      alert('Failed to update featured state');
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filterType !== 'all' && p.projectType !== filterType) return false;
    if (searchTerm) {
      return (
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            PROJECT MANAGEMENT
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects Studio</h1>
          <p className="text-content-secondary text-sm">
            Create, publish, and manage public portfolio showcases &amp; confidential client portals.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              filterType === 'all'
                ? 'bg-accent text-black font-semibold'
                : 'bg-dark-card border border-dark-border text-content-secondary hover:text-white'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilterType('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              filterType === 'portfolio'
                ? 'bg-accent text-black font-semibold'
                : 'bg-dark-card border border-dark-border text-content-secondary hover:text-white'
            }`}
          >
            Portfolio ({projects.filter((p) => p.projectType === 'portfolio').length})
          </button>
          <button
            onClick={() => setFilterType('client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              filterType === 'client'
                ? 'bg-accent text-black font-semibold'
                : 'bg-dark-card border border-dark-border text-content-secondary hover:text-white'
            }`}
          >
            Client Private ({projects.filter((p) => p.projectType === 'client').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-dark-surface border border-dark-border text-white text-xs placeholder:text-content-muted focus:border-accent focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Projects Table */}
      <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-dark-surface/60 text-[11px] font-mono uppercase tracking-wider text-content-muted">
                <th className="p-4">Project Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status &amp; Progress</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-content-muted animate-pulse">
                    Loading projects from MongoDB...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-content-muted">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p._id} className="hover:bg-dark-hover/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{p.title}</div>
                      <div className="text-xs text-content-muted font-mono">{p.category}</div>
                    </td>

                    <td className="p-4 font-mono text-xs">
                      <span
                        className={`px-2 py-0.5 rounded uppercase font-medium ${
                          p.projectType === 'portfolio'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {p.projectType}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-white capitalize">{p.status}</span>
                        <span className="text-xs font-mono text-accent">({p.progress}%)</span>
                      </div>
                      <div className="w-28 bg-dark-surface h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.published
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-dark-card text-content-muted border-dark-border'
                          }`}
                          title={p.published ? 'Published to Public' : 'Unpublished (Hidden)'}
                        >
                          {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.featured
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : 'bg-dark-card text-content-muted border-dark-border'
                          }`}
                          title="Featured Project"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-content-secondary hover:text-white"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg bg-dark-card hover:bg-red-500/10 border border-dark-border text-content-muted hover:text-red-400"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-content-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Project Type
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  >
                    <option value="portfolio">Public Portfolio</option>
                    <option value="client">Client Private Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
              </div>

              {formData.projectType === 'client' && (
                <div>
                  <label className="block text-xs font-mono text-accent uppercase mb-1">
                    Assign To Client Account
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-accent/40 text-white text-sm"
                  >
                    <option value="">Select a registered client...</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Technologies (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="design">Design</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Progress ({formData.progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    className="w-full mt-2 accent-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <label className="flex items-center space-x-2 text-xs font-mono text-content-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Published</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-mono text-content-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-mono text-content-secondary cursor-pointer" title="Private projects are excluded from public statistics unless enabled here.">
                    <input
                      type="checkbox"
                      checked={formData.includeInStats}
                      onChange={(e) => setFormData({ ...formData, includeInStats: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Include in public stats</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-content-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
