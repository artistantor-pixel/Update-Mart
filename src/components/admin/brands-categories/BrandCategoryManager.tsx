'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Layers,
  Award,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Upload,
  RefreshCw,
  Sparkles,
  X,
  AlertTriangle,
  Globe,
  SlidersHorizontal,
  FolderTree,
  Tag
} from 'lucide-react';
import { useBrandCategoryStore, Category, Brand } from '@/store/brandCategoryStore';
import { useProductStore } from '@/store/productStore';

type ActiveTab = 'categories' | 'brands';
type ViewMode = 'grid' | 'table';

export default function BrandCategoryManager() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(Category | Brand) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'category' | 'brand' } | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Store bindings
  const {
    categories,
    brands,
    isLoadingCategories,
    isLoadingBrands,
    fetchCategories,
    fetchBrands,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    createBrand,
    updateBrand,
    deleteBrand,
    toggleBrandActive,
  } = useBrandCategoryStore();

  const products = useProductStore((state) => state.products);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  // Calculate Product count per Category & Brand dynamically
  const categoryProductCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category?.toLowerCase().trim();
      if (cat) {
        map[cat] = (map[cat] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  const brandProductCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const b = p.brand?.toLowerCase().trim();
      if (b) {
        map[b] = (map[b] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Auto-generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingItem) {
      setFormSlug(generateSlug(val));
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormImageUrl('');
    setFormWebsiteUrl('');
    setFormIsActive(true);
    setFormSortOrder(activeTab === 'categories' ? categories.length + 1 : brands.length + 1);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: Category | Brand) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormSlug(item.slug);
    setFormDesc(item.description || '');
    setFormImageUrl(
      activeTab === 'categories'
        ? (item as Category).image_url || ''
        : (item as Brand).logo_url || ''
    );
    setFormWebsiteUrl((item as Brand).website_url || '');
    setFormIsActive(item.is_active);
    setFormSortOrder(item.sort_order || 0);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Image Upload Handler (Cloudinary or Direct URL)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
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
        setFormImageUrl(data.secure_url);
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      // Fallback: create object URL preview for instant feedback
      const localUrl = URL.createObjectURL(file);
      setFormImageUrl(localUrl);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    const cleanSlug = formSlug.trim() || generateSlug(formName);

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (activeTab === 'categories') {
        if (editingItem) {
          const res = await updateCategory(editingItem.id, {
            name: formName.trim(),
            slug: cleanSlug,
            description: formDesc.trim() || undefined,
            image_url: formImageUrl.trim() || undefined,
            is_active: formIsActive,
            sort_order: formSortOrder,
          });
          if (!res.success) throw new Error(res.error || 'Failed to update category');
        } else {
          const res = await createCategory({
            name: formName.trim(),
            slug: cleanSlug,
            description: formDesc.trim() || undefined,
            image_url: formImageUrl.trim() || undefined,
            is_active: formIsActive,
            sort_order: formSortOrder,
          });
          if (!res.success) throw new Error(res.error || 'Failed to create category');
        }
      } else {
        if (editingItem) {
          const res = await updateBrand(editingItem.id, {
            name: formName.trim(),
            slug: cleanSlug,
            description: formDesc.trim() || undefined,
            logo_url: formImageUrl.trim() || undefined,
            website_url: formWebsiteUrl.trim() || undefined,
            is_active: formIsActive,
            sort_order: formSortOrder,
          });
          if (!res.success) throw new Error(res.error || 'Failed to update brand');
        } else {
          const res = await createBrand({
            name: formName.trim(),
            slug: cleanSlug,
            description: formDesc.trim() || undefined,
            logo_url: formImageUrl.trim() || undefined,
            website_url: formWebsiteUrl.trim() || undefined,
            is_active: formIsActive,
            sort_order: formSortOrder,
          });
          if (!res.success) throw new Error(res.error || 'Failed to create brand');
        }
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'category') {
        await deleteCategory(deleteTarget.id);
      } else {
        await deleteBrand(deleteTarget.id);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filtered List
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && cat.is_active) ||
        (statusFilter === 'inactive' && !cat.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && b.is_active) ||
        (statusFilter === 'inactive' && !b.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [brands, searchQuery, statusFilter]);

  const currentCount = activeTab === 'categories' ? categories.length : brands.length;
  const currentActiveCount =
    activeTab === 'categories'
      ? categories.filter((c) => c.is_active).length
      : brands.filter((b) => b.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-primary-300 border border-white/10">
              <Sparkles size={14} className="text-primary-400" />
              Dynamic Taxonomy Hub
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Brand & Category Control
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Organize your catalog with responsive, high-conversion categories and official brands.
              Changes update your storefront and product upload forms dynamically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                fetchCategories();
                fetchBrands();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-medium backdrop-blur-md transition-all border border-white/10"
              title="Refresh from database"
            >
              <RefreshCw
                size={16}
                className={isLoadingCategories || isLoadingBrands ? 'animate-spin' : ''}
              />
              Sync
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 transition-all"
            >
              <Plus size={18} />
              Add {activeTab === 'categories' ? 'Category' : 'Brand'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-white/10 pt-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-md p-3.5 border border-white/5">
            <span className="text-xs font-medium text-slate-400">Total Categories</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{categories.length}</span>
              <span className="text-xs text-primary-400 font-semibold">
                ({categories.filter((c) => c.is_active).length} live)
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md p-3.5 border border-white/5">
            <span className="text-xs font-medium text-slate-400">Total Brands</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{brands.length}</span>
              <span className="text-xs text-primary-400 font-semibold">
                ({brands.filter((b) => b.is_active).length} live)
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md p-3.5 border border-white/5">
            <span className="text-xs font-medium text-slate-400">Catalog Coverage</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{products.length}</span>
              <span className="text-xs text-emerald-400 font-semibold">products linked</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md p-3.5 border border-white/5">
            <span className="text-xs font-medium text-slate-400">Active Status</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {currentCount ? Math.round((currentActiveCount / currentCount) * 100) : 100}%
              </span>
              <span className="text-xs text-slate-300">availability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation & Controls Card */}
      <div className="rounded-3xl bg-white dark:bg-dark-800 p-5 shadow-sm border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-dark-900 rounded-2xl border border-slate-200/80 dark:border-white/5">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderTree size={16} />
              Categories
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold">
                {categories.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'brands'
                  ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award size={16} />
              Brands
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold">
                {brands.length}
              </span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Data Table View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, slug or keyword...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <Filter
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Categories / Brands */}
      {activeTab === 'categories' ? (
        filteredCategories.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-dark-800 p-12 text-center border border-slate-200 dark:border-white/10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 mb-4">
              <FolderTree size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No categories found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery
                ? `No categories match "${searchQuery}". Try a different keyword.`
                : 'Get started by creating your first product category.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium text-sm shadow-md hover:bg-primary-600 transition-colors"
            >
              <Plus size={18} /> Add Category
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCategories.map((cat) => {
              const productCount = categoryProductCounts[cat.name.toLowerCase().trim()] || 0;
              return (
                <div
                  key={cat.id}
                  className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div>
                    {/* Header Image Area */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-dark-900 overflow-hidden">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-dark-900">
                          <FolderTree size={40} className="opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Status Badge */}
                      <button
                        onClick={() => toggleCategoryActive(cat.id)}
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm ${
                          cat.is_active
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                        title="Click to toggle status"
                      >
                        {cat.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>

                      {/* Item Count Pill */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                        {productCount} {productCount === 1 ? 'Product' : 'Products'}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                            {cat.name}
                          </h4>
                          <span className="inline-block mt-0.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>

                      {cat.description && (
                        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, type: 'category' })}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View for Categories */
          <div className="rounded-3xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-dark-900 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Linked Products</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredCategories.map((cat) => {
                    const productCount = categoryProductCounts[cat.name.toLowerCase().trim()] || 0;
                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-dark-700/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 rounded-xl bg-slate-100 dark:bg-dark-900 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                              {cat.image_url ? (
                                <Image
                                  src={cat.image_url}
                                  alt={cat.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <FolderTree size={18} />
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-xs">
                          {cat.description || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                            {productCount} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleCategoryActive(cat.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({ id: cat.id, name: cat.name, type: 'category' })
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              title="Delete"
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
          </div>
        )
      ) : (
        /* Brands Area */
        filteredBrands.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-dark-800 p-12 text-center border border-slate-200 dark:border-white/10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 mb-4">
              <Award size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No brands found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery
                ? `No brands match "${searchQuery}". Try a different keyword.`
                : 'Add official product brands to feature them across product cards and filters.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium text-sm shadow-md hover:bg-primary-600 transition-colors"
            >
              <Plus size={18} /> Add Brand
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBrands.map((brand) => {
              const productCount = brandProductCounts[brand.name.toLowerCase().trim()] || 0;
              return (
                <div
                  key={brand.id}
                  className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 p-5 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div>
                    {/* Brand Top Header with Logo */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative h-14 w-14 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 overflow-hidden p-2 flex items-center justify-center">
                        {brand.logo_url ? (
                          <Image
                            src={brand.logo_url}
                            alt={brand.name}
                            fill
                            className="object-contain p-1.5"
                            unoptimized
                          />
                        ) : (
                          <Award size={24} className="text-slate-400" />
                        )}
                      </div>

                      <button
                        onClick={() => toggleBrandActive(brand.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 ${
                          brand.is_active
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            brand.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                          {brand.name}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">/{brand.slug}</span>
                      </div>

                      {brand.description && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {brand.description}
                        </p>
                      )}

                      {brand.website_url && (
                        <a
                          href={brand.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
                        >
                          <Globe size={12} />
                          Visit Website
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Brand Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {productCount} {productCount === 1 ? 'Product' : 'Products'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(brand)}
                        className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                        title="Edit Brand"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({ id: brand.id, name: brand.name, type: 'brand' })
                        }
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Brand"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View for Brands */
          <div className="rounded-3xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-dark-900 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Website</th>
                    <th className="px-6 py-4">Linked Products</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredBrands.map((brand) => {
                    const productCount = brandProductCounts[brand.name.toLowerCase().trim()] || 0;
                    return (
                      <tr
                        key={brand.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-dark-700/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 rounded-xl bg-slate-100 dark:bg-dark-900 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
                              {brand.logo_url ? (
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.name}
                                  fill
                                  className="object-contain p-1"
                                  unoptimized
                                />
                              ) : (
                                <Award size={18} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {brand.name}
                              </span>
                              {brand.description && (
                                <span className="text-xs text-slate-400 line-clamp-1">
                                  {brand.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {brand.slug}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {brand.website_url ? (
                            <a
                              href={brand.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-500 hover:underline inline-flex items-center gap-1"
                            >
                              {new URL(brand.website_url).hostname.replace('www.', '')}
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                            {productCount} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleBrandActive(brand.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              brand.is_active
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                brand.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(brand)}
                              className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({ id: brand.id, name: brand.name, type: 'brand' })
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              title="Delete"
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
          </div>
        )
      )}

      {/* CREATE / EDIT SLIDE-OVER OR MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-dark-800 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-500">
                  {activeTab === 'categories' ? <FolderTree size={20} /> : <Award size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingItem ? `Edit ${activeTab === 'categories' ? 'Category' : 'Brand'}` : `Create New ${activeTab === 'categories' ? 'Category' : 'Brand'}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure details for your dynamic {activeTab === 'categories' ? 'category' : 'brand'} item.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    {activeTab === 'categories' ? 'Category Name' : 'Brand Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeTab === 'categories' ? 'e.g. Smart Watches' : 'e.g. Nova Audio'}
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                      URL Slug *
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormSlug(generateSlug(formName))}
                      className="text-[11px] text-primary-500 hover:underline font-medium"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. smart-watches"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder={`Brief overview of this ${activeTab === 'categories' ? 'category' : 'brand'}...`}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Image / Logo Upload Section */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  {activeTab === 'categories' ? 'Cover Image' : 'Brand Logo'}
                </label>

                <div className="flex items-center gap-4">
                  {/* Preview Container */}
                  <div className="relative h-20 w-20 rounded-2xl bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {formImageUrl ? (
                      <>
                        <Image
                          src={formImageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <Upload size={22} className="text-slate-400" />
                    )}
                  </div>

                  {/* Upload Actions & Direct URL */}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-dark-900 hover:bg-slate-200 dark:hover:bg-dark-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
                      <Upload size={14} className={isUploadingImage ? 'animate-bounce' : ''} />
                      {isUploadingImage ? 'Uploading...' : 'Upload Image File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Brand Field: Website URL */}
              {activeTab === 'brands' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    Official Website URL
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formWebsiteUrl}
                      onChange={(e) => setFormWebsiteUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Status and Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Active Status
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Visible in storefront navigation
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      formIsActive ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        formIsActive ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  {editingItem ? 'Save Changes' : `Create ${activeTab === 'categories' ? 'Category' : 'Brand'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-800 p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete {deleteTarget.type === 'category' ? 'Category' : 'Brand'}?
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{deleteTarget.name}&quot;</span>?
              Existing products assigned to this {deleteTarget.type} will retain their values, but this entry will be removed from future selection lists.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

