"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, Shield, Zap } from 'lucide-react';
import { useHomepageStore } from '@/store/homepageStore';

export default function HeroSection() {
  const { content } = useHomepageStore();
  const hero = content.hero;

  return (
    <section className="relative min-h-[92vh] flex items-center bg-slate-50 dark:bg-dark-900 overflow-hidden pt-20 pb-16">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] bg-primary-500/10 dark:bg-primary-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[130px] opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-accent-400/10 dark:bg-accent-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-purple-500/10 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-60 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-10" />
      </div>

      {/* ─── DESKTOP layout (lg+) ─── */}
      <div className="hidden lg:block absolute inset-0 z-0">
        {/* Blended hero image — right half */}
        <div className="absolute right-0 top-0 w-[55%] h-full">
          <Image
            src={hero.heroImageUrl}
            alt="Hero"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Fade: left edge blends into section bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-dark-900 via-slate-50/40 dark:via-dark-900/40 to-transparent" />
          {/* Fade: top */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 dark:from-dark-900/60 via-transparent to-transparent" />
          {/* Fade: bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 dark:from-dark-900/80 via-transparent to-transparent" />
        </div>
      </div>

      {/* ─── MOBILE image block (below lg) ─── */}
      {hero.heroImageUrl && (
        <div className="lg:hidden absolute top-20 left-0 right-0 h-[42vh] z-0">
          <Image
            src={hero.heroImageUrl}
            alt="Hero"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Fades on all sides so it blends with page bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 dark:from-dark-900/80 via-transparent to-slate-50 dark:to-dark-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/60 dark:from-dark-900/60 via-transparent to-slate-50/60 dark:to-dark-900/60" />
        </div>
      )}

      {/* ─── Content ─── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 items-center min-h-[80vh] lg:min-h-0">

          {/* Text — Mobile: pushed below image area; Desktop: left column */}
          <div className="lg:col-span-6 flex flex-col justify-center items-start lg:pr-6 pt-[44vh] lg:pt-0">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200 uppercase">{hero.badgeText}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 leading-[1.1]">
              {hero.headlineLine1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 dark:from-primary-400 dark:via-primary-300 dark:to-accent-400">
                {hero.headlineLine2}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md leading-relaxed font-light">
              {hero.subtext}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-8 lg:mb-0">
              <Link
                href={hero.button1Link}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold px-7 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-0.5 group"
              >
                {hero.button1Label}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="inline-flex items-center justify-center gap-3 bg-white/70 dark:bg-dark-800/70 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 font-medium px-7 py-4 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-dark-700 hover:-translate-y-0.5 hover:shadow-lg shadow-sm group">
                <span className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-500/30 transition-colors">
                  <Play size={13} className="ml-0.5 fill-current" />
                </span>
                {hero.button2Label}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-500" /> Secure Checkout
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> Fast Delivery
              </div>
            </div>
          </div>

          {/* Right column — empty on desktop (image is absolute bg) */}
          <div className="hidden lg:block lg:col-span-6" />
        </div>
      </div>
    </section>
  );
}
