import { useState } from 'react';
import { Truck, Settings2, Check, X, ShieldAlert } from 'lucide-react';
import { useCourierStore, CourierIntegration } from '@/store/courierStore';

export default function CourierManagement() {
  const { couriers, toggleCourierStatus, updateCourierDetails } = useCourierStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Local state for editing to prevent immediate store updates while typing
  const [editForm, setEditForm] = useState<Partial<CourierIntegration>>({});

  const handleEditClick = (courier: CourierIntegration) => {
    if (editingId === courier.id) {
      // Close without saving
      setEditingId(null);
      setEditForm({});
    } else {
      setEditingId(courier.id);
      setEditForm({
        apiKey: courier.apiKey,
        secretKey: courier.secretKey,
        deliveryChargeInsideDhaka: courier.deliveryChargeInsideDhaka,
        deliveryChargeOutsideDhaka: courier.deliveryChargeOutsideDhaka,
      });
    }
  };

  const handleSave = (id: string) => {
    updateCourierDetails(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Truck size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Courier Integrations</h2>
            <p className="text-sm text-slate-500">Configure API credentials and delivery charges for your courier partners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {couriers.map((courier) => (
            <div 
              key={courier.id} 
              className={`border ${courier.isActive ? 'border-primary-500 dark:border-primary-500/50 bg-primary-50/30 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900'} rounded-2xl overflow-hidden transition-all duration-200`}
            >
              
              {/* Courier Card Header */}
              <div className="p-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-dark-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                    {courier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{courier.name}</h3>
                    <p className="text-xs text-slate-500">
                      {courier.isActive ? (
                        <span className="text-green-500 flex items-center gap-1"><Check size={12}/> Active</span>
                      ) : (
                        <span className="flex items-center gap-1"><X size={12}/> Inactive</span>
                      )}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => toggleCourierStatus(courier.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${courier.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${courier.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Delivery Rates Quick View */}
              <div className="px-5 py-3 bg-slate-50/50 dark:bg-dark-800/50 border-b border-slate-200 dark:border-slate-700/50 flex justify-between text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Inside Dhaka</span>
                  <span className="font-medium text-slate-900 dark:text-white">৳{courier.deliveryChargeInsideDhaka}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-xs">Outside Dhaka</span>
                  <span className="font-medium text-slate-900 dark:text-white">৳{courier.deliveryChargeOutsideDhaka}</span>
                </div>
              </div>

              {/* Edit Form Toggle */}
              <div className="p-2">
                <button 
                  onClick={() => handleEditClick(courier)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
                >
                  <Settings2 size={16} /> 
                  {editingId === courier.id ? 'Close Settings' : 'Configure Integration'}
                </button>
              </div>

              {/* Expanded Edit Form */}
              {editingId === courier.id && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-800 animate-in slide-in-from-top-2">
                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">API Key</label>
                      <input 
                        type="text" 
                        value={editForm.apiKey || ''}
                        onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
                        placeholder={`Enter ${courier.name} API Key`}
                        className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Secret Key</label>
                      <input 
                        type="password" 
                        value={editForm.secretKey || ''}
                        onChange={(e) => setEditForm({ ...editForm, secretKey: e.target.value })}
                        placeholder={`Enter ${courier.name} Secret Key`}
                        className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Charge (Inside)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">৳</span>
                          <input 
                            type="number" 
                            value={editForm.deliveryChargeInsideDhaka || 0}
                            onChange={(e) => setEditForm({ ...editForm, deliveryChargeInsideDhaka: Number(e.target.value) })}
                            className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Charge (Outside)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">৳</span>
                          <input 
                            type="number" 
                            value={editForm.deliveryChargeOutsideDhaka || 0}
                            onChange={(e) => setEditForm({ ...editForm, deliveryChargeOutsideDhaka: Number(e.target.value) })}
                            className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {!editForm.apiKey && courier.isActive && (
                      <div className="flex items-start gap-2 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 p-3 rounded-lg text-xs">
                        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                        <p>API credentials are required for this integration to function properly.</p>
                      </div>
                    )}

                    <div className="pt-3">
                      <button 
                        onClick={() => handleSave(courier.id)}
                        className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        Save Configuration
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
