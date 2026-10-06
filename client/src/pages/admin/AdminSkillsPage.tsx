import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Skill } from '../../types';
import { Sparkles, Plus, Edit2, Trash2, Star, X } from 'lucide-react';

export const AdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    icon: 'Code',
    proficiency: 90,
    featured: true,
    order: 0
  });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getAllSkills();
      if (res.success && res.data) {
        setSkills(res.data);
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'Frontend',
      icon: 'Code',
      proficiency: 90,
      featured: true,
      order: skills.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (s: Skill) => {
    setEditingSkill(s);
    setFormData({
      name: s.name,
      category: s.category,
      icon: s.icon,
      proficiency: s.proficiency,
      featured: s.featured,
      order: s.order
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await api.admin.updateSkill(editingSkill._id, formData);
      } else {
        await api.admin.createSkill(formData);
      }
      setModalOpen(false);
      fetchSkills();
    } catch (err: any) {
      alert(err.message || 'Failed to save skill.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.admin.deleteSkill(id);
      fetchSkills();
    } catch (err) {
      alert('Failed to delete skill.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
            STACK DIRECTORY
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Skills &amp; Capabilities</h1>
          <p className="text-content-secondary text-sm">
            Manage proficiency levels and categories displayed on your public technical stack.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover shadow-emerald-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-dark-card/50 animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center text-content-muted">
          No skills registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <div
              key={skill._id}
              className="glass-panel p-5 rounded-xl border border-dark-border hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-white">{skill.name}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-1 rounded bg-dark-card text-content-secondary hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="p-1 rounded bg-dark-card text-content-muted hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <div className="w-full bg-dark-surface h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-content-muted">
                  <span>{skill.category}</span>
                  <span className="text-accent">{skill.proficiency}%</span>
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
                {editingSkill ? 'Edit Skill' : 'Add Skill'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-content-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Next.js"
                  className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Tools">Tools</option>
                    <option value="Design">Design</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-content-muted uppercase mb-1">
                    Proficiency ({formData.proficiency}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.proficiency}
                    onChange={(e) => setFormData({ ...formData, proficiency: Number(e.target.value) })}
                    className="w-full mt-2 accent-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featSkill"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="accent-emerald-500"
                />
                <label htmlFor="featSkill" className="text-xs font-mono text-content-secondary cursor-pointer">
                  Featured Core Skill
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
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
