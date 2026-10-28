'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, FolderTree, Watch, Laptop, ShoppingBag, Home, Shirt, Smartphone, Layers } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

interface CategoryPillNavProps {
  categories: CategoryItem[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
}

// Icon helper for common category names
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('watch')) return <Watch size={16} />;
  if (lower.includes('electronic') || lower.includes('gadget')) return <Laptop size={16} />;
  if (lower.includes('access') || lower.includes('phone')) return <Smartphone size={16} />;
  if (lower.includes('bag')) return <ShoppingBag size={16} />;
  if (lower.includes('home')) return <Home size={16} />;
  if (lower.includes('fashion') || lower.includes('cloth')) return <Shirt size={16} />;
  return <Layers size={16} />;
};

export default function CategoryPillNav({
  categories,
  activeSlug = 'all',
  onSelectCategory,
}: CategoryPillNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const allItems: CategoryItem[] = [
    { id: 'cat-all', name: 'All Collections', slug: 'all', image_url: null },
    ...categories.filter((c) => c.slug !== 'all'),
  ];

  return (
    <section className="py-8 bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-white/5 transition-colors sticky top-16 sm:top-20 z-30 backdrop-blur-md bg-white/90 dark:bg-dark-900/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-3 z-10 p-2 rounded-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 shadow-md text-slate-700 dark:text-slate-300 hover:text-primary-500 hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Horizontally Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 w-full"
          >
            {allItems.map((cat) => {
              const isActive = activeSlug === cat.slug;
              return onSelectCategory ? (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`snap-start flex-shrink-0 inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.image_url ? (
                    <div className="relative h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className={isActive ? 'text-primary-400 dark:text-primary-600' : 'text-slate-400'}>
                      {getCategoryIcon(cat.name)}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              ) : (
                <Link
                  key={cat.id}
                  href={cat.slug === 'all' ? '/products' : `/products?category=${encodeURIComponent(cat.name)}`}
                  className={`snap-start flex-shrink-0 inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.image_url ? (
                    <div className="relative h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className={isActive ? 'text-primary-400 dark:text-primary-600' : 'text-slate-400'}>
                      {getCategoryIcon(cat.name)}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{cat.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-3 z-10 p-2 rounded-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 shadow-md text-slate-700 dark:text-slate-300 hover:text-primary-500 hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

