"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BoyamCategoryItem } from '@/store/boyamStore';

const DEFAULT_CATEGORIES: BoyamCategoryItem[] = [
  { id: 'all', label: 'সকল পণ্য', labelEn: 'All' },
  { id: 'Pickles', label: 'আচার', labelEn: 'Pickles' },
  { id: 'Honey', label: 'মধু', labelEn: 'Honey' },
  { id: 'Ghee', label: 'ঘি', labelEn: 'Ghee' },
  { id: 'Oils', label: 'তেল', labelEn: 'Oils' },
  { id: 'Snacks', label: 'নাস্তা', labelEn: 'Snacks' },
];

interface BoyamCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: BoyamCategoryItem[];
}

export default function BoyamCategoryFilter({
  activeCategory,
  onCategoryChange,
  categories = DEFAULT_CATEGORIES,
}: BoyamCategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const activeCategoriesList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -180 : 180, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-[88px] sm:top-[96px] z-30 bg-[#FAF8F5]/95 dark:bg-[#141110]/95 backdrop-blur-xl border-b border-[#ECE5DD] dark:border-[#2A221C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-3">
        {/* Left Fade & Arrow */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1F1A16] border border-[#DDD5CB] dark:border-[#3A2F26] shadow-md flex items-center justify-center text-[#6B5E52] hover:text-[#9C5B23] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Pills */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeCategoriesList.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`
                  flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium
                  whitespace-nowrap transition-all duration-200 ease-out
                  ${
                    isActive
                      ? 'bg-[#9C5B23] text-white shadow-md shadow-[#9C5B23]/20 scale-[1.02]'
                      : 'bg-white dark:bg-[#1F1A16] text-[#6B5E52] dark:text-[#BFB1A0] border border-[#E6DFD4] dark:border-[#2F261E] hover:border-[#C57E3A]/50 hover:text-[#9C5B23]'
                  }
                `}
              >
                <span className="block sm:hidden">{cat.label}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                {cat.labelEn && (
                  <span className="hidden sm:inline text-[10px] ml-1 opacity-60">({cat.labelEn})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fade & Arrow */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1F1A16] border border-[#DDD5CB] dark:border-[#3A2F26] shadow-md flex items-center justify-center text-[#6B5E52] hover:text-[#9C5B23] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
