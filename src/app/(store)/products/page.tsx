"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/common/ProductCard';
import { Filter, X, ChevronDown, Check, Search } from 'lucide-react';

import { useProductStore } from '@/store/productStore';

const CATEGORIES = ['All', 'Watches', 'Electronics', 'Bags', 'Accessories', 'Smart Home'];
const BRANDS = ['All', 'Obsidian', 'Nova', 'Aero', 'Vanguard', 'Luna', 'Craft'];
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest Arrivals', value: 'newest' }
];

function ProductsContent() {
  const { products } = useProductStore();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState(100000); // Max price
  const [sortBy, setSortBy] = useState('featured');
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';

  useEffect(() => {
    document.title = 'Shop Products | Update Mart';
    window.scrollTo(0, 0);
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    result = result.filter(p => p.price <= priceRange);

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
  }, [selectedCategory, selectedBrand, priceRange, sortBy, searchQuery, products]);

  // Sidebar Filter Content (Reusable for Mobile & Desktop)
  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedCategory === category ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-primary-500'}`}>
                {selectedCategory === category && <Check size={14} className="text-white" />}
              </div>
              <input 
                type="radio" 
                name="category" 
                className="hidden" 
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
              />
              <span className={`text-sm transition-colors ${selectedCategory === category ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Brand</h3>
        <div className="space-y-2">
          {BRANDS.map(brand => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedBrand === brand ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-primary-500'}`}>
                {selectedBrand === brand && <Check size={14} className="text-white" />}
              </div>
              <input 
                type="radio" 
                name="brand" 
                className="hidden" 
                checked={selectedBrand === brand}
                onChange={() => setSelectedBrand(brand)}
              />
              <span className={`text-sm transition-colors ${selectedBrand === brand ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Price</h3>
          <span className="text-sm font-medium text-primary-500">Up to ৳{priceRange}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100000" 
          step="1000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>৳0</span>
          <span>৳100,000</span>
        </div>
      </div>
      
      {/* Reset Filters */}
      <button 
        onClick={() => {
          setSelectedCategory('All');
          setSelectedBrand('All');
          setPriceRange(100000);
        }}
        className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8 text-center md:text-left">
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop All Products'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {searchQuery ? `Showing ${filteredProducts.length} items matching your search.` : "Find what you're looking for with our curated selection of premium gear."}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-32 pr-8 border-r border-slate-200 dark:border-white/10 h-[calc(100vh-8rem)] overflow-y-auto">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          
          {/* Top Bar (Mobile Toggle & Sorting) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
            
            <button 
              className="lg:hidden flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter size={18} />
              Filters
            </button>
            
            <span className="text-slate-500 dark:text-slate-400 text-sm hidden lg:block">
              Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
            </span>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No products found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Try adjusting your filters or price range to find what you're looking for.
              </p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSelectedBrand('All'); setPriceRange(300); }}
                className="mt-6 text-primary-500 font-medium hover:text-primary-600 transition-colors"
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
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
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading products...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
