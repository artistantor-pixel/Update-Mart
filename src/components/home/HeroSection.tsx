"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, Shield, Battery, Zap, Star } from 'lucide-react';
import { useHomepageStore } from '@/store/homepageStore';

const FloatingIconMap: Record<string, React.ElementType> = {
  Shield, Battery, Zap, Star
};

export default function HeroSection() {
  const { content } = useHomepageStore();
  const hero = content.hero;

  return (
    <section className="relative min-h-[92vh] flex items-center bg-slate-50 dark:bg-dark-900 overflow-hidden pt-24 pb-20">
      
      {/* Refined Dynamic Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-primary-500/10 dark:bg-primary-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-60 animate-blob" />
        <div className="absolute top-[20%] right-[15%] w-[40vw] h-[40vw] bg-accent-400/10 dark:bg-accent-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-purple-500/10 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-60 animate-blob animation-delay-4000" />
        {/* Subtle Grid overlay for texture */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 flex flex-col justify-center items-start lg:pr-6">
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200 uppercase">{hero.badgeText}</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
              {hero.headlineLine1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 dark:from-primary-400 dark:via-primary-300 dark:to-accent-400 drop-shadow-sm">
                {hero.headlineLine2}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-xl leading-relaxed font-light">
              {hero.subtext}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href={hero.button1Link} 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 group"
              >
                {hero.button1Label} 
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/70 dark:bg-dark-800/70 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-dark-700 hover:-translate-y-1 hover:shadow-lg shadow-sm group">
                <span className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center transition-colors group-hover:bg-primary-100 dark:group-hover:bg-primary-500/30">
                  <Play size={14} className="ml-0.5 fill-current" />
                </span>
                {hero.button2Label}
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-500" /> Secure Checkout
              </div>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Fast Delivery
              </div>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="lg:col-span-6 relative mt-16 lg:mt-0 px-4 sm:px-0">
            {/* Main Image Container */}
            <div className="relative w-full max-w-lg mx-auto aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-black/40 ring-1 ring-slate-900/5 dark:ring-white/10 group">
              <Image 
                src={hero.heroImageUrl}
                alt="Hero Presentation" 
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                fill={true} 
                style={{objectFit: "cover"}} 
                priority
              />
              {/* Inner Gradient Overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-transparent to-transparent opacity-60 mix-blend-multiply" />
            </div>

            {/* Floating Glass Cards - Positioned for balance */}
            {hero.floatingCards[0] && (
              <div className="absolute -left-2 sm:-left-10 lg:-left-16 top-16 sm:top-24 bg-white/10 dark:bg-dark-900/40 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 animate-float z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-inner">
                    {(() => { const Icon = FloatingIconMap[hero.floatingCards[0].icon] || Shield; return <Icon className="text-white drop-shadow-md" size={22} />; })()}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm sm:text-base leading-tight">{hero.floatingCards[0].title}</p>
                    {hero.floatingCards[0].subtitle && <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{hero.floatingCards[0].subtitle}</p>}
                  </div>
                </div>
              </div>
            )}
            
            {hero.floatingCards[1] && (
              <div className="absolute -right-2 sm:-right-8 lg:-right-12 bottom-24 sm:bottom-32 bg-white/10 dark:bg-dark-900/40 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 animate-float animation-delay-2000 z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-purple-600 flex items-center justify-center shadow-inner">
                    {(() => { const Icon = FloatingIconMap[hero.floatingCards[1].icon] || Battery; return <Icon className="text-white drop-shadow-md" size={22} />; })()}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm sm:text-base leading-tight">{hero.floatingCards[1].title}</p>
                    {hero.floatingCards[1].subtitle && <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{hero.floatingCards[1].subtitle}</p>}
                  </div>
                </div>
              </div>
            )}

            {hero.floatingCards[2] && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 sm:-bottom-8 bg-white dark:bg-dark-800 backdrop-blur-xl px-6 py-3.5 rounded-full shadow-xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-200 dark:border-white/10 animate-float animation-delay-4000 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm whitespace-nowrap">{hero.floatingCards[2].title}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
