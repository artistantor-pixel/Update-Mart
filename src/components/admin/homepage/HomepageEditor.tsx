"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, RefreshCcw, Star, ChevronDown, ChevronUp, Layout, UploadCloud, Link2, ArrowUp, ArrowDown, Eye, EyeOff, Edit3, Sliders, ExternalLink, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { useHomepageStore, Testimonial, BannerSlide, DEFAULT_BANNERS } from '@/store/homepageStore';

const ICON_OPTIONS = ['Truck', 'Banknote', 'ShieldCheck', 'Clock', 'Shield', 'Battery', 'Zap', 'Star'];

type EditorTab = 'hero' | 'features' | 'testimonials' | 'newsletter' | 'visibility';

function InputField({ label, value, onChange, multiline = false, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
      <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function HomepageEditor() {
  const {
    content,
    fetchSettings,
    updateHero,
    addBanner,
    updateBanner,
    removeBanner,
    reorderBanners,
    updateFeature,
    addTestimonial,
    updateTestimonial,
    removeTestimonial,
    updateNewsletter,
    updateVisibility,
    resetToDefaults,
  } = useHomepageStore();
  const [activeTab, setActiveTab] = useState<EditorTab>('hero');
  const [expandedTestimonial, setExpandedTestimonial] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Banner slide modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerMobileImageUrl, setBannerMobileImageUrl] = useState('');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Current banners
  const currentBanners: BannerSlide[] = content.hero?.banners && content.hero.banners.length > 0
    ? content.hero.banners
    : DEFAULT_BANNERS;

  // Open Add Banner Modal
  const handleOpenAddBanner = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerLinkUrl('/products');
    setBannerImageUrl('');
    setBannerMobileImageUrl('');
    setBannerIsActive(true);
    setIsBannerModalOpen(true);
  };

  // Open Edit Banner Modal
  const handleOpenEditBanner = (b: BannerSlide) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title || '');
    setBannerLinkUrl(b.linkUrl || '/products');
    setBannerImageUrl(b.imageUrl || '');
    setBannerMobileImageUrl(b.mobileImageUrl || '');
    setBannerIsActive(b.isActive !== false);
    setIsBannerModalOpen(true);
  };

  // Save Banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImageUrl.trim()) {
      alert('Please provide a banner image URL or upload an image file.');
      return;
    }

    if (editingBannerId) {
      await updateBanner(editingBannerId, {
        title: bannerTitle.trim() || 'Promotional Banner',
        linkUrl: bannerLinkUrl.trim() || '/products',
        imageUrl: bannerImageUrl.trim(),
        mobileImageUrl: bannerMobileImageUrl.trim() || undefined,
        isActive: bannerIsActive,
      });
    } else {
      await addBanner({
        title: bannerTitle.trim() || 'Promotional Banner',
        linkUrl: bannerLinkUrl.trim() || '/products',
        imageUrl: bannerImageUrl.trim(),
        mobileImageUrl: bannerMobileImageUrl.trim() || undefined,
        isActive: bannerIsActive,
        order: currentBanners.length + 1,
      });
    }

    setIsBannerModalOpen(false);
  };

  // Move Banner Up / Down
  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBanners.length) return;

    const reordered = [...currentBanners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // re-assign orders
    const updated = reordered.map((b, i) => ({ ...b, order: i + 1 }));
    await reorderBanners(updated);
  };

  // Upload image to Cloudinary
  const handleUploadBannerFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Update Mart');

      const res = await fetch('https://api.cloudinary.com/v1_1/uiflbakr/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload image');
      const data = await res.json();
      if (data.secure_url) {
        setBannerImageUrl(data.secure_url);
      }
    } catch (err) {
      console.error('Banner upload failed:', err);
      // Fallback object URL
      setBannerImageUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'hero', label: 'Hero Banner Slider' },
    { id: 'features', label: 'Features Banner' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'visibility', label: 'Visibility' },
  ];

  const handleAddTestimonial = () => {
    const newT: Testimonial = {
      id: `t-${Date.now()}`,
      name: 'New Customer',
      role: 'Verified Buyer',
      content: 'Great product!',
      rating: 5,
      avatar: 'NC',
    };
    addTestimonial(newT);
    setExpandedTestimonial(newT.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Homepage Editor</h2>
              <p className="text-sm text-slate-500">Changes are saved instantly and go live on the home page.</p>
            </div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 transition-colors"
          >
            <RefreshCcw size={14} /> Reset to Defaults
          </button>
        </div>

        {/* Reset Confirm Banner */}
        {showResetConfirm && (
          <div className="px-6 py-4 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-center justify-between gap-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Are you sure? This will restore all default content.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700">Cancel</button>
              <button onClick={() => { resetToDefaults(); setShowResetConfirm(false); }} className="px-4 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600">Reset</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-100 dark:border-white/5 px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">

          {/* ===== HERO TAB: BANNER SLIDER MANAGEMENT ===== */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              {/* Slider Controls & Global Settings */}
              <SectionCard title="Banner Slider Settings">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Auto-Slide Interval (seconds)
                    </label>
                    <select
                      value={content.hero?.autoSlideInterval || 5}
                      onChange={(e) => updateHero({ autoSlideInterval: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <option value="3">Every 3 Seconds (Fast)</option>
                      <option value="5">Every 5 Seconds (Standard)</option>
                      <option value="7">Every 7 Seconds (Relaxed)</option>
                      <option value="10">Every 10 Seconds (Slow)</option>
                      <option value="0">Disabled (Manual Swipe Only)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        Navigation Arrows
                      </span>
                      <span className="text-[11px] text-slate-500">Show Prev / Next controls</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateHero({ showArrows: !(content.hero?.showArrows ?? true) })}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        (content.hero?.showArrows ?? true) ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          (content.hero?.showArrows ?? true) ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        Pagination Dots
                      </span>
                      <span className="text-[11px] text-slate-500">Show bottom slide indicator</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateHero({ showDots: !(content.hero?.showDots ?? true) })}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        (content.hero?.showDots ?? true) ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          (content.hero?.showDots ?? true) ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* Banner Slides List */}
              <SectionCard title="Active Banner Slides">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">
                    Manage full-width promotional hero slides. Slides auto-rotate and link to target products or categories.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddBanner}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-md shadow-primary-500/20 active:scale-95 transition-all"
                  >
                    <Plus size={15} />
                    Add Banner Slide
                  </button>
                </div>

                {currentBanners.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No banners created yet</p>
                    <p className="text-xs text-slate-500 mt-1">Add your first promotional hero banner slide.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentBanners.map((b, index) => (
                      <div
                        key={b.id || index}
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                          b.isActive !== false
                            ? 'bg-slate-50 dark:bg-dark-800/80 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-100/50 dark:bg-dark-900/50 border-slate-200/50 opacity-60'
                        }`}
                      >
                        {/* Slide Info & Thumbnail */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* Order Pill */}
                          <div className="flex flex-col gap-1 items-center justify-center flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveBanner(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <span className="text-[11px] font-bold text-slate-500 font-mono">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMoveBanner(index, 'down')}
                              disabled={index === currentBanners.length - 1}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          {/* Image Thumbnail */}
                          <div className="relative h-16 w-28 sm:w-36 rounded-xl bg-slate-200 dark:bg-dark-900 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={b.imageUrl}
                              alt={b.title || 'Slide'}
                              className="w-full h-full object-cover"
                            />
                            {b.isActive === false && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                                Inactive
                              </div>
                            )}
                          </div>

                          {/* Meta Details */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {b.title || 'Untitled Banner'}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-primary-500 truncate">
                              <ExternalLink size={12} className="flex-shrink-0" />
                              <span className="truncate">{b.linkUrl || '/products'}</span>
                            </div>
                            {b.mobileImageUrl && (
                              <span className="inline-block text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-dark-700 px-2 py-0.5 rounded">
                                Mobile Image Included
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Slide Action Controls */}
                        <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                          {/* Active Toggle Button */}
                          <button
                            type="button"
                            onClick={() => updateBanner(b.id, { isActive: !b.isActive })}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              b.isActive !== false
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}
                            title="Toggle active status"
                          >
                            {b.isActive !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                            <span className="hidden sm:inline">
                              {b.isActive !== false ? 'Live' : 'Hidden'}
                            </span>
                          </button>

                          {/* Edit Slide Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditBanner(b)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                            title="Edit Banner"
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* Delete Slide Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this banner slide?')) {
                                removeBanner(b.id);
                              }
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Delete Banner"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Modal For Adding / Editing Banner Slide */}
              {isBannerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                  <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-800 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-500">
                          <ImageIcon size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {editingBannerId ? 'Edit Banner Slide' : 'Add New Banner Slide'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Configure desktop & mobile banner imagery and destination links.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsBannerModalOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveBanner} className="p-6 overflow-y-auto space-y-4">
                      {/* Title & Alt */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Banner Title / Alt Description *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Special Mega Deal 2026"
                          value={bannerTitle}
                          onChange={(e) => setBannerTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Click Destination Link */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Target Destination Link (URL) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. /products?category=Watches or /promo/deal"
                          value={bannerLinkUrl}
                          onChange={(e) => setBannerLinkUrl(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Desktop Image */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Banner Image (Desktop) *
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              placeholder="Paste high-res image URL (e.g. https://...)"
                              value={bannerImageUrl}
                              onChange={(e) => setBannerImageUrl(e.target.value)}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => bannerFileInputRef.current?.click()}
                              disabled={isUploadingBanner}
                              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-700 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <UploadCloud size={14} className={isUploadingBanner ? 'animate-bounce' : ''} />
                              {isUploadingBanner ? 'Uploading...' : 'Upload File'}
                            </button>
                            <input
                              ref={bannerFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadBannerFile(file);
                              }}
                            />
                          </div>

                          {bannerImageUrl && (
                            <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={bannerImageUrl}
                                alt="Desktop Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Optional Mobile Image */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Mobile-Optimized Image (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="Optional separate image URL for mobile screens"
                          value={bannerMobileImageUrl}
                          onChange={(e) => setBannerMobileImageUrl(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Active Status */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                            Active Status
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Enable to display this slide in the live storefront
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBannerIsActive(!bannerIsActive)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            bannerIsActive ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                              bannerIsActive ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Modal Footer Actions */}
                      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setIsBannerModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all"
                        >
                          {editingBannerId ? 'Update Slide' : 'Add Slide'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== FEATURES TAB ===== */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {content.features.map((feature, idx) => (
                <SectionCard key={feature.id} title={`Feature ${idx + 1}`}>
                  <InputField label="Title" value={feature.title} onChange={v => updateFeature(feature.id, { title: v })} />
                  <InputField label="Description" value={feature.description} onChange={v => updateFeature(feature.id, { description: v })} />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Icon</label>
                    <select
                      value={feature.icon}
                      onChange={e => updateFeature(feature.id, { icon: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}

          {/* ===== TESTIMONIALS TAB ===== */}
          {activeTab === 'testimonials' && (
            <>
              <div className="space-y-4">
                {content.testimonials.map((t) => (
                  <div key={t.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                      onClick={() => setExpandedTestimonial(expandedTestimonial === t.id ? null : t.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">{t.avatar}</div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.role} • {t.rating}★</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeTestimonial(t.id); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        {expandedTestimonial === t.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </button>

                    {expandedTestimonial === t.id && (
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4 bg-slate-50/50 dark:bg-dark-900/30">
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Name" value={t.name} onChange={v => updateTestimonial(t.id, { name: v, avatar: v.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) })} />
                          <InputField label="Role" value={t.role} onChange={v => updateTestimonial(t.id, { role: v })} />
                        </div>
                        <InputField label="Review Content" value={t.content} onChange={v => updateTestimonial(t.id, { content: v })} multiline />
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</label>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} onClick={() => updateTestimonial(t.id, { rating: star })}>
                                <Star size={24} className={star <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddTestimonial}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl text-slate-500 hover:text-primary-500 hover:border-primary-400 transition-colors text-sm font-medium"
              >
                <Plus size={16} /> Add Testimonial
              </button>
            </>
          )}

          {/* ===== NEWSLETTER TAB ===== */}
          {activeTab === 'newsletter' && (
            <SectionCard title="Newsletter Section">
              <InputField label="Headline" value={content.newsletter.headline} onChange={v => updateNewsletter({ headline: v })} />
              <InputField label="Subtext" value={content.newsletter.subtext} onChange={v => updateNewsletter({ subtext: v })} multiline />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Button Label" value={content.newsletter.buttonLabel} onChange={v => updateNewsletter({ buttonLabel: v })} />
                <InputField label="Input Placeholder" value={content.newsletter.placeholder} onChange={v => updateNewsletter({ placeholder: v })} />
              </div>
            </SectionCard>
          )}

          {/* ===== VISIBILITY TAB ===== */}
          {activeTab === 'visibility' && (
            <SectionCard title="Section Visibility">
              <p className="text-sm text-slate-500 mb-4">Toggle the sections you want to display on the homepage.</p>
              <div className="space-y-4">
                {[
                  { key: 'hero', label: 'Hero Section', desc: 'The top section with main call-to-action' },
                  { key: 'features', label: 'Features Banner', desc: '4-column banner with icons (Shipping, Warranty, etc)' },
                  { key: 'category', label: 'Category Showcase', desc: 'List of product categories' },
                  { key: 'trending', label: 'Trending Products', desc: 'Grid of popular products' },
                  { key: 'testimonials', label: 'Testimonials', desc: 'Customer reviews slider' },
                  { key: 'newsletter', label: 'Newsletter Section', desc: 'Email subscription form' },
                  { key: 'productTrustBadges', label: 'Product Trust Badges', desc: 'Warranty & Returns badges on single product pages' }
                ].map((section) => {
                  // Fallback to true if visibility state is not yet initialized for this key
                  const isVisible = content.visibility ? (content.visibility as any)[section.key] !== false : true;
                  return (
                    <div key={section.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{section.label}</p>
                        <p className="text-xs text-slate-500">{section.desc}</p>
                      </div>
                      <button 
                        onClick={() => updateVisibility(section.key as keyof typeof content.visibility, !isVisible)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isVisible ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}


        </div>
      </div>
    </div>
  );
}
