"use client";

import React, { useState, useMemo } from 'react';
import type { Product } from '@/store/productStore';
import BoyamHero from '@/components/boyam/BoyamHero';
import BoyamCategoryFilter from '@/components/boyam/BoyamCategoryFilter';
import BoyamProductCard from '@/components/boyam/BoyamProductCard';
import BoyamTrustBanner from '@/components/boyam/BoyamTrustBanner';
import { Package } from 'lucide-react';

interface BoyamPageClientProps {
  products: Product[];
}

/**
 * Client-side Boyam landing page — handles category filtering,
 * product grid rendering, and interactive add-to-cart.
 */
export default function BoyamPageClient({ products }: BoyamPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(
      (p) => (p.category || '').toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0E0C0A]">
      {/* Hero Banner */}
      <BoyamHero />

      {/* Sticky Category Filter */}
      <BoyamCategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Product Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#2C231B] dark:text-[#F5EDE4] tracking-tight">
              {activeCategory === 'all'
                ? 'সকল বোয়াম পণ্য'
                : `${activeCategory}`}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#9C8E80] dark:text-[#897B6D]">
              {filteredProducts.length}টি পণ্য পাওয়া গেছে
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filteredProducts.map((product, index) => (
              <BoyamProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#9C5B23]/10 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-[#9C5B23]" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2C231B] dark:text-[#F5EDE4] mb-2">
              এই ক্যাটাগরিতে পণ্য নেই
            </h3>
            <p className="text-sm text-[#9C8E80] dark:text-[#897B6D] max-w-xs">
              অন্য ক্যাটাগরি নির্বাচন করুন বা &quot;সকল পণ্য&quot; দেখুন।
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-4 px-5 py-2 rounded-full text-sm font-medium bg-[#9C5B23] text-white hover:bg-[#834919] transition-colors"
            >
              সকল পণ্য দেখুন
            </button>
          </div>
        )}
      </section>

      {/* Trust & Authenticity Banner */}
      <BoyamTrustBanner />
    </div>
  );
}

