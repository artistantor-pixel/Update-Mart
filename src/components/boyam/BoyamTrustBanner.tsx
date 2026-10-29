import React from 'react';
import {
  ShieldCheck,
  Leaf,
  FlaskConical,
  HeartHandshake,
  Award,
  Sparkles,
  CheckCircle,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import type { BoyamTrustItem } from '@/store/boyamStore';

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Leaf,
  FlaskConical,
  HeartHandshake,
  Award,
  Sparkles,
  CheckCircle,
  Truck,
};

const DEFAULT_TRUST_ITEMS: BoyamTrustItem[] = [
  {
    id: 't-1',
    icon: 'ShieldCheck',
    title: '১০০% ঘরে তৈরি',
    titleEn: 'Homemade',
    desc: 'প্রতিটি পণ্য ঘরোয়া পরিবেশে পরিচ্ছন্নভাবে প্রস্তুত — কারখানায় নয়।',
  },
  {
    id: 't-2',
    icon: 'Leaf',
    title: 'সম্পূর্ণ প্রাকৃতিক',
    titleEn: 'Organic',
    desc: 'সরাসরি কৃষকের কাছ থেকে সংগৃহীত খাঁটি উপাদান ও কাঠের ঘানির সরিষার তেল।',
  },
  {
    id: 't-3',
    icon: 'FlaskConical',
    title: 'প্রিজারভেটিভ মুক্ত',
    titleEn: 'Preservative-Free',
    desc: 'কোনো কৃত্রিম রঙ, ক্ষতিকর রাসায়নিক বা প্রিজারভেটিভ ব্যবহার করা হয় না।',
  },
  {
    id: 't-4',
    icon: 'HeartHandshake',
    title: 'ছোট ব্যাচে রান্না',
    titleEn: 'Small-Batch',
    desc: 'মানের সাথে আপোষহীন — প্রতিটি বোয়াম পরম যত্ন ও ভালোবাসায় প্রস্তুত।',
  },
];

interface BoyamTrustBannerProps {
  items?: BoyamTrustItem[];
}

/**
 * Trust & Authenticity Banner — a beautifully typography-driven section
 * reinforcing the Boyam brand promise at the bottom of the landing page.
 */
export default function BoyamTrustBanner({ items = DEFAULT_TRUST_ITEMS }: BoyamTrustBannerProps) {
  const activeItems = items && items.length > 0 ? items : DEFAULT_TRUST_ITEMS;

  return (
    <section className="relative bg-gradient-to-b from-[#FAF8F5] to-[#F2EBE1] dark:from-[#141110] dark:to-[#1A1613]">
      {/* Accent Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-16 h-px bg-[#C57E3A]/40 mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#9C5B23] dark:text-[#D98F4C] font-semibold mb-3">
            বোয়ামের প্রতিশ্রুতি
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2C231B] dark:text-[#F5EDE4] tracking-tight leading-tight">
            আমাদের বিশ্বাসযোগ্যতা, <br className="hidden sm:block" />
            আপনার ভরসা
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base text-[#7A6F64] dark:text-[#A89888] leading-relaxed font-light">
            প্রতিটি বোয়ামের পেছনে আছে আমাদের পারিবারিক ঐতিহ্য, বিশুদ্ধতার অঙ্গীকার, আর মাটির সাথে গভীর সংযোগ।
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {activeItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || ShieldCheck;
            return (
              <div
                key={item.id || item.titleEn}
                className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-[#1F1A16]/70 backdrop-blur-sm border border-[#ECE5DD] dark:border-[#2A221C] hover:border-[#C57E3A]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#C57E3A]/5"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-[#9C5B23]/10 dark:bg-[#9C5B23]/15 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-[#9C5B23] dark:text-[#D98F4C]" />
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C231B] dark:text-[#F5EDE4] mb-1.5 tracking-tight">
                  {item.title}
                </h3>
                {item.titleEn && (
                  <span className="text-[10px] uppercase tracking-widest text-[#A6976F] dark:text-[#776A5A] font-medium mb-3">
                    {item.titleEn}
                  </span>
                )}

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#7A6F64] dark:text-[#A89888] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Tagline */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-xs text-[#A6976F] dark:text-[#776A5A] tracking-wide uppercase">
            বোয়াম — ঐতিহ্যবাহী স্বাদ, আধুনিক যত্নে
          </p>
        </div>
      </div>
    </section>
  );
}
