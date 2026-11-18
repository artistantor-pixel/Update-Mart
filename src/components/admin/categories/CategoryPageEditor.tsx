"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Layers,
  Save,
  RotateCcw,
  ExternalLink,
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  Clock,
  Zap,
  Tag,
  Search,
  Eye,
  Sliders,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Trash2,
  LucideIcon,
} from 'lucide-react';
import {
  useCategoryPageStore,
  type CategoryPageConfig,
  type CategoryHighlight,
  DEFAULT_CATEGORY_CONFIGS,
} from '@/store/categoryPageStore';
import { useBrandCategoryStore, type Category } from '@/store/brandCategoryStore';
import { useProductStore } from '@/store/productStore';

const AVAILABLE_ICONS = [
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Security / Shield' },
  { name: 'Award', icon: Award, label: 'Warranty / Quality' },
  { name: 'Truck', icon: Truck, label: 'Fast Delivery' },
  { name: 'RotateCcw', icon: RotateCcw, label: 'Easy Returns' },
  { name: 'Zap', icon: Zap, label: 'High Performance' },
  { name: 'Clock', icon: Clock, label: 'Express Dispatch' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'Official / Verified' },
  { name: 'Sparkles', icon: Sparkles, label: 'Premium Craft' },
];

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Zap,
  Clock,
  CheckCircle,
  Sparkles,
};

type ActiveEditorTab = 'hero' | 'highlights' | 'display' | 'seo';

interface CategoryPageEditorProps {
  initialSlug?: string;
  onClose?: () => void;
}

