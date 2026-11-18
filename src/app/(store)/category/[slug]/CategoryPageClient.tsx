'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
  Heart,
  ShoppingCart,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Clock,
  Zap,
  CheckCircle,
  LucideIcon,
  Layers,
} from 'lucide-react';
import type { Product } from '@/store/productStore';
import type { CategoryPageConfig } from '@/store/categoryPageStore';
import { useCartStore } from '@/store/cartStore';
import * as gtm from '@/lib/gtm';
import * as fpixel from '@/lib/fpixel';

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Clock,
  Zap,
  CheckCircle,
  Sparkles,
};

interface RelatedCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

interface CategoryPageClientProps {
  slug: string;
  categoryName: string;
  config: CategoryPageConfig;
  initialProducts: Product[];
  allCategories: RelatedCategory[];
}

function getStableReviewCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 380;
  }
  return 32 + Math.abs(hash);
}

export default function CategoryPageClient({
  slug,
  categoryName,
  config,
  initialProducts,
  allCategories,
}: CategoryPageClientProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState<string>(config.defaultSort || 'featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(() => {
    if (!initialProducts.length) return 50000;
    const max = Math.max(...initialProducts.map((p) => p.price));
    return max > 0 ? max : 50000;
  });

  // Interactive UI states
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistIds, setWishlistIds] = useState<Record<string, boolean>>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Calculate Brands present in this category
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.brand && p.brand.trim() !== '') {
        brandSet.add(p.brand.trim());
      }
    });
    return Array.from(brandSet).sort();
  }, [initialProducts]);

  // Max price among products
  const maxProductPrice = useMemo(() => {
    if (!initialProducts.length) return 50000;
    const max = Math.max(...initialProducts.map((p) => p.price));
    return max > 0 ? max : 50000;
  }, [initialProducts]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts].filter((p) => p.isLive !== false);

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Price filter
    if (config.showPriceFilter) {
      result = result.filter((p) => p.price <= priceMax);
    }

    // In Stock Only
    if (inStockOnly) {
      result = result.filter((p) => (p.stock === undefined ? true : p.stock > 0));
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'featured':
      default:
        // Keep initial server order
        break;
    }

    return result;
  }, [initialProducts, searchQuery, selectedBrand, sortBy, priceMax, inStockOnly, config.showPriceFilter]);

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant =
      product.variants && product.variants.length > 0 ? product.variants[0].value : 'Standard';

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      variant: defaultVariant,
      isFreeDelivery: product.isFreeDelivery,
      customDeliveryCharge: product.customDeliveryCharge,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);

    fpixel.event('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'BDT',
    });

    gtm.trackAddToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || categoryName,
        brand: product.brand || 'Update Mart',
      },
      1,
      defaultVariant
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setPriceMax(maxProductPrice);
    setInStockOnly(false);
    setSortBy(config.defaultSort || 'featured');
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedBrand !== 'All' ||
    priceMax < maxProductPrice ||
    inStockOnly;

  // Other categories for footer strip
  const otherCategories = allCategories.filter((c) => c.slug !== slug && c.slug !== 'all');

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-dark-900 transition-colors">
      {/* 1. Category Hero Banner */}
      <section className="relative w-full overflow-hidden bg-slate-900 text-white">
        {/* Banner Background Image */}
        <div className="absolute inset-0">
          <Image
            src={config.bannerImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85'}
            alt={config.headline || categoryName}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Configurable Overlay Gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70"
            style={{ opacity: (config.bannerOverlayOpacity || 65) / 100 }}
          />
          {/* Subtle Ambient Primary Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-white/70 mb-5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={13} className="text-white/40" />
            <Link href="/products" className="hover:text-white transition-colors">
              Categories
            </Link>
            <ChevronRight size={13} className="text-white/40" />
            <span className="text-amber-400 font-semibold">{categoryName}</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            {/* Tagline Pill */}
            {config.tagline && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                <span>{config.tagline}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {config.headline || categoryName}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {config.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <strong className="text-white font-bold">{initialProducts.length}</strong> Products Available
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-400" />
                100% Genuine Guaranteed
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:inline" />
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <Truck size={15} className="text-amber-400" />
                Fast Nationwide Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Highlights / Trust Badges Bar */}
      {config.highlights && config.highlights.length > 0 && (
        <section className="border-b border-slate-200/80 dark:border-white/5 bg-white dark:bg-dark-800 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-white/10">
              {config.highlights.map((h, idx) => {
                const Icon = ICON_MAP[h.icon] || ShieldCheck;
                return (
                  <div
                    key={h.id || idx}
                    className={`flex items-center gap-3.5 pt-3 sm:pt-0 ${
                      idx > 0 ? 'sm:pl-6' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-400/15 text-primary-500 dark:text-indigo-300 flex items-center justify-center shrink-0">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {h.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {h.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Main Catalog Section (Filters + Product Grid) */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar: Search + Brands + Sort */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 mb-8 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Within Category */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${categoryName}...`}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Right Side: Sort dropdown & mobile filter toggle */}
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-dark-900"
                >
                  <Filter size={14} />
                  <span>Filters</span>
                  {isFiltered && (
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Brand Filter Pills (Desktop & Expanded Mobile) */}
            {config.showBrandFilter && availableBrands.length > 0 && (
              <div
                className={`${
                  isMobileFiltersOpen ? 'block' : 'hidden lg:block'
                } pt-3 border-t border-slate-100 dark:border-white/5`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Brands:
                  </span>
                  <button
                    onClick={() => setSelectedBrand('All')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedBrand === 'All'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700'
                    }`}
                  >
                    All Brands
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedBrand === brand
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Pill Bar */}
            {isFiltered && (
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-white">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-700">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery('')}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedBrand !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-700">
                    Brand: {selectedBrand}
                    <button onClick={() => setSelectedBrand('All')}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetAllFilters}
                  className="text-rose-500 hover:text-rose-600 font-bold ml-1 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Product Grid Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'item' : 'items'} in {categoryName}
            </p>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
              {filteredProducts.map((product, idx) => {
                const isAdded = Boolean(addedIds[product.id]);
                const isWishlisted = Boolean(wishlistIds[product.id]);
                const ratingValue = Math.min(5, Math.max(1, Math.round(product.rating || 5)));
                const reviewCount = getStableReviewCount(product.id);
                const discountPct =
                  product.regularPrice && product.regularPrice > product.price
                    ? Math.round(
                        ((product.regularPrice - product.price) / product.regularPrice) * 100
                      )
                    : null;

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-primary-500/30 dark:hover:border-primary-400/30 transition-all duration-300 overflow-hidden"
                  >
                    {/* Product Image Area */}
                    <Link
                      href={`/product/${product.id}`}
                      className="relative block m-2 sm:m-2.5 aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-900"
                    >
                      <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        priority={idx < 4}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Discount Badge */}
                      {(discountPct || product.isNew) && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          {discountPct ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-accent-500 text-white text-[10px] sm:text-[11px] font-extrabold tracking-tight shadow-sm">
                              -{discountPct}%
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-primary-500 text-white text-[10px] sm:text-[11px] font-extrabold tracking-tight shadow-sm">
                              NEW
                            </span>
                          )}
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(e, product.id)}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-sm ${
                          isWishlisted
                            ? 'bg-rose-500 text-white border-rose-500 scale-105'
                            : 'bg-white/90 dark:bg-dark-800/85 text-primary-500 dark:text-slate-300 border-slate-200/70 dark:border-white/10 hover:text-rose-500'
                        }`}
                      >
                        <Heart
                          size={15}
                          className={isWishlisted ? 'fill-current' : ''}
                        />
                      </button>
                    </Link>

                    {/* Details & Cart Action */}
                    <div className="flex flex-col flex-1 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
                      {/* Brand Micro-tag */}
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate mb-1">
                        {product.brand || categoryName}
                      </span>

                      {/* Title */}
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-indigo-300 transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>

                      {/* Price Row */}
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {product.regularPrice && product.regularPrice > product.price && (
                          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 line-through">
                            ৳{product.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mt-1.5 flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, starIdx) => (
                            <Star
                              key={starIdx}
                              size={12}
                              className={
                                starIdx < ratingValue
                                  ? 'text-accent-500 fill-accent-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          ({reviewCount})
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <div className="mt-auto pt-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                            isAdded
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-primary-500 text-slate-800 hover:text-white dark:bg-dark-700 dark:text-slate-100 dark:hover:bg-primary-500'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={14} />
                              <span>Added</span>
                            </>
                          ) : (
                            <span>Add to Cart</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          aria-label={`Quick add ${product.name} to cart`}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-primary-500 text-slate-700 hover:text-white dark:bg-dark-700 dark:text-slate-200 dark:hover:bg-primary-500'
                          }`}
                        >
                          {isAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/10 p-8">
              <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                No products found matching your filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Try clearing your search query or brand filters to view all products in {categoryName}.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Explore Other Categories Bottom Strip */}
      {otherCategories.length > 0 && (
        <section className="py-12 bg-white dark:bg-dark-800 border-t border-slate-200/80 dark:border-white/5 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Explore Other Collections
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Discover more curated essentials across our departments
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {otherCategories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-700 transition-all"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-primary-500/10 border-2 border-transparent group-hover:border-primary-500/40 shadow-sm transition-all mb-2 flex items-center justify-center">
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <Layers size={24} className="text-primary-500" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-500 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
