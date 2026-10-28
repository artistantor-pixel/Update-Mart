import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface MinimalHeroProps {
  badge?: string;
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
}

export default function MinimalHero({
  badge = 'New Curated Drop',
  headline = 'Engineered for Life. Designed with Intent.',
  subtext = 'Discover minimalist essentials, flagship electronics, and modern lifestyle accessories crafted for timeless functionality.',
  ctaText = 'Explore Collection',
  ctaLink = '/products',
  secondaryCtaText = 'View Flash Deals',
  secondaryCtaLink = '/products?filter=sale',
  imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85',
}: MinimalHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 -z-0 h-[450px] w-[450px] rounded-full bg-primary-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-0 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-primary-300">
              <Sparkles size={14} className="text-primary-400" />
              <span>{badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              {headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtext}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-semibold text-sm shadow-xl shadow-primary-500/25 transition-all group"
              >
                <span>{ctaText}</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              {secondaryCtaText && (
                <Link
                  href={secondaryCtaLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/90 hover:text-white font-semibold text-sm border border-white/10 backdrop-blur-sm transition-all"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>

            {/* Micro Trust Points */}
            <div className="pt-8 grid grid-cols-3 gap-3 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Truck size={16} className="text-primary-400 flex-shrink-0" />
                <span>Fast Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
                <span>100% Genuine Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <RotateCcw size={16} className="text-indigo-400 flex-shrink-0" />
                <span>Hassle-Free Returns</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Column (Optimized LCP with priority={true}) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glass Frame Shadow */}
              <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
                <Image
                  src={imageUrl}
                  alt={headline}
                  fill
                  priority={true}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[11px] font-semibold text-primary-300 uppercase tracking-wider block">
                      Featured Tech
                    </span>
                    <span className="text-sm font-bold text-white">
                      Obsidian Chronograph & Earbuds
                    </span>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold text-white">
                    In Stock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

