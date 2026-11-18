"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/common/ProductCard';
import { Filter, X, ChevronDown, Check, Search, Layers, Tag } from 'lucide-react';

import { useProductStore } from '@/store/productStore';
import { useBrandCategoryStore } from '@/store/brandCategoryStore';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest Arrivals', value: 'newest' }
];

function ProductsContent() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const { categories, fetchCategories } = useBrandCategoryStore();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  const categoryParam = searchParams?.get('category') || '';
  const brandParam = searchParams?.get('brand') || '';
  const filterParam = searchParams?.get('filter') || '';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState(100000);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    document.title = 'Shop Products | Update Mart';
    window.scrollTo(0, 0);
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Sync with URL query parameters
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    if (filterParam === 'new') {
      setSortBy('newest');
    }
  }, [categoryParam, brandParam, filterParam]);

  // Dynamic categories list (from categories table + products)
  const dynamicCategories = useMemo(() => {
    const list = ['All'];
    const seen = new Set<string>();

    // 1. From database categories
    categories.filter((c) => c.is_active).forEach((c) => {
      const lower = c.name.toLowerCase().trim();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(c.name);
      }
    });

    // 2. From actual products
    products.forEach((p) => {
      if (p.category) {
        const lower = p.category.toLowerCase().trim();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(p.category.trim());
        }
      }
    });

    return list;
  }, [categories, products]);

  // Dynamic brands list (from actual products)
  const dynamicBrands = useMemo(() => {
    const list = ['All'];
    const seen = new Set<string>();

    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        const lower = p.brand.toLowerCase().trim();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(p.brand.trim());
        }
      }
    });

    return list;
  }, [products]);

  // Calculate highest product price for slider max
  const maxAvailablePrice = useMemo(() => {
    if (!products.length) return 50000;
    const max = Math.max(...products.map((p) => p.price));
    return max > 0 ? Math.ceil(max / 1000) * 1000 : 50000;
  }, [products]);

  // Adjust price range slider default if products load
  useEffect(() => {
    if (maxAvailablePrice > 0) {
      setPriceRange((prev) => (prev === 100000 ? maxAvailablePrice : prev));
    }
  }, [maxAvailablePrice]);

  // Product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.filter((p) => p.isLive !== false).length };
    products.forEach((p) => {
      if (p.category && p.isLive !== false) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    // Only show live/published products
    let result = [...products].filter((p) => p.isLive !== false);

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    if (selectedBrand !== 'All') {
      result = result.filter(
        (p) => p.brand?.toLowerCase().trim() === selectedBrand.toLowerCase().trim()
      );
    }

    if (filterParam === 'sale') {
      result = result.filter((p) => Boolean(p.regularPrice && p.regularPrice > p.price));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price <= priceRange);

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      default: // featured
        break;
    }

    return result;
  }, [selectedCategory, selectedBrand, filterParam, priceRange, sortBy, searchQuery, products]);

  // Sidebar Filter Content (Reusable for Mobile & Desktop)
  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Dynamic Category Filter */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Layers size={16} className="text-primary-500" />
          <span>Categories</span>
        </h3>
        <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar pr-1">
          {dynamicCategories.map((category) => {
            const count = categoryCounts[category] ?? 0;
            const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
            return (
              <label
                key={category}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-primary-500'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <input
                    type="radio"
                    name="category"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setSelectedCategory(category)}
                  />
                  <span
                    className={`text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'text-primary-600 dark:text-indigo-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-medium'
                    }`}
                  >
                    {category}
                  </span>
                </div>
                {count > 0 && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400">
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Dynamic Brand Filter */}
      {dynamicBrands.length > 1 && (
        <div className="pt-6 border-t border-slate-200/80 dark:border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag size={16} className="text-primary-500" />
            <span>Brands</span>
          </h3>
          <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1">
            {dynamicBrands.map((brand) => {
              const isSelected = selectedBrand.toLowerCase() === brand.toLowerCase();
              return (
                <label
                  key={brand}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 cursor-pointer group transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-primary-500'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <input
                    type="radio"
                    name="brand"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setSelectedBrand(brand)}
                  />
                  <span
                    className={`text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'text-primary-600 dark:text-indigo-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-medium'
                    }`}
                  >
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Price Range Filter */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Max Price
          </h3>
          <span className="text-xs font-bold text-primary-500 font-mono">
            ৳{priceRange.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={maxAvailablePrice}
          step="250"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5">
          <span>৳0</span>
          <span>৳{maxAvailablePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => {
          setSelectedCategory('All');
          setSelectedBrand('All');
          setPriceRange(maxAvailablePrice);
          setSortBy('featured');
        }}
        className="w-full py-2.5 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : selectedCategory !== 'All'
            ? `${selectedCategory} Collection`
            : 'Shop All Products'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {searchQuery
            ? `Showing ${filteredProducts.length} items matching your search.`
            : `Showing ${filteredProducts.length} curated products with nationwide delivery.`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 pr-6 border-r border-slate-200 dark:border-white/10 h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar (Mobile Toggle & Sorting) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
            <button
              className="lg:hidden flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter size={16} />
              <span>Filters</span>
              {(selectedCategory !== 'All' || selectedBrand !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>

            <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm hidden lg:block font-medium">
              Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> {filteredProducts.length !== 1 ? 'items' : 'item'}
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer font-bold"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm"
                >
                  <div className="relative aspect-square bg-slate-100 dark:bg-dark-700/60 animate-pulse" />
                  <div className="flex flex-col flex-grow p-4 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded-md w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 dark:bg-dark-700/50 rounded-md w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} {...product} priority={idx < 4} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/10 p-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                No items match your selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setPriceRange(maxAvailablePrice);
                }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative w-full max-w-xs h-full bg-white dark:bg-dark-900 p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 mb-4" />
          <p className="text-slate-500 font-medium">Loading products...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
