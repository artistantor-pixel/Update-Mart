"use client";

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Plus, X, Tag, Image as ImageIcon, CheckCircle2, ChevronRight,
  Save, Info, DollarSign, Layers, FileText, Settings, Palette, Trash2
} from 'lucide-react';
import { useProductStore, Product, ProductColor, ProductVariant, ProductSpec } from '@/store/productStore';
import { useBrandCategoryStore } from '@/store/brandCategoryStore';

interface AddProductFormProps {
  onCancel: () => void;
  editProduct?: Product;
}

export default function AddProductForm({ onCancel, editProduct }: AddProductFormProps) {
  const isEdit = !!editProduct;
  const { addProduct, updateProduct } = useProductStore();
  const { categories, brands, fetchCategories, fetchBrands } = useBrandCategoryStore();

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  // Section 1: Basic Info
  const [title, setTitle] = useState(editProduct?.name || '');
  const [brand, setBrand] = useState(editProduct?.brand || '');
  const [category, setCategory] = useState(editProduct?.category || '');
  const [isNew, setIsNew] = useState(editProduct?.isNew ?? true);
  const [tags, setTags] = useState<string[]>(editProduct?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Section 2: Media
  const [images, setImages] = useState<string[]>(
    editProduct?.images?.length ? editProduct.images : (editProduct?.image ? [editProduct.image] : [])
  );
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState(editProduct?.videoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Section 3: Pricing
  const [buyingPrice, setBuyingPrice] = useState(String(editProduct?.buyingPrice || ''));
  const [regularPrice, setRegularPrice] = useState(String(editProduct?.regularPrice || editProduct?.price || ''));
  const [salePrice, setSalePrice] = useState(String(editProduct?.salePrice || ''));
  const [stock, setStock] = useState(String(editProduct?.stock || ''));

  // Section 4: Primary Color
  const [primaryColorName, setPrimaryColorName] = useState(editProduct?.primaryColor?.name || '');
  const [primaryColorHex, setPrimaryColorHex] = useState(editProduct?.primaryColor?.hex || '#000000');

  // Section 5: Variants
  const [variants, setVariants] = useState<ProductVariant[]>(editProduct?.variants || []);

  // Section 6: Specs & Description
  const [description, setDescription] = useState(editProduct?.description || '');
  const [specs, setSpecs] = useState<ProductSpec[]>(
    editProduct?.specs?.length ? editProduct.specs : [{ key: '', value: '' }]
  );

  // Section 7: Publishing
  const [isLive, setIsLive] = useState(editProduct?.isLive ?? true);
  const [warranty, setWarranty] = useState(editProduct?.warranty || 'No Warranty');
  const [deliveryType, setDeliveryType] = useState(editProduct?.deliveryType || 'Standard Delivery');
  const [isFreeDelivery, setIsFreeDelivery] = useState(Boolean(editProduct?.isFreeDelivery));
  const [customDeliveryCharge, setCustomDeliveryCharge] = useState<string>(
    editProduct?.customDeliveryCharge !== null && editProduct?.customDeliveryCharge !== undefined 
      ? String(editProduct.customDeliveryCharge) 
      : ''
  );
  const [materialsAndCare, setMaterialsAndCare] = useState(editProduct?.materialsAndCare || '');
  const [shippingAndReturns, setShippingAndReturns] = useState(editProduct?.shippingAndReturns || '');
  const [metaTitle, setMetaTitle] = useState(editProduct?.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(editProduct?.metaDesc || '');

  const savings = Number(regularPrice) && Number(salePrice)
    ? (((Number(regularPrice) - Number(salePrice)) / Number(regularPrice)) * 100).toFixed(0)
    : null;

  // --- Image Handling ---
  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'Update Mart'); // Unsigned upload preset

        const response = await fetch('https://api.cloudinary.com/v1_1/uiflbakr/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images to Cloudinary. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  // --- Tags ---
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // --- Colors ---
  // Replaced with single Primary Color state in component

  // --- Variants ---
  const addVariant = () => setVariants([...variants, { name: 'Color', value: '', price: '', stock: '' }]);
  const updateVariant = (i: number, field: string, val: string) => {
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  };
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  const addWeightVariantsTemplate = () => {
    const existingValues = new Set(variants.map(v => v.value.toLowerCase()));
    const templates: ProductVariant[] = [
      { name: 'Weight', value: '250g', price: '', stock: '50' },
      { name: 'Weight', value: '500g', price: '', stock: '50' },
      { name: 'Weight', value: '1kg', price: '', stock: '30' },
    ];
    const newItems = templates.filter(t => !existingValues.has(t.value.toLowerCase()));
    setVariants([...variants, ...newItems]);
  };

  // --- Specs ---
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    setSpecs(specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));

  const addFoodSpecsTemplate = () => {
    const existingKeys = new Set(specs.map(s => s.key.trim().toLowerCase()));
    const templates: ProductSpec[] = [
      { key: 'উপকরণ (Ingredients)', value: '' },
      { key: 'পরিমাণ/ওজন (Net Weight)', value: '' },
      { key: 'সংরক্ষণ পদ্ধতি (Storage)', value: 'শুকনো ও ঠান্ডা স্থানে রাখুন' },
      { key: 'শেল্ফ লাইফ (Shelf Life)', value: '৬ মাস' },
      { key: 'প্যাকেজিং (Packaging)', value: 'ফুড-গ্রেড কাঁচের বোয়াম' },
      { key: 'অ্যালার্জেন (Allergens)', value: 'সরিষা থাকতে পারে' },
    ];
    const newItems = templates.filter(t => !existingKeys.has(t.key.toLowerCase()));
    setSpecs([...specs, ...newItems]);
  };

  // --- Save ---
  const handleSave = () => {
    if (!title || !regularPrice) {
      alert('Please fill in the product title and regular price.');
      return;
    }
    const effectivePrice = Number(salePrice) || Number(regularPrice);
    const productData: Product = {
      id: editProduct?.id || `p-${Date.now()}`,
      name: title,
      brand: brand || 'Generic',
      price: effectivePrice,
      buyingPrice: buyingPrice ? Number(buyingPrice) : undefined,
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      image: images[mainImageIndex] || images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      images: images.length ? images : undefined,
      rating: editProduct?.rating || 0,
      category: category || 'Uncategorized',
      isNew,
      isLive,
      stock: stock ? Number(stock) : undefined,
      primaryColor: primaryColorName ? { name: primaryColorName, hex: primaryColorHex } : undefined,
      variants: variants.filter(v => v.value),
      description: description || undefined,
      specs: specs.filter(s => s.key),
      materialsAndCare: materialsAndCare || undefined,
      shippingAndReturns: shippingAndReturns || undefined,
      warranty,
      deliveryType,
      isFreeDelivery,
      customDeliveryCharge: isFreeDelivery 
        ? 0 
        : (customDeliveryCharge.trim() !== '' ? Number(customDeliveryCharge) : null),
      videoUrl: videoUrl || undefined,
      tags: tags.length ? tags : undefined,
      metaTitle: metaTitle || undefined,
      metaDesc: metaDesc || undefined,
    };

    if (isEdit) {
      updateProduct(editProduct!.id, productData);
    } else {
      addProduct(productData);
    }
    onCancel();
  };

  const inputCls = 'w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white';

  return (
    <div className="w-full pb-24">

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 -mx-8 px-8 py-4 bg-slate-50/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button onClick={onCancel} className="text-slate-500 hover:text-primary-500 text-sm font-medium mb-1 transition-colors flex items-center">
            <ChevronRight className="rotate-180 mr-1" size={16} /> Back to Products
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEdit ? `Edit: ${editProduct!.name}` : 'Add New Product'}
          </h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={onCancel} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-medium text-white transition-all shadow-lg flex items-center justify-center gap-2 ${isUploading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'}`}
          >
            <Save size={18} /> {isUploading ? 'Uploading Images...' : (isEdit ? 'Save Changes' : 'Save Product')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">

        {/* === MAIN COLUMN === */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Basic Info */}
          <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg"><Info size={20} /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product Title *</label>
                <input type="text" placeholder="e.g. Obsidian Chronograph" value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Brand</label>
                    <span className="text-xs text-slate-400">Select or type</span>
                  </div>
                  <input
                    type="text"
                    list="brand-options-list"
                    placeholder="e.g. Nova"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className={inputCls}
                  />
                  <datalist id="brand-options-list">
                    {brands.filter(b => b.is_active).map(b => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <span className="text-xs text-slate-400">{categories.filter(c => c.is_active).length} available</span>
                  </div>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                    <option value="" disabled>Select category</option>
                    {categories.filter(c => c.is_active).map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {category && !categories.some(c => c.name.toLowerCase() === category.toLowerCase()) && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">New Arrival Badge</p>
                  <p className="text-xs text-slate-500">Show a &quot;New&quot; badge on the product card</p>
                </div>
                <button onClick={() => setIsNew(!isNew)} className={`w-12 h-6 rounded-full transition-colors relative ${isNew ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isNew ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags (Press Enter to add)</label>
                <div className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary-500">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                      <Tag size={12} className="text-primary-500" /> {tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </span>
                  ))}
                  <input type="text" placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="flex-1 bg-transparent border-none focus:outline-none px-2 py-1 text-slate-900 dark:text-white min-w-[120px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Media */}
          <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-lg"><ImageIcon size={20} /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Media & Gallery</h2>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors mb-6 ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'} ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-dark-900/50'}`}
            >
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mb-4">
                {isUploading ? (
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UploadCloud size={28} className="text-primary-500" />
                )}
              </div>
              <p className="font-medium text-slate-900 dark:text-white text-lg">{isUploading ? 'Uploading to Cloudinary...' : 'Click to Upload or Drag & Drop'}</p>
              <p className="text-slate-500 text-sm mt-1">PNG, JPG, WebP up to 5MB. Multiple files allowed.</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} disabled={isUploading} />
            </div>

            {images.length > 0 && (
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gallery ({images.length} images — click to set main)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 group transition-colors" style={{ borderColor: mainImageIndex === index ? 'rgb(99,102,241)' : 'transparent' }}>
                      {img.startsWith('data:') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={`img ${index}`} className="w-full h-full object-cover" />
                      ) : (
                        <Image src={img} alt={`img ${index}`} fill className="object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => setMainImageIndex(index)} className="p-1.5 bg-primary-500 text-white rounded-full shadow-sm" title="Set as main"><CheckCircle2 size={14} /></button>
                        <button onClick={() => { setImages(images.filter((_, i) => i !== index)); if (mainImageIndex >= images.length - 1) setMainImageIndex(0); }} className="p-1.5 bg-red-500 text-white rounded-full shadow-sm" title="Remove"><X size={14} /></button>
                      </div>
                      {mainImageIndex === index && (
                        <span className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">MAIN</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Video URL (Optional)</label>
              <input type="url" placeholder="https://youtube.com/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Section 3: Primary Color */}
          <div className="bg-white dark:bg-dark-800 p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="p-2 bg-pink-50 dark:bg-pink-500/10 text-pink-500 rounded-lg"><Palette size={20} /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Primary Color</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Select the specific color of this product. You can link different color variants together later in the Variant Map tab.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm">
                    <div className="w-full h-full" style={{ backgroundColor: primaryColorHex }} />
                  </div>
                  <input type="color" value={primaryColorHex} onChange={e => setPrimaryColorHex(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Pick color" />
                </div>
                <span className="text-xs text-slate-400 sm:hidden">Tap square to pick color</span>
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-medium text-slate-500">Color Name</label>
                <input type="text" placeholder="e.g. Space Grey" value={primaryColorName} onChange={e => setPrimaryColorName(e.target.value)} className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
              </div>
              <div className="w-full sm:w-32 space-y-1">
                <label className="block text-xs font-medium text-slate-500">HEX Code</label>
                <input type="text" placeholder="#000000" value={primaryColorHex} onChange={e => setPrimaryColorHex(e.target.value)} className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Section 4: Variants */}
          <div className="bg-white dark:bg-dark-800 p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-lg"><Layers size={20} /></div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Variants</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addWeightVariantsTemplate}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-800 text-xs font-medium flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/40 transition-colors"
                >
                  <Plus size={13} /> Weight Pack (250g, 500g, 1kg)
                </button>
                <button onClick={addVariant} className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1 bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-lg">
                  <Plus size={16} /> Add Variant
                </button>
              </div>
            </div>
            {variants.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6 bg-slate-50 dark:bg-dark-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">No variants added yet.</p>
            ) : (
              <div className="space-y-4">
                {variants.map((v, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <button onClick={() => removeVariant(i)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-sm"><X size={14} /></button>
                    <select value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} className="w-full sm:w-1/4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white">
                      <option>Color</option><option>Size</option><option>Material</option><option>Weight</option>
                    </select>
                    <input type="text" placeholder="Value (e.g. Black)" value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} className="w-full sm:w-1/4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                    <input type="number" placeholder="Price override" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-full sm:w-1/4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                    <input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} className="w-full sm:w-1/4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Description & Specs */}
          <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-lg"><FileText size={20} /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Description & Specifications</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product..." className={`${inputCls} resize-none`} />
              </div>
              <div>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Technical Specs (Key-Value)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addFoodSpecsTemplate}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 text-xs font-medium flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                    >
                      <Plus size={13} /> Food Specs Template
                    </button>
                    <button onClick={addSpec} className="text-primary-500 hover:text-primary-600 text-xs font-medium flex items-center gap-1"><Plus size={14} /> Add Row</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" placeholder="Key (e.g. Weight)" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} className="flex-1 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                      <input type="text" placeholder="Value (e.g. 120g)" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} className="flex-1 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                      <button onClick={() => removeSpec(i)} className="p-2 text-slate-400 hover:text-red-500"><X size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* === SIDEBAR COLUMN === */}
        <div className="space-y-6">

          {/* Pricing */}
          <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="p-2 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-lg"><DollarSign size={20} /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pricing & Inventory</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Buying Price / Cost (৳)</label>
                <input type="number" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Regular Price (৳) *</label>
                <input type="number" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sale Price (৳)</label>
                  {savings && <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">-{savings}%</span>}
                </div>
                <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stock Quantity</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className={inputCls} />
                {Number(stock) === 0 && stock !== '' && <p className="text-xs text-red-500 mt-2 font-medium">Will display &apos;Out of Stock&apos;</p>}
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><Settings size={20} /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publishing & Policies</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Visibility</p>
                  <p className="text-xs text-slate-500">{isLive ? 'Live on store' : 'Draft — hidden'}</p>
                </div>
                <button onClick={() => setIsLive(!isLive)} className={`w-12 h-6 rounded-full transition-colors relative ${isLive ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isLive ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Warranty Policy</label>
                <select value={warranty} onChange={e => setWarranty(e.target.value)} className={inputCls}>
                  <option>No Warranty</option>
                  <option>6 Months Warranty</option>
                  <option>1 Year Warranty</option>
                  <option>2 Year Warranty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Delivery Type</label>
                <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} className={inputCls}>
                  <option>Standard Delivery</option>
                  <option>Express Shipping</option>
                  <option>Digital Delivery</option>
                </select>
              </div>

              {/* Delivery Charge Management */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">Free Delivery</label>
                    <p className="text-[11px] text-slate-500">Provide ৳0 delivery fee for this product</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isFreeDelivery;
                      setIsFreeDelivery(next);
                      if (next) setCustomDeliveryCharge('');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isFreeDelivery ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isFreeDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {!isFreeDelivery && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Custom Delivery Charge (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Leave blank to use default courier rate"
                        value={customDeliveryCharge}
                        onChange={(e) => setCustomDeliveryCharge(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Overrides global courier fees during checkout for this item.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Additional Policies (Optional)</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Materials & Care</label>
                  <textarea rows={3} value={materialsAndCare} onChange={e => setMaterialsAndCare(e.target.value)} placeholder="Case: Titanium... Clean with dry cloth." className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Shipping & Returns</label>
                  <textarea rows={3} value={shippingAndReturns} onChange={e => setShippingAndReturns(e.target.value)} placeholder="Ships in 24 hrs. 30-day returns." className={`${inputCls} resize-none`} />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">SEO Meta Data</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Meta Title</label>
                  <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Meta Description</label>
                  <textarea rows={3} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
