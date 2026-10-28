'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Zap } from 'lucide-react';
import MinimalProductCard from './MinimalProductCard';
import type { Product } from '@/store/productStore';

interface CuratedProductRowProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  badge?: string;
  badgeType?: 'trending' | 'sale' | 'new';
  products: Product[];
}

export default function CuratedProductRow({
  title,
  subtitle,
  viewAllLink = '/products',
  badge,
  badgeType = 'trending',
  products,
}: CuratedProductRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-white/5 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200">
                {badgeType === 'sale' && <Flame size={13} className="text-rose-500 fill-rose-500" />}
                {badgeType === 'trending' && <Zap size={13} className="text-amber-500 fill-amber-500" />}
                {badgeType === 'new' && <Sparkles size={13} className="text-primary-500" />}
                <span>{badge}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Controls: View All & Desktop Arrows */}
          <div className="flex items-center gap-4">
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            {/* Desktop Carousel Controls */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-white/10">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid / Touch Carousel */}
        {/* On Mobile: Smooth snap touch slider. On Desktop: Clean CSS Grid */}
        <div
          ref={rowRef}
          className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory pb-4 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="snap-start flex-shrink-0 w-[240px] sm:w-[270px] lg:w-auto"
            >
              <MinimalProductCard product={product} priority={idx < 2} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

