"use client";

import { useState } from 'react';
import { usePromoStore, PromoCode } from '@/store/promoStore';
import { Plus, Trash2, Edit2, Ticket, CheckCircle2, XCircle } from 'lucide-react';

export default function PromoManager() {
  const { promos, addPromo, updatePromo, deletePromo } = usePromoStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'fixed' as 'fixed' | 'percentage',
    value: 0,
    minOrderAmount: 0,
    isActive: true
  });

  const handleAddNew = () => {
    setFormData({ code: '', type: 'fixed', value: 0, minOrderAmount: 0, isActive: true });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrderAmount: promo.minOrderAmount,
      isActive: promo.isActive
    });
    setEditingId(promo.id);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.code || formData.value <= 0) return;

    if (editingId) {
      updatePromo(editingId, formData);
    } else {
      addPromo({
        ...formData,
        id: `promo-${Date.now()}`
      });
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const toggleStatus = (id: string, isActive: boolean) => {
    updatePromo(id, { isActive: !isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="text-primary-500" />
            Promo Codes
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage discount coupons and promotions for your store.</p>
        </div>
        {!isAdding && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} /> Add Promo Code
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Promo Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. EID2026"
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'percentage' })}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fixed">Fixed Amount (৳)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Value</label>
              <input
                type="number"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                placeholder={formData.type === 'fixed' ? 'e.g. 500' : 'e.g. 15'}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Minimum Order Amount (৳)</label>
              <input
                type="number"
                value={formData.minOrderAmount || ''}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                placeholder="e.g. 2000"
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-primary-500 text-white font-medium hover:bg-primary-600 rounded-xl transition-colors"
            >
              Save Promo Code
            </button>
          </div>
        </div>
      )}

      {!isAdding && promos.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min. Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">{promo.code}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {promo.type === 'fixed' ? `৳${promo.value}` : `${promo.value}%`}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      ৳{promo.minOrderAmount}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(promo.id, promo.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          promo.isActive
                            ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                            : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {promo.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(promo)}
                          className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePromo(promo.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {!isAdding && promos.length === 0 && (
        <div className="bg-white dark:bg-dark-800 p-12 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Promo Codes Yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create discount codes to attract more customers and boost your sales.</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} /> Create First Promo Code
          </button>
        </div>
      )}
    </div>
  );
}
