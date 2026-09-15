"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, RefreshCcw, Star, ChevronDown, ChevronUp, Layout, UploadCloud, Link2 } from 'lucide-react';
import { useHomepageStore, Testimonial } from '@/store/homepageStore';

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
  const { content, fetchSettings, updateHero, updateFeature, addTestimonial, updateTestimonial, removeTestimonial, updateNewsletter, updateVisibility, resetToDefaults } = useHomepageStore();
  const [activeTab, setActiveTab] = useState<EditorTab>('hero');
  const [expandedTestimonial, setExpandedTestimonial] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [heroImageMode, setHeroImageMode] = useState<'url' | 'upload'>('url');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateHero({ heroImageUrl: result });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'hero', label: 'Hero' },
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

          {/* ===== HERO TAB ===== */}
          {activeTab === 'hero' && (
            <>
              <SectionCard title="Badge & Headline">
                <InputField label="Badge Text" value={content.hero.badgeText} onChange={v => updateHero({ badgeText: v })} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Headline Line 1" value={content.hero.headlineLine1} onChange={v => updateHero({ headlineLine1: v })} />
                  <InputField label="Headline Line 2 (Gradient)" value={content.hero.headlineLine2} onChange={v => updateHero({ headlineLine2: v })} />
                </div>
                <InputField label="Subtext" value={content.hero.subtext} onChange={v => updateHero({ subtext: v })} multiline />
              </SectionCard>

              <SectionCard title="Buttons">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Primary Button Label" value={content.hero.button1Label} onChange={v => updateHero({ button1Label: v })} />
                  <InputField label="Primary Button Link" value={content.hero.button1Link} onChange={v => updateHero({ button1Link: v })} />
                </div>
                <InputField label="Secondary Button Label" value={content.hero.button2Label} onChange={v => updateHero({ button2Label: v })} />
              </SectionCard>

              <SectionCard title="Hero Image">
                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-dark-800 rounded-xl w-fit">
                  <button
                    onClick={() => setHeroImageMode('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      heroImageMode === 'url' ? 'bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Link2 size={12} /> URL
                  </button>
                  <button
                    onClick={() => setHeroImageMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      heroImageMode === 'upload' ? 'bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <UploadCloud size={12} /> Upload
                  </button>
                </div>

                {heroImageMode === 'url' && (
                  <InputField label="Image URL" value={content.hero.heroImageUrl.startsWith('data:') ? '' : content.hero.heroImageUrl} onChange={v => updateHero({ heroImageUrl: v })} placeholder="https://..." />
                )}

                {heroImageMode === 'upload' && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-dark-800'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center">
                      <UploadCloud size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click or drag & drop to upload</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP — Max 5MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageFile(file); }}
                    />
                  </div>
                )}

                {content.hero.heroImageUrl && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={content.hero.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => updateHero({ heroImageUrl: '' })}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        <Trash2 size={14} /> Remove Image
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
                      {content.hero.heroImageUrl.startsWith('data:') ? '📁 Uploaded image' : '🔗 URL image'}
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Floating Cards">
                {content.hero.floatingCards.map((card, idx) => (
                  <div key={card.id} className="p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase">Card {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Title" value={card.title} onChange={v => updateHero({
                        floatingCards: content.hero.floatingCards.map(c => c.id === card.id ? { ...c, title: v } : c)
                      })} />
                      <InputField label="Subtitle" value={card.subtitle} onChange={v => updateHero({
                        floatingCards: content.hero.floatingCards.map(c => c.id === card.id ? { ...c, subtitle: v } : c)
                      })} />
                    </div>
                  </div>
                ))}
              </SectionCard>
            </>
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
                  { key: 'newsletter', label: 'Newsletter Section', desc: 'Email subscription form' }
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
