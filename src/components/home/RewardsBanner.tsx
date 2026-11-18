import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';

interface RewardsBannerProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export default function RewardsBanner({
  title = 'Join Update Mart Rewards',
  subtitle = 'Earn points on every purchase and unlock exclusive discounts & early drops.',
  ctaLabel = 'JOIN NOW',
  ctaLink = '/products',
}: RewardsBannerProps) {
  return (
    <section className="py-4 sm:py-6 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12163b] via-[#1f2664] to-[#12163b] border border-primary-400/20 px-5 py-6 sm:px-8 sm:py-7 shadow-lg shadow-primary-500/15">
          {/* Subtle Ambient Highlights */}
          <div className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-accent-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-primary-400/25 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Left Side: Crown Icon + Copy */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center shrink-0">
                <Crown size={24} className="text-accent-500" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200/80 mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right Side: CTA Button */}
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-accent-500 text-white border border-white/25 hover:border-accent-500 font-bold text-xs sm:text-sm tracking-wide transition-all shrink-0 active:scale-[0.98] group"
            >
              <span>{ctaLabel}</span>
              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

