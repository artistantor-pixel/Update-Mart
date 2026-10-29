import React from 'react';
import { ShieldCheck, Leaf, FlaskConical, HeartHandshake } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: '১০০% ঘরে তৈরি',
    titleEn: 'Homemade',
    desc: 'প্রতিটি পণ্য ঘরোয়া পরিবেশে হাতে তৈরি — কারখানায় নয়।',
  },
  {
    icon: Leaf,
    title: 'সম্পূর্ণ প্রাকৃতিক',
    titleEn: 'Organic',
    desc: 'সরাসরি কৃষকের কাছ থেকে সংগৃহীত বিশুদ্ধ কাঁচামাল ব্যবহৃত।',
  },
  {
    icon: FlaskConical,
    title: 'প্রিজারভেটিভ মুক্ত',
    titleEn: 'Preservative-Free',
    desc: 'কোনো কৃত্রিম রঙ, রাসায়নিক বা প্রিজারভেটিভ যোগ করা হয় না।',
  },
  {
    icon: HeartHandshake,
    title: 'ছোট ব্যাচে রান্না',
    titleEn: 'Small-Batch',
    desc: 'মানের সাথে কোনো আপোষ নেই — ধীর আঁচে অল্প পরিমাণে প্রস্তুত।',
  },
] as const;

/**
 * Trust & Authenticity Banner — a beautifully typography-driven section
 * reinforcing the Boyam brand promise at the bottom of the landing page.
 */
export default function BoyamTrustBanner() {
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
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleEn}
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
                <span className="text-[10px] uppercase tracking-widest text-[#A6976F] dark:text-[#776A5A] font-medium mb-3">
                  {item.titleEn}
                </span>

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

