"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  Leaf,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  Search,
  CheckCircle,
  AlertCircle,
  FolderTree,
} from 'lucide-react';
import {
  useBoyamStore,
  type BoyamPageSettings,
  type BoyamCategoryItem,
  type BoyamTrustItem,
} from '@/store/boyamStore';

type EditorSection = 'hero' | 'categories' | 'trust' | 'seo';

const AVAILABLE_ICONS = [
  'ShieldCheck',
  'Leaf',
  'FlaskConical',
  'HeartHandshake',
  'Award',
  'Sparkles',
  'CheckCircle',
  'Truck',
];

export default function BoyamPageEditor() {
  const { settings, isLoading, isSaving, fetchSettings, saveSettings, resetToDefaults } =
    useBoyamStore();

  const [form, setForm] = useState<BoyamPageSettings>(settings);
  const [activeSection, setActiveSection] = useState<EditorSection>('hero');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    const ok = await saveSettings(form);
    if (ok) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset Boyam Page settings to default?')) {
      await resetToDefaults();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // --- Category helpers ---
  const addCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCat: BoyamCategoryItem = {
      id: newId,
      label: 'নতুন ক্যাটাগরি',
      labelEn: 'New Category',
    };
    setForm({ ...form, categories: [...form.categories, newCat] });
  };

  const updateCategory = (index: number, field: 'id' | 'label' | 'labelEn', val: string) => {
    const updated = form.categories.map((c, i) => (i === index ? { ...c, [field]: val } : c));
    setForm({ ...form, categories: updated });
  };

  const removeCategory = (index: number) => {
    setForm({
      ...form,
      categories: form.categories.filter((_, i) => i !== index),
    });
  };

  // --- Trust item helpers ---
  const addTrustItem = () => {
    const newItem: BoyamTrustItem = {
      id: `t-${Date.now()}`,
      icon: 'ShieldCheck',
      title: 'নতুন বৈশিষ্ট্য',
      titleEn: 'Feature',
      desc: 'এখানে আপনার পণ্যের বিশুদ্ধতা ও প্রতিশ্রুতির বিবরণ লিখুন।',
    };
    setForm({ ...form, trustItems: [...form.trustItems, newItem] });
  };

  const updateTrustItem = (
    index: number,
    field: 'icon' | 'title' | 'titleEn' | 'desc',
    val: string
  ) => {
    const updated = form.trustItems.map((t, i) => (i === index ? { ...t, [field]: val } : t));
    setForm({ ...form, trustItems: updated });
  };

  const removeTrustItem = (index: number) => {
    setForm({
      ...form,
      trustItems: form.trustItems.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Leaf className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Boyam (বোয়াম) Page Editor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage hero banners, category pills, trust pillars, and SEO for the dedicated /boyam
            brand route.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/boyam"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Page</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Alert */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Boyam page settings saved successfully and updated live on /boyam!</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300 p-4 rounded-2xl text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to save Boyam settings. Please check your Supabase connection.</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveSection('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'hero'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Hero & Brand Story
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'categories'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          Category Filter Bar
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('trust')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'trust'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Trust & Authenticity
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('seo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'seo'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          SEO & Social Metadata
        </button>
      </div>

      {/* SECTION 1: HERO & BRAND STORY */}
      {activeSection === 'hero' && (
        <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Hero Section & Tagline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Brand Name (Bangla)
              </label>
              <input
                type="text"
                value={form.hero.brandNameBn}
                onChange={(e) =>
                  setForm({ ...form, hero: { ...form.hero, brandNameBn: e.target.value } })
                }
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Brand Name (English)
              </label>
              <input
                type="text"
                value={form.hero.brandNameEn}
                onChange={(e) =>
                  setForm({ ...form, hero: { ...form.hero, brandNameEn: e.target.value } })
                }
                className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Badge Text (Top Pill)
            </label>
            <input
              type="text"
              value={form.hero.badgeText}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, badgeText: e.target.value } })
              }
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Tagline (Hero Story)
            </label>
            <textarea
              rows={3}
              value={form.hero.tagline}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, tagline: e.target.value } })
              }
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Sub-tagline (Key Pillars)
            </label>
            <input
              type="text"
              value={form.hero.subTagline}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, subTagline: e.target.value } })
              }
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORY FILTER BAR */}
      {activeSection === 'categories' && (
        <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Category Filter Bar Pills
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These categories appear as horizontal scrollable filter pills under the header.
              </p>
            </div>
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="space-y-3">
            {form.categories.map((cat, idx) => (
              <div
                key={cat.id || idx}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">
                      Category ID / Match
                    </label>
                    <input
                      type="text"
                      value={cat.id}
                      onChange={(e) => updateCategory(idx, 'id', e.target.value)}
                      placeholder="e.g. Pickles or all"
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">
                      Bangla Label
                    </label>
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) => updateCategory(idx, 'label', e.target.value)}
                      placeholder="e.g. আচার"
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">
                      English Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={cat.labelEn}
                      onChange={(e) => updateCategory(idx, 'labelEn', e.target.value)}
                      placeholder="e.g. Pickles"
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  disabled={cat.id === 'all'}
                  className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Remove category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: TRUST & AUTHENTICITY */}
      {activeSection === 'trust' && (
        <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Trust & Authenticity Pillars
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays the 4 purity pillars (Homemade, Organic, Preservative-Free, Small-Batch) at
                the bottom of the page.
              </p>
            </div>
            <button
              type="button"
              onClick={addTrustItem}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pillar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.trustItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-500">Icon:</label>
                    <select
                      value={item.icon}
                      onChange={(e) => updateTrustItem(idx, 'icon', e.target.value)}
                      className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTrustItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">
                      Bangla Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTrustItem(idx, 'title', e.target.value)}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">
                      English Subtitle
                    </label>
                    <input
                      type="text"
                      value={item.titleEn}
                      onChange={(e) => updateTrustItem(idx, 'titleEn', e.target.value)}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => updateTrustItem(idx, 'desc', e.target.value)}
                    className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: SEO & METADATA */}
      {activeSection === 'seo' && (
        <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Search Engine Optimization (SEO)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Meta Title
            </label>
            <input
              type="text"
              value={form.seo.metaTitle}
              onChange={(e) =>
                setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })
              }
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={form.seo.metaDescription}
              onChange={(e) =>
                setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })
              }
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

