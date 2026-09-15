"use client";

import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUserStore, Role } from '@/store/userStore';

export default function UserManager() {
  const { authorizedUsers, addUser, updateUserRole, removeUser } = useUserStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('Manager');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role>('Manager');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    
    addUser(newEmail.trim(), newRole);
    setNewEmail('');
    setNewRole('Manager');
    setIsAdding(false);
  };

  const handleUpdateRole = (id: string) => {
    updateUserRole(id, editingRole);
    setEditingId(null);
  };

  const roles: Role[] = ['Super Admin', 'Manager', 'Editor', 'Accountant'];

  return (
    <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-primary-500" />
            Users & Roles
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage admin access and permissions for your team.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} /> Add User
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-8 p-6 bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Grant Access</h3>
          <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Grant
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-white dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-700 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
            <AlertCircle size={16} className="mt-0.5 text-amber-500 flex-shrink-0" />
            <p>The user must sign in using this exact Email address to gain access.</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto text-left">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <th className="pb-4 font-medium">Email Address</th>
              <th className="pb-4 font-medium">Role</th>
              <th className="pb-4 font-medium">Added On</th>
              <th className="pb-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {authorizedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                <td className="py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-slate-500">
                    {user.id === 'master-admin' ? <Shield size={14} className="text-primary-500" /> : <Mail size={14} />}
                  </div>
                  {user.email}
                  {user.id === 'master-admin' && (
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs px-2 py-0.5 rounded-full font-semibold">Master</span>
                  )}
                </td>
                
                <td className="py-4">
                  {editingId === user.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value as Role)}
                        className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleUpdateRole(user.id)}
                        className="text-green-500 p-1.5 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-700 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {user.role}
                    </span>
                  )}
                </td>
                
                <td className="py-4 text-sm text-slate-500">
                  {new Date(user.addedAt).toLocaleDateString()}
                </td>
                
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user.id !== 'master-admin' && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(user.id);
                            setEditingRole(user.role);
                          }}
                          className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if(window.confirm('Are you sure you want to revoke access for this user?')) {
                              removeUser(user.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Revoke Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
