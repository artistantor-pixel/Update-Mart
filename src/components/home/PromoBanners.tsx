'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Copy, Check, Gift, Clock, Sparkles } from 'lucide-react';

interface PromoBannersProps {
  couponCode?: string;
  couponDiscount?: string;
  couponSubtitle?: string;
  dealHeading?: string;
  dealSubtext?: string;
  dealLink?: string;
}

export default function PromoBanners({
  couponCode = 'FIRST15',
  couponDiscount = 'Get 15% OFF',
  couponSubtitle = 'On your first order',
  dealHeading = 'Deal Of The Day',
  dealSubtext = 'Hurry up! Limited time offer.',
  dealLink = '/products?filter=sale',
}: PromoBannersProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 24,
    seconds: 36,
  });

  // Countdown timer logic
  useEffect(() => {
    // Set target time as tonight 23:59:59 local time
    const getTargetTime = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 999);
      return target.getTime() - now.getTime();
    };

    const updateTimer = () => {
      const diff = getTargetTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-6 sm:py-10 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Exclusive Offer Coupon (Brand Indigo Palette) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e9ebfb] via-[#f1f3fd] to-[#dbe0fa] dark:from-[#13193e] dark:via-[#192252] dark:to-[#1e2760] border border-primary-500/15 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            {/* Ambient Background Circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary-400/20 dark:bg-primary-500/25 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-accent-500/15 dark:bg-accent-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Copy Side */}
              <div className="sm:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 dark:bg-white/10 border border-primary-500/20 dark:border-white/10 text-primary-600 dark:text-indigo-200 text-xs font-bold">
                  <Sparkles size={13} className="text-accent-500" />
                  <span>Exclusive Offer</span>
                </div>

                <p className="text-xs font-semibold text-primary-500/80 dark:text-indigo-300">
                  For You!
                </p>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {couponDiscount}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {couponSubtitle}
                </p>

                {/* Coupon Code Pill */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-dark-900 border border-dashed border-primary-500/40 dark:border-white/20 text-xs font-bold text-slate-800 dark:text-white shadow-sm hover:bg-slate-50 transition-colors group"
                    title="Click to copy coupon code"
                  >
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      USE CODE:
                    </span>
                    <span className="font-mono text-primary-500 dark:text-indigo-300 tracking-wider">
                      {couponCode}
                    </span>
                    {copied ? (
                      <Check size={14} className="text-emerald-500 ml-1" />
                    ) : (
                      <Copy
                        size={13}
                        className="text-slate-400 group-hover:text-primary-500 ml-1"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Graphic Side */}
              <div className="sm:col-span-5 flex justify-center sm:justify-end">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-white/70 dark:bg-dark-800/60 shadow-lg border border-white/60 dark:border-white/10 flex items-center justify-center p-3">
                  <Image
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80"
                    alt="Gift Package Box"
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-primary-500/10 pointer-events-none rounded-xl" />
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-accent-500 text-white shadow-md">
                    <Gift size={15} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Deal of the Day Countdown (Warm Amber Brand Accent Palette) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fef5e4] via-[#fffaf0] to-[#fdeac8] dark:from-[#2b2010] dark:via-[#332613] dark:to-[#3b2c15] border border-accent-500/20 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            {/* Ambient Background Circles */}
            <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-accent-500/20 dark:bg-accent-500/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-primary-400/15 dark:bg-primary-500/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Copy & Countdown Side */}
              <div className="sm:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                  <Clock size={14} />
                  <span>{dealHeading}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {dealSubtext}
                </p>

                {/* Countdown Digit Boxes */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-900 border border-accent-500/25 dark:border-white/10 shadow-sm flex items-center justify-center font-mono text-base font-black text-slate-900 dark:text-white">
                      {pad(timeLeft.hours)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">
                      HRS
                    </span>
                  </div>

                  <span className="text-slate-400 font-bold mb-4">:</span>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-900 border border-accent-500/25 dark:border-white/10 shadow-sm flex items-center justify-center font-mono text-base font-black text-slate-900 dark:text-white">
                      {pad(timeLeft.minutes)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">
                      MINS
                    </span>
                  </div>

                  <span className="text-slate-400 font-bold mb-4">:</span>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-900 border border-accent-500/25 dark:border-white/10 shadow-sm flex items-center justify-center font-mono text-base font-black text-accent-500 dark:text-amber-400">
                      {pad(timeLeft.seconds)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">
                      SECS
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    href={dealLink}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-bold tracking-wide shadow-md shadow-amber-500/25 transition-all group"
                  >
                    <span>SHOP NOW</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>

              {/* Graphic Side (Retro Alarm Clock) */}
              <div className="sm:col-span-5 flex justify-center sm:justify-end">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-white/70 dark:bg-dark-800/60 shadow-lg border border-white/60 dark:border-white/10 flex items-center justify-center p-3">
                  <Image
                    src="https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80"
                    alt="Limited Time Alarm Clock"
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-accent-500/10 pointer-events-none rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
