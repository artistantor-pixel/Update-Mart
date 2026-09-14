"use client";

import { useState } from 'react';
import { useProductStore } from '@/store/productStore';
import { useLandingPageStore } from '@/store/landingPageStore';
import { Copy, ExternalLink, Megaphone, CheckCircle2, Save, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function LandingPageManager() {
  const { products } = useProductStore();
  const { savedPages, saveLandingPage, deleteLandingPage } = useLandingPageStore();
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // Base URL for the landing page link
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const promoUrl = selectedProductId ? `${baseUrl}/promo/${selectedProductId}` : '';

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    if (!selectedProductId || !campaignName.trim()) return;
    saveLandingPage(selectedProductId, campaignName.trim());
    setCampaignName(''); // reset input
    setSelectedProductId(''); // reset selection
  };

  return (
    <div className="space-y-8 text-left">
      {/* Generator Section */}
      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
          <div className="p-3 bg-primary-50 dark:bg-primary-500/10 text-primary-500 rounded-xl">
            <Megaphone size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ad Landing Pages</h2>
            <p className="text-sm text-slate-500 mt-1">Generate high-converting, minimal landing pages for specific products. Perfect for Facebook or Google Ad campaigns.</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select a Product to generate its Landing Page</label>
          <select 
            value={selectedProductId} 
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white mb-8"
          >
            <option value="">-- Select Product --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
            ))}
          </select>

          {selectedProduct && (
            <div className="bg-slate-50 dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Generated Landing Page</h3>
              
              <div className="flex items-center gap-4 mb-6 bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{selectedProduct.name}</h4>
                  <p className="text-sm text-slate-500">Optimized for conversions</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Campaign URL</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={promoUrl} 
                      className="flex-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button 
                      onClick={() => handleCopy(promoUrl, 'generator')}
                      className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                      title="Copy Link"
                    >
                      {copied === 'generator' ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <a 
                      href={promoUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/20"
                      title="Preview Page"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Save Campaign for later</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Facebook Ad - Summer Sale"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="flex-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button 
                      onClick={handleSave}
                      disabled={!campaignName.trim()}
                      className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={16} /> Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Campaigns Section */}
      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Saved Campaigns</h2>
        
        {savedPages.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-slate-200 dark:border-white/5">
            <Megaphone size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500">No saved campaigns yet. Create one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-4 font-medium text-left">Campaign Name</th>
                  <th className="pb-4 font-medium text-left">Product</th>
                  <th className="pb-4 font-medium text-left">Date</th>
                  <th className="pb-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {savedPages.map((page) => {
                  const prod = products.find(p => p.id === page.productId);
                  const url = `${baseUrl}/promo/${page.productId}`;
                  
                  return (
                    <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                      <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {page.campaignName}
                      </td>
                      <td className="py-4">
                        {prod ? (
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded bg-slate-100 overflow-hidden">
                              <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{prod.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">Product deleted</span>
                        )}
                      </td>
                      <td className="py-4 text-sm text-slate-500">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(url, page.id)}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Copy URL"
                          >
                            {copied === page.id ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Open Preview"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button
                            onClick={() => deleteLandingPage(page.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Campaign"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
