import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { Shield, Users, CheckCircle, XCircle, Key, RefreshCw } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.admin.updateUserRole(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user.');
    }
  };

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      await api.admin.updateUserRole(user._id, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to change role.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
          PLATFORM GOVERNANCE
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">Users &amp; Role Access</h1>
        <p className="text-content-secondary text-sm">
          Audit platform users, manage RBAC permissions, and toggle access states.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/60 text-[11px] font-mono uppercase tracking-wider text-content-muted">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered Date</th>
              <th className="p-4 text-right">Access Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-content-muted animate-pulse">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-content-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-dark-hover/40 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-xs text-content-muted font-mono">{u.email}</div>
                  </td>

                  <td className="p-4 font-mono text-xs">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg border bg-dark-card font-mono text-xs uppercase cursor-pointer focus:outline-none ${
                        u.role === 'admin'
                          ? 'border-accent text-accent'
                          : 'border-dark-border text-content-secondary'
                      }`}
                    >
                      <option value="client">CLIENT</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${
                        u.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="p-4 text-xs font-mono text-content-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                        u.isActive
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
