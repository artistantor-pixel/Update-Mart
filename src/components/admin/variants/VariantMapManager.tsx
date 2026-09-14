"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useProductStore, Product } from '@/store/productStore';
import { Layers, Link as LinkIcon, Unlink, CheckCircle2, Search, X } from 'lucide-react';

export default function VariantMapManager() {
  const { products, setVariantGroup, removeVariantGroup } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  // Group products by their variantGroupId
  const groups = products.reduce((acc, product) => {
    if (product.variantGroupId) {
      if (!acc[product.variantGroupId]) {
        acc[product.variantGroupId] = [];
      }
      acc[product.variantGroupId].push(product);
    }
    return acc;
  }, {} as Record<string, Product[]>);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.primaryColor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (selectedProducts.length > 1 && groupName) {
      const groupId = groupName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      setVariantGroup(selectedProducts, groupId);
      setSelectedProducts([]);
      setGroupName('');
    } else {
      alert('Please select at least 2 products and enter a group name.');
    }
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={24} className="text-primary-500" />
            Variant Mapping
          </h2>
          <p className="text-sm text-slate-500 mt-1">Link products together to display them as color variants on the product page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Create New Group */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create Variant Group</h3>
          
          <div className="bg-slate-50 dark:bg-dark-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Group Identifier Name (e.g. "Obsidian Watch Model")</label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button 
              onClick={handleCreateGroup}
              disabled={selectedProducts.length < 2 || !groupName}
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${selectedProducts.length >= 2 && groupName ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
            >
              <LinkIcon size={18} />
              Link {selectedProducts.length} Selected Products
            </button>
          </div>

          <div className="mb-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search products to link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => toggleProductSelection(product.id)}
                className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${selectedProducts.includes(product.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${selectedProducts.includes(product.id) ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {selectedProducts.includes(product.id) && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image src={product.image} alt={product.name} fill={true} style={{objectFit: "cover"}} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {product.primaryColor ? (
                      <span className="flex items-center text-xs text-slate-500">
                        <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: product.primaryColor.hex }} />
                        {product.primaryColor.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No primary color</span>
                    )}
                  </div>
                </div>
                {product.variantGroupId && (
                  <span className="text-[10px] bg-slate-100 dark:bg-dark-700 text-slate-500 px-2 py-1 rounded-full whitespace-nowrap">
                    In Group
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Existing Groups */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Existing Linked Groups</h3>
          
          <div className="space-y-6">
            {Object.keys(groups).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Layers size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500">No variant groups created yet.</p>
              </div>
            ) : (
              Object.entries(groups).map(([groupId, groupProducts]) => (
                <div key={groupId} className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize">{groupId.replace(/-/g, ' ')}</h4>
                    <span className="text-xs bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-medium">
                      {groupProducts.length} Items
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {groupProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-slate-100">
                            <Image src={product.image} alt={product.name} fill={true} style={{objectFit: "cover"}} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</p>
                            <div className="flex items-center text-xs text-slate-500">
                              {product.primaryColor ? (
                                <>
                                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: product.primaryColor.hex }} />
                                  {product.primaryColor.name}
                                </>
                              ) : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeVariantGroup(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Unlink from group"
                        >
                          <Unlink size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
