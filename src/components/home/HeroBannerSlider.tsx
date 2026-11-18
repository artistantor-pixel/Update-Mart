'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import type { BannerSlide } from '@/store/homepageStore';

interface HeroStat {
  icon: 'users' | 'shield' | 'returns';
  value: string;
  label: string;
}

interface HeroBannerSliderProps {
  banners?: BannerSlide[];
  autoSlideInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  badgeText?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaLink?: string;
  discountBadgeTop?: string;
  discountBadgeMain?: string;
  discountBadgeBottom?: string;
  stats?: HeroStat[];
}

const DEFAULT_HERO_STATS: HeroStat[] = [
  { icon: 'users', value: '20K+', label: 'Happy Customers' },
  { icon: 'shield', value: '100%', label: 'Secure Payments' },
  { icon: 'returns', value: '7 Days', label: 'Easy Returns' },
];

export default function HeroBannerSlider({
  banners = [],
  autoSlideInterval = 5,
  showArrows = true,
  showDots = true,
  badgeText = 'LIMITED TIME OFFER',
  headlineLine1 = 'Shop More,',
  headlineLine2 = 'Save More',
  subtext = 'Explore top quality products at unbeatable prices with fast nationwide delivery.',
  ctaLabel = 'EXPLORE COLLECTION',
  ctaLink = '/products',
  discountBadgeTop = 'UP TO',
  discountBadgeMain = '50%',
  discountBadgeBottom = 'OFF',
  stats = DEFAULT_HERO_STATS,
}: HeroBannerSliderProps) {
  // Filter active banners and sort by order
  const activeBanners = (
    banners.length > 0
      ? [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [
          {
            id: 'default-1',
            imageUrl:
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
            title: 'Minimalist Flagship Essentials',
            linkUrl: '/products',
            isActive: true,
            order: 1,
          },
          {
            id: 'default-2',
            imageUrl:
              'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=85',
            title: 'Future Tech & Smart Peripherals',
            linkUrl: '/products?category=Electronics',
            isActive: true,
            order: 2,
          },
          {
            id: 'default-3',
            imageUrl:
              'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
            title: 'Luxury Timepieces & Watches',
            linkUrl: '/products?category=Watches',
            isActive: true,
            order: 3,
          },
        ]
  ).filter((b) => b.isActive !== false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto-play timer
  useEffect(() => {
    if (isHovered || activeBanners.length <= 1 || autoSlideInterval <= 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, autoSlideInterval * 1000);
    return () => clearInterval(interval);
  }, [isHovered, activeBanners.length, autoSlideInterval, nextSlide]);

  // Touch Swipe Handling for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const renderStatIcon = (icon: HeroStat['icon']) => {
    switch (icon) {
      case 'users':
        return <Users size={18} className="text-primary-500 dark:text-indigo-300" />;
      case 'shield':
        return <ShieldCheck size={18} className="text-primary-500 dark:text-indigo-300" />;
      case 'returns':
        return <RotateCcw size={18} className="text-primary-500 dark:text-indigo-300" />;
    }
  };

  if (activeBanners.length === 0) return null;

  const activeSlide = activeBanners[currentIndex] || activeBanners[0];

  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#eef0fb] via-[#f6f7fd] to-[#e0e4f9] dark:from-[#0f132e] dark:via-[#141a3e] dark:to-[#1b2250] transition-colors select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle Decorative Ambient Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-400/15 dark:bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-accent-500/15 dark:bg-accent-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Offer Copy, CTA & Trust Stats */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-5 sm:space-y-6">
            {/* Limited Time Offer Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 dark:bg-white/10 border border-primary-500/15 dark:border-white/10">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-primary-500 dark:text-indigo-200">
                {badgeText}
              </span>
            </div>

            {/* Bold Two-Line Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              <span className="block text-slate-900 dark:text-white">
                {headlineLine1}
              </span>
              <span className="block text-primary-500 dark:text-indigo-300 mt-1">
                {headlineLine2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
              {subtext}
            </p>

            {/* Primary CTA Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={ctaLink || activeSlide.linkUrl || '/products'}
                className="inline-flex items-center gap-2.5 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all group"
              >
                <span>{ctaLabel}</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <Link
                href="/products?filter=sale"
                className="inline-flex items-center gap-2 bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 text-primary-600 dark:text-white font-bold text-xs sm:text-sm px-5 py-3.5 sm:py-4 rounded-xl border border-primary-500/15 dark:border-white/15 transition-all"
              >
                <span>Flash Deals</span>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="w-full pt-4 sm:pt-6 border-t border-primary-500/10 dark:border-white/10">
              <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white dark:bg-white/10 border border-primary-500/15 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                      {renderStatIcon(stat.icon)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {stat.value}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase Slider + Floating Discount Badge */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Decorative Circular Backdrop */}
            <div className="relative w-full max-w-[540px] mx-auto">
              <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-primary-500/25 via-primary-400/15 to-accent-500/20 dark:from-primary-500/30 dark:via-indigo-500/15 dark:to-accent-500/15 blur-xl pointer-events-none" />

              {/* Main Slider Card */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-white dark:bg-dark-800 shadow-2xl shadow-primary-500/15 border-4 border-white/80 dark:border-white/10 group">
                {activeBanners.map((banner, index) => {
                  const isCurrent = index === currentIndex;
                  return (
                    <div
                      key={banner.id || index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isCurrent
                          ? 'opacity-100 z-10 pointer-events-auto'
                          : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <Link
                        href={banner.linkUrl || '/products'}
                        className="relative block w-full h-full"
                        aria-label={banner.title || `Banner ${index + 1}`}
                      >
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title || 'Featured Collection'}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover object-center"
                        />

                        {banner.mobileImageUrl && (
                          <div className="block sm:hidden absolute inset-0">
                            <Image
                              src={banner.mobileImageUrl}
                              alt={banner.title || 'Featured Collection'}
                              fill
                              priority={index === 0}
                              sizes="100vw"
                              className="object-cover object-center"
                            />
                          </div>
                        )}

                        {/* Subtle bottom caption gradient */}
                        {banner.title && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent p-4 sm:p-5 flex items-end justify-between">
                            <span className="text-white text-xs sm:text-sm font-bold drop-shadow-sm line-clamp-1">
                              {banner.title}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-300 shrink-0 ml-2">
                              Shop →
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}

                {/* Prev / Next Controls */}
                {showArrows && activeBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/85 dark:bg-dark-900/80 hover:bg-white text-slate-800 dark:text-white shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                      aria-label="Previous Banner"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/85 dark:bg-dark-900/80 hover:bg-white text-slate-800 dark:text-white shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                      aria-label="Next Banner"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Pagination Dots */}
                {showDots && activeBanners.length > 1 && (
                  <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/45 backdrop-blur-md">
                    {activeBanners.map((_, dotIndex) => {
                      const isSelected = dotIndex === currentIndex;
                      return (
                        <button
                          type="button"
                          key={dotIndex}
                          onClick={() => setCurrentIndex(dotIndex)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isSelected
                              ? 'w-5 bg-accent-500'
                              : 'w-1.5 bg-white/60 hover:bg-white'
                          }`}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Floating Circular Discount Badge (Top Right) */}
              <div className="absolute -top-4 -right-2 sm:-top-5 sm:-right-5 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 text-white shadow-xl shadow-primary-500/35 ring-4 ring-white dark:ring-dark-900 flex flex-col items-center justify-center text-center leading-none">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  {discountBadgeTop}
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight my-0.5">
                  {discountBadgeMain}
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                  {discountBadgeBottom}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
