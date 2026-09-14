import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, PlusCircle } from 'lucide-react';
import { Order, OrderItem } from './types';
import { useProductStore } from '@/store/productStore';
import { districts, upazilas, getUpazilasByDistrict, District, Upazila } from '@/lib/bd-districts';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
}

export default function NewOrderModal({ isOpen, onClose, onSave }: NewOrderModalProps) {
  const { products } = useProductStore();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [thanaId, setThanaId] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  
  const [deliveryCharge, setDeliveryCharge] = useState<number>(60);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  const availableThanas = districtId ? getUpazilasByDistrict(districtId) : [];

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCustomerName('');
      setCustomerPhone('');
      setDistrictId('');
      setThanaId('');
      setAddress('');
      setItems([]);
      setDeliveryCharge(60);
      setAdvancePayment(0);
      setIsAddingItem(false);
      setSelectedProductId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

    const variant = 'Standard';

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

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (deliveryCharge || 0) - (advancePayment || 0);

  const handleSave = () => {
    const selectedDistrict = districts.find(d => d.id === districtId)?.name;
    const selectedThana = upazilas.find(u => u.id === thanaId)?.name;
    
    // Construct full address string for backward compatibility
    let fullAddress = address;
    if (selectedThana && selectedDistrict) {
      fullAddress = `${address ? address + ', ' : ''}${selectedThana}, ${selectedDistrict}`;
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 100000000)}-${Math.floor(Math.random() * 1000)}`,
      customerName: customerName || 'Guest User',
      customerEmail: '',
      customerPhone: customerPhone || 'N/A',
      customerAvatar: (customerName || 'G').charAt(0).toUpperCase(),
      address: fullAddress,
      district: selectedDistrict,
      thana: selectedThana,
      status: 'New',
      items,
      total,
      deliveryCharge: deliveryCharge || 0,
      advancePayment: advancePayment || 0,
      paymentMethod: advancePayment >= (subtotal + deliveryCharge) ? 'Paid' : 'COD',
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
      timeline: [
        { id: `t-${Date.now()}`, status: 'New', timestamp: new Date().toISOString(), note: 'Order manually created by admin' }
      ]
    };
    
    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Order</h2>
            <p className="text-sm text-slate-500">Manually add a custom order into the system.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2 bg-white dark:bg-dark-700 rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Form Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">1</span>
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 01700000000"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">2</span>
                  Shipping Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">District</label>
                    <select 
                      value={districtId}
                      onChange={e => {
                        setDistrictId(e.target.value);
                        setThanaId(''); // Reset thana when district changes
                      }}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="">Select District...</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.bn_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Thana / Upazila</label>
                    <select 
                      value={thanaId}
                      onChange={e => setThanaId(e.target.value)}
                      disabled={!districtId}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white appearance-none disabled:opacity-50 disabled:bg-slate-50"
                    >
                      <option value="">Select Thana...</option>
                      {availableThanas.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.bn_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">House, Road, Block</label>
                    <textarea 
                      placeholder="e.g. House 12, Road 4, Block C"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">3</span>
                    Order Items
                  </h3>
                  {!isAddingItem && (
                    <button 
                      onClick={() => setIsAddingItem(true)}
                      className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-3 py-1.5 rounded-lg"
                    >
                      <PlusCircle size={16} /> Add Product
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
                        <option value="" disabled>Select a product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - ৳{p.price.toFixed(2)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => setIsAddingItem(false)}
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors w-full sm:w-auto bg-white border border-slate-200"
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

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-800">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-0 bg-white dark:bg-dark-900">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.variant} • ৳{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1.5 text-slate-500 hover:text-primary-500 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1.5 text-slate-500 hover:text-primary-500 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <p className="font-semibold text-slate-900 dark:text-white text-sm w-20 text-right">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>

                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                        <Plus size={24} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No items added yet</p>
                      <p className="text-slate-400 text-xs mt-1">Click the 'Add Product' button above to start.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Financials & Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">4</span>
                  Order Summary
                </h3>

                <div className="space-y-6">
                  
                  {/* Item Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Subtotal ({items.length} items)</span>
                    <span className="font-medium text-slate-900 dark:text-white">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {/* Delivery Charge Input */}
                  <div>
                    <label className="flex justify-between items-center text-sm mb-2 text-slate-700 dark:text-slate-300 font-medium">
                      Delivery Charge
                      <span className="text-xs font-normal text-slate-400">(Override if needed)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">৳</span>
                      <input 
                        type="number" 
                        value={deliveryCharge === 0 ? '' : deliveryCharge}
                        onChange={e => setDeliveryCharge(Number(e.target.value))}
                        className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Advance Payment Input */}
                  <div>
                    <label className="flex justify-between items-center text-sm mb-2 text-slate-700 dark:text-slate-300 font-medium">
                      Advance Payment
                      <span className="text-xs font-normal text-slate-400">(Subtracts from total)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">৳</span>
                      <input 
                        type="number" 
                        value={advancePayment === 0 ? '' : advancePayment}
                        onChange={e => setAdvancePayment(Number(e.target.value))}
                        className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-700" />

                  {/* Final Total */}
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-slate-500 text-sm mb-1">Final Amount Due</span>
                      <span className="block text-xs text-slate-400">(Subtotal + Delivery - Advance)</span>
                    </div>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                      ৳{Math.max(0, total).toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-dark-800">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={items.length === 0 || !customerName || !customerPhone}
            className="px-6 py-2.5 font-medium text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={16} /> Create Order
          </button>
        </div>

      </div>
    </div>
  );
}
