"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Truck, 
  Search, 
  Filter, 
  Check, 
  X, 
  Save, 
  Sparkles, 
  DollarSign, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  PackageCheck,
  Tag
} from 'lucide-react';
import { useProductStore, Product } from '@/store/productStore';

type DeliveryFilterType = 'all' | 'free' | 'custom' | 'default';

export default function ProductDeliveryManager() {
  const { products, updateProductDeliverySettings } = useProductStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<DeliveryFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<'default' | 'free' | 'custom'>('default');
  const [customChargeInput, setCustomChargeInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<'free' | 'custom' | 'default'>('free');
  const [bulkCustomCharge, setBulkCustomCharge] = useState<string>('50');

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const free = products.filter(p => Boolean(p.isFreeDelivery)).length;
    const custom = products.filter(
      p => !p.isFreeDelivery && p.customDeliveryCharge !== undefined && p.customDeliveryCharge !== null && !isNaN(Number(p.customDeliveryCharge))
    ).length;
    const standard = total - free - custom;

    return { total, free, custom, standard };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      const isFree = Boolean(product.isFreeDelivery);
      const isCustom = !isFree && product.customDeliveryCharge !== undefined && product.customDeliveryCharge !== null && !isNaN(Number(product.customDeliveryCharge));
      const isDefault = !isFree && !isCustom;

      let matchesFilter = true;
      if (selectedFilter === 'free') matchesFilter = isFree;
      else if (selectedFilter === 'custom') matchesFilter = isCustom;
      else if (selectedFilter === 'default') matchesFilter = isDefault;

      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [products, searchQuery, selectedCategory, selectedFilter]);

  // Open Edit Modal for a single product
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    if (product.isFreeDelivery) {
      setDeliveryMode('free');
      setCustomChargeInput('');
    } else if (product.customDeliveryCharge !== undefined && product.customDeliveryCharge !== null) {
      setDeliveryMode('custom');
      setCustomChargeInput(String(product.customDeliveryCharge));
    } else {
      setDeliveryMode('default');
      setCustomChargeInput('');
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save changes for single product
  const handleSaveSettings = async () => {
    if (!editingProduct) return;

    setIsSaving(true);
    const isFree = deliveryMode === 'free';
    const charge = deliveryMode === 'custom' ? (parseFloat(customChargeInput) || 0) : null;

    try {
      const res = await updateProductDeliverySettings(editingProduct.id, {
        isFreeDelivery: isFree,
        customDeliveryCharge: charge,
      });

      if (res.success) {
        showToast(`Delivery settings updated for "${editingProduct.name}"!`);
        setEditingProduct(null);
      } else {
        showToast(res.error || 'Failed to update delivery settings', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving delivery settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Bulk Update
  const handleBulkApply = async () => {
    if (selectedProductIds.length === 0) return;

    setIsSaving(true);
    const isFree = bulkMode === 'free';
    const charge = bulkMode === 'custom' ? (parseFloat(bulkCustomCharge) || 0) : null;

    try {
      let successCount = 0;
      for (const id of selectedProductIds) {
        const res = await updateProductDeliverySettings(id, {
          isFreeDelivery: isFree,
          customDeliveryCharge: charge,
        });
        if (res.success) successCount++;
      }

      showToast(`Successfully updated delivery settings for ${successCount} products!`);
      setSelectedProductIds([]);
      setIsBulkModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Error updating products', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Selection Toggles
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white font-medium transition-all duration-300 animate-slide-up ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold tracking-wide uppercase">
              <Truck size={14} /> Product Delivery Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Delivery Charge Management
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Configure product-level delivery settings. Make delivery completely <strong className="text-emerald-400">Free</strong> or assign a <strong className="text-blue-400">Custom Delivery Charge</strong> to specific items to override global courier rates during checkout.
            </p>
          </div>

          {selectedProductIds.length > 0 && (
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all self-start md:self-center"
            >
              <PackageCheck size={18} />
              Bulk Edit ({selectedProductIds.length})
            </button>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Products</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</h3>
            <span className="text-xs text-slate-400 font-medium">All in catalog</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles size={13} /> Free Delivery
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.free}</h3>
            <span className="text-xs text-emerald-600/70 font-medium">৳0 Shipping</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-blue-100 dark:border-blue-950/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full pointer-events-none" />
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign size={13} /> Custom Charge
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.custom}</h3>
            <span className="text-xs text-blue-600/70 font-medium">Specific Rates</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Standard Rates</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.standard}</h3>
            <span className="text-xs text-slate-400 font-medium">Courier default</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-dark-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        
        {/* Top Controls: Search + Category */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search product name, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-dark-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'
            }`}
          >
            All Products ({stats.total})
          </button>

          <button
            onClick={() => setSelectedFilter('free')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'free'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
            }`}
          >
            <Sparkles size={12} /> Free Delivery ({stats.free})
          </button>

          <button
            onClick={() => setSelectedFilter('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'custom'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100'
            }`}
          >
            <DollarSign size={12} /> Custom Charge ({stats.custom})
          </button>

          <button
            onClick={() => setSelectedFilter('default')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'default'
                ? 'bg-slate-700 text-white dark:bg-slate-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'
            }`}
          >
            Standard Rates ({stats.standard})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        
        {/* Table Head Actions */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-dark-900/30">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all-products"
              checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <label htmlFor="select-all-products" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Select All Shown ({filteredProducts.length})
            </label>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Truck size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No products found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              No products match your current search or filter. Try clearing the search query or selecting a different filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredProducts.map(product => {
              const isFree = Boolean(product.isFreeDelivery);
              const isCustom = !isFree && product.customDeliveryCharge !== undefined && product.customDeliveryCharge !== null && !isNaN(Number(product.customDeliveryCharge));
              const isSelected = selectedProductIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-primary-50/40 dark:bg-primary-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-dark-900/40'
                  }`}
                >
                  {/* Product Details & Checkbox */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectProduct(product.id)}
                      className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 border-slate-300 dark:border-slate-600 cursor-pointer flex-shrink-0"
                    />

                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-900 flex-shrink-0 border border-slate-200/60 dark:border-white/5">
                      <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {product.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">৳{product.price}</span>
                        <span>•</span>
                        <span>{product.category || 'General'}</span>
                        {product.brand && (
                          <>
                            <span>•</span>
                            <span>{product.brand}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Status Badge & Modify Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center pl-7 sm:pl-0">
                    
                    {/* Delivery Status Pill */}
                    {isFree ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40">
                        <Sparkles size={12} /> Free Delivery (৳0)
                      </span>
                    ) : isCustom ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/40">
                        <DollarSign size={12} /> Custom: ৳{product.customDeliveryCharge}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-dark-900 dark:text-slate-400 dark:border-slate-700">
                        <Truck size={12} /> Standard Courier (৳60/৳120)
                      </span>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-bold transition-all flex items-center gap-1.5 bg-white dark:bg-dark-900 shadow-sm"
                    >
                      Configure
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SINGLE PRODUCT EDIT MODAL */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-dark-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Settings</h3>
                  <p className="text-xs text-slate-500">Configure delivery rules for this product</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Product preview card */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-dark-800 flex-shrink-0">
                  <Image
                    src={editingProduct.image || '/placeholder.png'}
                    alt={editingProduct.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{editingProduct.name}</h4>
                  <p className="text-xs text-slate-500">৳{editingProduct.price} • {editingProduct.category}</p>
                </div>
              </div>

              {/* Delivery Mode Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Delivery Option
                </label>

                <div className="grid grid-cols-1 gap-3">
                  
                  {/* Option 1: Standard / Default */}
                  <label
                    onClick={() => setDeliveryMode('default')}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMode === 'default'
                        ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20 ring-2 ring-primary-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'default'}
                      onChange={() => setDeliveryMode('default')}
                      className="mt-0.5 text-primary-500 focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Standard Courier Rate</span>
                        <span className="text-[11px] font-normal text-slate-500">(Default)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Uses default rates configured under Courier settings (e.g., Inside Dhaka ৳60, Outside Dhaka ৳120).
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Free Delivery */}
                  <label
                    onClick={() => setDeliveryMode('free')}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMode === 'free'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'free'}
                      onChange={() => setDeliveryMode('free')}
                      className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Sparkles size={14} />
                        <span>Free Delivery (৳0)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer will be charged ৳0 delivery fee anywhere in Bangladesh for orders containing this item.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Custom Delivery Charge */}
                  <label
                    onClick={() => setDeliveryMode('custom')}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMode === 'custom'
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'custom'}
                      onChange={() => setDeliveryMode('custom')}
                      className="mt-0.5 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <DollarSign size={14} />
                        <span>Specific / Custom Delivery Charge</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set a fixed delivery charge specifically for this item (ideal for heavy or express products).
                      </p>

                      {deliveryMode === 'custom' && (
                        <div className="mt-3.5 pt-3 border-t border-blue-200/60 dark:border-blue-800/40">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Custom Delivery Charge Amount (BDT)
                          </label>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="e.g. 50, 100, 150"
                              value={customChargeInput}
                              onChange={(e) => setCustomChargeInput(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            This amount will be applied at checkout instead of standard courier fees.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-dark-900/40">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK EDIT MODAL */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-dark-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <PackageCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Delivery Update</h3>
                  <p className="text-xs text-slate-500">Updating {selectedProductIds.length} selected products</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose the delivery policy to apply simultaneously to all <strong>{selectedProductIds.length}</strong> selected products:
              </p>

              <div className="space-y-3">
                <label
                  onClick={() => setBulkMode('free')}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    bulkMode === 'free'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="bulkMode"
                    checked={bulkMode === 'free'}
                    onChange={() => setBulkMode('free')}
                    className="text-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Make Free Delivery (৳0)</span>
                    <p className="text-xs text-slate-500">Enable free shipping promotion for all selected items.</p>
                  </div>
                </label>

                <label
                  onClick={() => setBulkMode('custom')}
                  className={`flex flex-col gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    bulkMode === 'custom'
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="bulkMode"
                      checked={bulkMode === 'custom'}
                      onChange={() => setBulkMode('custom')}
                      className="text-blue-500"
                    />
                    <div>
                      <span className="font-bold text-sm text-blue-700 dark:text-blue-400">Set Custom Delivery Charge</span>
                      <p className="text-xs text-slate-500">Apply a uniform specific delivery fee for all selected items.</p>
                    </div>
                  </div>

                  {bulkMode === 'custom' && (
                    <div className="pl-7 pt-2">
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={bulkCustomCharge}
                          onChange={(e) => setBulkCustomCharge(e.target.value)}
                          className="w-full pl-8 pr-4 py-1.5 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </label>

                <label
                  onClick={() => setBulkMode('default')}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    bulkMode === 'default'
                      ? 'border-slate-500 bg-slate-50 dark:bg-dark-900'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="bulkMode"
                    checked={bulkMode === 'default'}
                    onChange={() => setBulkMode('default')}
                    className="text-slate-700"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Reset to Standard Courier Rates</span>
                    <p className="text-xs text-slate-500">Revert selected products back to global courier rates (৳60/৳120).</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-dark-900/40">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleBulkApply}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Apply to {selectedProductIds.length} Products
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
