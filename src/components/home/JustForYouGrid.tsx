'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import MinimalProductCard from './MinimalProductCard';
import type { Product } from '@/store/productStore';

interface JustForYouGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function JustForYouGrid({
  products,
  title = 'Just For You',
  subtitle = 'Curated recommendations matched to your browsing taste and popular trends.',
}: JustForYouGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-dark-900/50 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold">
            <Sparkles size={13} />
            <span>Personalized Picks</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 2 columns on mobile, 3 on tablet, 4 on small desktop, 5 on wide desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
          {products.map((product) => (
            <MinimalProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-900 dark:text-white font-semibold text-sm border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

