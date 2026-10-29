import React from 'react';
import { Leaf, Award } from 'lucide-react';

/**
 * Boyam Hero Banner — a warm, immersive, minimalist header banner
 * with artisanal brand identity, tagline, and story for the dedicated
 * Boyam sales landing page.
 */
export default function BoyamHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F6EFE6] via-[#FAF8F5] to-[#FAF8F5] dark:from-[#1A1613] dark:via-[#141110] dark:to-[#141110]">
      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#C57E3A]/[0.06] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#5F6B48]/[0.06] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center py-16 sm:py-20 lg:py-24">
          {/* Artisanal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9C5B23]/10 dark:bg-[#9C5B23]/15 border border-[#9C5B23]/20 mb-6">
            <Leaf className="w-3.5 h-3.5 text-[#5F6B48]" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[#9C5B23] dark:text-[#D98F4C]">
              ঐতিহ্যবাহী স্বাদ · Artisanal Heritage
            </span>
            <Award className="w-3.5 h-3.5 text-[#9C5B23]" />
          </div>

          {/* Brand Name */}
          <h1 className="font-serif">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#2C231B] dark:text-[#F5EDE4] tracking-tighter leading-none">
              বোয়াম
            </span>
            <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl font-light text-[#9C5B23] dark:text-[#D98F4C] tracking-wide">
              Boyam
            </span>
          </h1>

          {/* Tagline */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-[#6B5E52] dark:text-[#B5A899] max-w-xl leading-relaxed font-light">
            মায়ের হাতের চিরচেনা রেসিপি, প্রকৃতির শুদ্ধতা, আর বাংলার ঐতিহ্যবাহী স্বাদ
            — এক বোয়ামে সব কিছু।
          </p>

          {/* Sub-tagline */}
          <p className="mt-3 text-xs sm:text-sm text-[#9C8E80] dark:text-[#897B6D] tracking-wide font-medium uppercase">
            ১০০% ঘরে তৈরি · কোনো প্রিজারভেটিভ নেই · ছোট ব্যাচে ধীরে রান্না
          </p>

          {/* Scroll indicator */}
          <div className="mt-10 flex flex-col items-center gap-2 opacity-50">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9C8E80]">নিচে স্ক্রল করুন</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#C57E3A]/50 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