export default function CategoryPageEditor({
  initialSlug,
  onClose,
}: CategoryPageEditorProps) {
  const {
    configs,
    isLoading: isLoadingConfigs,
    isSaving,
    fetchConfigs,
    getConfig,
    saveCategoryConfig,
    resetCategoryConfig,
  } = useCategoryPageStore();

  const { categories, fetchCategories } = useBrandCategoryStore();
  const products = useProductStore((state) => state.products);

  // Selected Category Slug
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    return initialSlug?.toLowerCase() || 'watches';
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveEditorTab>('hero');

  // Form State
  const [form, setForm] = useState<CategoryPageConfig>(() =>
    getConfig(selectedSlug)
  );

  // Save / Action feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfigs();
    fetchCategories();
  }, [fetchConfigs, fetchCategories]);

  // Combine categories from store and default configs
  const allCategoryList = useMemo(() => {
    const list: { id: string; name: string; slug: string }[] = [];
    const seenSlugs = new Set<string>();

    categories.forEach((cat) => {
      const slug = cat.slug.toLowerCase().trim();
      if (!seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        list.push({ id: cat.id, name: cat.name, slug });
      }
    });

    // Ensure all default categories are in the list
    Object.keys(DEFAULT_CATEGORY_CONFIGS).forEach((defaultSlug) => {
      if (!seenSlugs.has(defaultSlug)) {
        seenSlugs.add(defaultSlug);
        const name = DEFAULT_CATEGORY_CONFIGS[defaultSlug].name;
        list.push({ id: `def-${defaultSlug}`, name, slug: defaultSlug });
      }
    });

    return list;
  }, [categories]);

  // When selected slug changes or configs load, update form
  useEffect(() => {
    const currentCat = allCategoryList.find((c) => c.slug === selectedSlug);
    const loadedConfig = getConfig(selectedSlug, currentCat?.name);
    setForm(loadedConfig);
  }, [selectedSlug, configs, allCategoryList, getConfig]);

  // Count products in this category
  const currentCategoryProductCount = useMemo(() => {
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const slug = selectedSlug.toLowerCase();
      const name = (form.name || '').toLowerCase();
      return cat.includes(slug) || cat.includes(name);
    }).length;
  }, [products, selectedSlug, form.name]);

  // Handle Save
  const handleSave = async () => {
    setSaveStatus('idle');
    const success = await saveCategoryConfig(selectedSlug, form);
    if (success) {
      setSaveStatus('success');
      setStatusMessage('Category page settings saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } else {
      setSaveStatus('error');
      setStatusMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  };

  // Handle Reset
  const handleReset = async () => {
    if (
      confirm(
        `Are you sure you want to reset "${form.name}" page settings back to default?`
      )
    ) {
      const success = await resetCategoryConfig(selectedSlug, form.name);
      if (success) {
        setSaveStatus('success');
        setStatusMessage('Reset to default values.');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    }
  };

  // Banner image upload handler
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setForm((prev) => ({ ...prev, bannerImageUrl: data.secure_url }));
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      const localUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, bannerImageUrl: localUrl }));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Highlights handlers
  const updateHighlight = (
    index: number,
    field: keyof CategoryHighlight,
    value: string
  ) => {
    const updated = (form.highlights || []).map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    );
    setForm((prev) => ({ ...prev, highlights: updated }));
  };

  const addHighlight = () => {
    if ((form.highlights || []).length >= 4) return;
    const newH: CategoryHighlight = {
      id: `h-${Date.now()}`,
      icon: 'ShieldCheck',
      title: 'New Guarantee',
      description: 'Add your custom value proposition description',
    };
    setForm((prev) => ({ ...prev, highlights: [...(prev.highlights || []), newH] }));
  };

  const removeHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-16">
      {/* 1. Header & Category Selector Bar */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Category Page Editor (ক্যাটাগরি পেজ কাস্টমাইজার)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Customize dedicated landing pages, hero banners, trust badges, and SEO for every department.
              </p>
            </div>
          </div>

          {/* Action Buttons: Preview + Save + Reset */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <Link
              href={`/category/${selectedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-dark-900 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors shadow-sm"
              title="Open category page in new tab"
            >
              <ExternalLink size={14} />
              <span>Live Preview</span>
            </Link>

            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Status Toast Alert */}
        {saveStatus !== 'idle' && (
          <div
            className={`mt-4 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              saveStatus === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {saveStatus === 'success' ? (
              <CheckCircle size={16} className="shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Category Horizontal Pill Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Category to Edit (ক্যাটাগরি সিলেক্ট করুন):
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {allCategoryList.map((cat) => {
              const isSelected = cat.slug === selectedSlug;
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setSelectedSlug(cat.slug)}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/25'
                      : 'bg-slate-50 dark:bg-dark-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-dark-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    /category/{cat.slug}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Visual Live Hero Mockup / Preview Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white shadow-lg border border-slate-200 dark:border-white/10">
        <div className="absolute inset-0">
          <Image
            src={form.bannerImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85'}
            alt={form.headline || form.name}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70"
            style={{ opacity: (form.bannerOverlayOpacity || 65) / 100 }}
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            <span>{form.tagline || 'CATEGORY TAGLINE'}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {form.headline || form.name}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
            {form.description}
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-white/80 font-medium">
            <span>
              <strong className="text-white font-bold">{currentCategoryProductCount}</strong> Products Found
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">100% Genuine Guaranteed</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Fast Shipping</span>
          </div>
        </div>
      </div>

      {/* 3. Editor Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'hero'
              ? 'border-primary-500 text-primary-500 dark:text-indigo-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Sparkles size={16} />
          <span>Hero & Banner (ব্যানার ও শিরোনাম)</span>
        </button>

        <button
          onClick={() => setActiveTab('highlights')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'highlights'
              ? 'border-primary-500 text-primary-500 dark:text-indigo-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Award size={16} />
          <span>Trust Badges & Highlights (ফিচার্স)</span>
        </button>

        <button
          onClick={() => setActiveTab('display')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'display'
              ? 'border-primary-500 text-primary-500 dark:text-indigo-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Filters & Display (ফিল্টার)</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'seo'
              ? 'border-primary-500 text-primary-500 dark:text-indigo-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Globe size={16} />
          <span>SEO & Metadata</span>
        </button>
      </div>

      {/* 4. Tab 1: Hero & Banner Content */}
      {activeTab === 'hero' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Banner & Header Customization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Category Display Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Tagline / Top Pill */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Tagline / Top Badge (e.g. &quot;PRECISION TIMEKEEPING&quot;)
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. CURATED COLLECTION"
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Main Headline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Main Banner Headline (মূল শিরোনাম)
            </label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Curated Luxury & Minimalist Watches"
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Intro Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category Description (বিবরণ)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the collection..."
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Banner Image URL + Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Hero Banner Image (ব্যানার ছবি)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={form.bannerImageUrl}
                onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-xs font-bold text-slate-800 dark:text-white transition-colors shrink-0"
              >
                <Upload size={14} className={isUploadingBanner ? 'animate-bounce' : ''} />
                <span>{isUploadingBanner ? 'Uploading...' : 'Upload File'}</span>
              </button>
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Banner Overlay Darkness Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Dark Overlay Opacity (ব্যানার অন্ধকার স্তর)
              </label>
              <span className="text-xs font-mono font-bold text-primary-500">
                {form.bannerOverlayOpacity || 65}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={form.bannerOverlayOpacity || 65}
              onChange={(e) =>
                setForm({ ...form, bannerOverlayOpacity: Number(e.target.value) })
              }
              className="w-full accent-primary-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Controls contrast so text is clearly readable against any photo background.
            </p>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Trust Badges & Highlights */}
      {activeTab === 'highlights' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Highlights & Guarantees (৩টি ট্রাস্ট পয়েন্ট)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Shown right below the category hero banner to drive buyer confidence.
              </p>
            </div>
            {(form.highlights || []).length < 4 && (
              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-indigo-300 text-xs font-bold hover:bg-primary-100 transition-colors"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(form.highlights || []).map((highlight, idx) => (
              <div
                key={highlight.id || idx}
                className="bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200/80 dark:border-white/10 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500">
                    Pillar #{idx + 1}
                  </span>
                  {(form.highlights || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHighlight(idx)}
                      className="text-rose-500 hover:text-rose-600 p-1"
                      title="Remove highlight"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Icon Selector */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Icon
                    </label>
                    <select
                      value={highlight.icon}
                      onChange={(e) => updateHighlight(idx, 'icon', e.target.value)}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white"
                    >
                      {AVAILABLE_ICONS.map((opt) => (
                        <option key={opt.name} value={opt.name}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={highlight.title}
                      onChange={(e) => updateHighlight(idx, 'title', e.target.value)}
                      placeholder="e.g. 100% Genuine Guaranteed"
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={highlight.description}
                    onChange={(e) => updateHighlight(idx, 'description', e.target.value)}
                    placeholder="e.g. Sourced directly from verified manufacturers"
                    className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Filters & Display Preferences */}
      {activeTab === 'display' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Catalog Page Filters & Preferences
          </h3>

          <div className="space-y-4">
            {/* Show Brand Filter Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-white/10">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Brand Filter Pills (ব্র্যান্ড ফিল্টার দেখান)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Allows shoppers to filter products by available brands within this category.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.showBrandFilter}
                onChange={(e) =>
                  setForm({ ...form, showBrandFilter: e.target.checked })
                }
                className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
              />
            </div>

            {/* Show Price Filter Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-white/10">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Price Range Filter (মূল্য ফিল্টার দেখান)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enables min-max price budget filtering on this category page.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.showPriceFilter}
                onChange={(e) =>
                  setForm({ ...form, showPriceFilter: e.target.checked })
                }
                className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
              />
            </div>

            {/* Default Sort Order */}
            <div className="p-4 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Default Sort Order (ডিফল্ট সর্টিং ক্রম)
              </label>
              <select
                value={form.defaultSort || 'featured'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultSort: e.target.value as CategoryPageConfig['defaultSort'],
                  })
                }
                className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="featured">Featured Picks (ডিফল্ট সাজানো)</option>
                <option value="price_asc">Price: Low to High (কম দাম থেকে বেশি)</option>
                <option value="price_desc">Price: High to Low (বেশি দাম থেকে কম)</option>
                <option value="newest">Newest Arrivals First (নতুন প্রডাক্ট আগে)</option>
                <option value="rating">Top Rated First (সর্বোচ্চ রেটিং আগে)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: SEO & Metadata */}
      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Search Engine Optimization (SEO) & Google Snippet
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                SEO Meta Title (গুগল সার্চ টাইটেল)
              </label>
              <input
                type="text"
                value={form.seoTitle || ''}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder={`${form.headline || form.name} | Update Mart`}
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Recommended length: 50-60 characters.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                SEO Meta Description (গুগল সার্চ বর্ণনা)
              </label>
              <textarea
                rows={3}
                value={form.seoDescription || ''}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder="Shop authentic items with express delivery and official warranty at Update Mart."
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Recommended length: 140-160 characters.
              </p>
            </div>

            {/* Google Search Result Preview Card */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Google Search Result Preview:
              </label>
              <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">
                  https://mart.updatekeybd.com/category/{selectedSlug}
                </span>
                <h4 className="text-blue-700 dark:text-blue-400 font-medium text-base hover:underline cursor-pointer">
                  {form.seoTitle || `${form.headline || form.name} | Update Mart`}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {form.seoDescription ||
                    form.description ||
                    `Shop the finest ${form.name} collection with express delivery and official warranty at Update Mart.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

