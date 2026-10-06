import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Service } from '../../types';
import { Briefcase, Plus, Edit2, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Layout',
    technologies: 'React, Tailwind, Next.js',
    featured: false,
    enabled: true,
    order: 0
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getAllServices();
      if (res.success && res.data) {
        setServices(res.data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: 'Layout',
      technologies: 'React, Tailwind, Next.js',
      featured: false,
      enabled: true,
      order: services.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setFormData({
      title: s.title,
      description: s.description,
      icon: s.icon,
      technologies: s.technologies.join(', '),
      featured: s.featured,
      enabled: s.enabled,
      order: s.order
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
        .filter(Boolean)
    };

    try {
      if (editingService) {
        await api.admin.updateService(editingService._id, payload);
      } else {
        await api.admin.createService(payload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message || 'Failed to save service.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.admin.deleteService(id);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  const handleToggleEnable = async (s: Service) => {
    try {
      await api.admin.updateService(s._id, { enabled: !s.enabled });
      fetchServices();
    } catch (err) {
      alert('Failed to toggle service.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            PORTFOLIO OFFERINGS
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Services Management</h1>
          <p className="text-content-secondary text-sm">
            Control which client services appear dynamically on your public homepage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Service</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-dark-card/50 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center text-content-muted">
          No services configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s._id}
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                s.enabled ? 'border-dark-border' : 'border-dark-border/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-accent">Icon: {s.icon}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleEnable(s)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        s.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-dark-card text-content-muted border-dark-border'
                      }`}
                      title={s.enabled ? 'Enabled on Portfolio' : 'Disabled (Hidden)'}
                    >
                      {s.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-content-secondary hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-1.5 rounded-lg bg-dark-card hover:bg-red-500/10 border border-dark-border text-content-muted hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-content-secondary text-xs leading-relaxed mb-4">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-dark-border/60">
                <div className="flex flex-wrap gap-1">
                  {s.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-dark-card text-[11px] font-mono text-content-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border space-y-6">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingService ? 'Edit Service' : 'Add Service'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-content-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Icon Type
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  >
                    <option value="Layout">Layout</option>
                    <option value="Palette">Palette</option>
                    <option value="Cpu">Cpu</option>
                    <option value="Zap">Zap</option>
                    <option value="Layers">Layers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
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

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-mono text-content-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Enabled (Visible)</span>
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
