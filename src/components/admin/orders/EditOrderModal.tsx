import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, Search, PlusCircle } from 'lucide-react';
import { Order } from './types';
import { useProductStore } from '@/store/productStore';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Order>) => void;
}

export default function EditOrderModal({ order, isOpen, onClose, onSave }: EditOrderModalProps) {
  const { products } = useProductStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<Order['items']>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (order && isOpen) {
      setCustomerName(order.customerName);
      setCustomerPhone(order.customerPhone);
      setAddress(order.address);
      setItems([...order.items]); // Copy items
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddNewItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Default to a generic variant since Product model doesn't have colors
    const variant = 'Standard';

    // Check if item already exists with this variant
    const existingItemIndex = items.findIndex(item => item.id === product.id && item.variant === variant);
    
    if (existingItemIndex >= 0) {
      handleUpdateQuantity(items[existingItemIndex].id, 1);
    } else {
      setItems([...items, {
        id: `${product.id}-${Date.now()}`,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: variant
      }]);
    }
    
    setIsAddingItem(false);
    setSelectedProductId('');
  };

  const handleSave = () => {
    onSave(order.id, {
      customerName,
      customerPhone,
      address,
      items
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Order: {order.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Shipping Address</label>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Order Items</h3>
              {!isAddingItem && (
                <button 
                  onClick={() => setIsAddingItem(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <PlusCircle size={16} /> Add Item
                </button>
              )}
            </div>

            {isAddingItem && (
              <div className="mb-4 p-4 border border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white appearance-none"
                  >
                    <option value="" disabled>Select a product to add...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ৳{p.price.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsAddingItem(false)}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddNewItem}
                    disabled={!selectedProductId}
                    className="px-3 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex-shrink-0"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            )}

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-0 bg-slate-50 dark:bg-dark-800/50">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.variant} • ৳{item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="p-1.5 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-1.5 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <p className="font-semibold text-slate-900 dark:text-white text-sm w-16 text-right">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>

                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-500 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No items left in the order.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-dark-800/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={items.length === 0}
            className="px-4 py-2 font-medium text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
