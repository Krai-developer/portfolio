import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User, ClientProfile } from '../../types';
import {
  Users2,
  Plus,
  Edit2,
  FolderKanban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  MapPin,
  X
} from 'lucide-react';

export const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    location: '',
    bio: '',
    isActive: true
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getClients();
      if (res.success && res.data) {
        setClients(res.data);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      company: '',
      phone: '',
      location: '',
      bio: '',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      password: '',
      company: client.profile?.company || '',
      phone: client.profile?.phone || '',
      location: client.profile?.location || '',
      bio: client.profile?.bio || '',
      isActive: client.isActive
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.admin.updateClient(editingClient._id, formData);
      } else {
        await api.admin.createClient(formData);
      }
      setModalOpen(false);
      fetchClients();
    } catch (err: any) {
      alert(err.message || 'Failed to save client.');
    }
  };

  const handleToggleActive = async (client: any) => {
    try {
      await api.admin.updateClient(client._id, { isActive: !client.isActive });
      fetchClients();
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            CLIENT DIRECTORY
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Client Accounts</h1>
          <p className="text-content-secondary text-sm">
            Manage client profiles, company associations, and platform access authorizations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Account</span>
        </button>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-dark-card/50 animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center text-content-muted">
          No clients registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map((c) => (
            <div
              key={c._id}
              className="glass-panel p-6 rounded-2xl border border-dark-border hover:border-accent/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-dark-card border border-accent/40 flex items-center justify-center font-bold text-accent font-mono text-base">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{c.name}</h3>
                    <p className="text-xs font-mono text-accent">{c.profile?.company || 'No Company'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase ${
                      c.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg bg-dark-card border border-dark-border text-content-secondary hover:text-white"
                    title="Edit Client"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-content-secondary">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-content-muted" />
                  <span>{c.email}</span>
                </div>
                {c.profile?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-content-muted" />
                    <span>{c.profile.phone}</span>
                  </div>
                )}
                {c.profile?.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-content-muted" />
                    <span>{c.profile.location}</span>
                  </div>
                )}
              </div>

              {c.profile?.bio && (
                <p className="text-xs text-content-muted line-clamp-2 pt-2 border-t border-dark-border/40">
                  {c.profile.bio}
                </p>
              )}

              {/* Status toggling */}
              <div className="pt-3 border-t border-dark-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-content-secondary">
                  Active Projects: <strong className="text-white">{c.activeProjects || 0}</strong>
                </span>

                <button
                  onClick={() => handleToggleActive(c)}
                  className={`text-xs hover:underline ${c.isActive ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  {c.isActive ? 'Disable Account' : 'Reactivate Account'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border space-y-6">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingClient ? 'Edit Client' : 'Create Client Account'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-content-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                  {editingClient ? 'Reset Password (Leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingClient}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingClient ? '••••••••' : 'Password for client'}
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="New York, NY"
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                  Bio / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                />
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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
