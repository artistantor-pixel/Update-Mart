'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BannerSlide } from '@/store/homepageStore';

interface HeroBannerSliderProps {
  banners?: BannerSlide[];
  autoSlideInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export default function HeroBannerSlider({
  banners = [],
  autoSlideInterval = 5,
  showArrows = true,
  showDots = true,
}: HeroBannerSliderProps) {
  // Filter active banners and sort by order
  const activeBanners = (banners.length > 0 ? banners : [
    {
      id: 'default-1',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85',
      title: 'Minimalist Flagship Essentials',
      linkUrl: '/products',
      isActive: true,
      order: 1,
    },
    {
      id: 'default-2',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=85',
      title: 'Future Tech & Smart Peripherals',
      linkUrl: '/products?category=Electronics',
      isActive: true,
      order: 2,
    },
    {
      id: 'default-3',
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=85',
      title: 'Luxury Timepieces & Watches',
      linkUrl: '/products?category=Watches',
      isActive: true,
      order: 3,
    },
  ]).filter((b) => b.isActive !== false);

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
      // Swiped Left -> Next
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (activeBanners.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container: Aspect ratio responsive (16:9 on mobile, 21:9 or fixed height on desktop) */}
      <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] lg:h-[480px] xl:h-[540px]">
        {activeBanners.map((banner, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Link
                href={banner.linkUrl || '/products'}
                className="relative block w-full h-full cursor-pointer"
                aria-label={banner.title || `Banner ${index + 1}`}
              >
                {/* Desktop Image */}
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || 'Promotional Banner'}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />

                {/* Optional Mobile Image Override */}
                {banner.mobileImageUrl && (
                  <div className="block sm:hidden absolute inset-0">
                    <Image
                      src={banner.mobileImageUrl}
                      alt={banner.title || 'Promotional Banner'}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>
                )}
              </Link>
            </div>
          );
        })}

        {/* Previous Button */}
        {showArrows && activeBanners.length > 1 && (
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
            aria-label="Previous Banner"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Next Button */}
        {showArrows && activeBanners.length > 1 && (
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
            aria-label="Next Banner"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Pagination Dots */}
        {showDots && activeBanners.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {activeBanners.map((_, dotIndex) => {
              const isSelected = dotIndex === currentIndex;
              return (
                <button
                  key={dotIndex}
                  onClick={() => setCurrentIndex(dotIndex)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isSelected ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

