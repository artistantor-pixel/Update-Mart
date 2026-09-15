"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Star, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { useHomepageStore } from '@/store/homepageStore';

export default function HeroSection() {
  const { content } = useHomepageStore();
  const hero = content.hero;

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0f]">

      {/* ── FULL-BLEED BACKGROUND IMAGE ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.heroImageUrl}
          alt="Hero"
          fill
          className="object-cover object-center scale-105"
          priority
        />
        {/* Dark overlay — heavier on left, fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]/30" />
        {/* Dark overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/40" />
        {/* Subtle color tint */}
        <div className="absolute inset-0 bg-primary-600/10 mix-blend-multiply" />
      </div>

      {/* ── DECORATIVE GLOW ORBS ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-[20%] w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 left-[10%] w-72 h-72 bg-accent-500/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 sm:px-10 lg:px-20 pt-28 pb-16 lg:pt-0 lg:pb-0">
        <div className="max-w-2xl">

          {/* Badge pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-white/15 bg-white/5 backdrop-blur-md"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            <span className="text-xs font-semibold tracking-[0.15em] text-white/80 uppercase">
              {hero.badgeText}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-extrabold leading-[1.05] tracking-tight mb-6">
            <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white drop-shadow-lg">
              {hero.headlineLine1}
            </span>
            <span
              className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {hero.headlineLine2}
            </span>
          </h1>

          {/* Divider line */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-primary-400/60" />
            <div className="h-px flex-1 max-w-[80px] bg-white/10" />
          </div>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-10 max-w-md font-light">
            {hero.subtext}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Link
              href={hero.button1Link}
              className="group inline-flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
            >
              <ShoppingBag size={18} />
              {hero.button1Label}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Browse All Products
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 sm:gap-10">
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-white/50 mt-0.5 uppercase tracking-wide">Happy Customers</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-white/50 mt-0.5 uppercase tracking-wide">Products</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Star size={18} className="text-accent-500 fill-accent-500" />
              <p className="text-2xl font-bold text-white">4.9</p>
              <p className="text-xs text-white/50 mt-0.5 uppercase tracking-wide self-end mb-0.5">/ 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TRUST BAR ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between py-4 gap-4 overflow-x-auto scrollbar-hide">
            {[
              { icon: <Truck size={16} />, label: 'Free Shipping over ৳5000' },
              { icon: <ShieldCheck size={16} />, label: 'Secure Payment' },
              { icon: <Headphones size={16} />, label: '24/7 Customer Support' },
              { icon: <Star size={16} className="fill-current" />, label: 'Top Rated Products' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors whitespace-nowrap group cursor-default">
                <span className="text-primary-400 group-hover:text-accent-500 transition-colors">{item.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                {i < 3 && <div className="hidden sm:block w-px h-4 bg-white/10 ml-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE: faint bottom scrim so trust bar readable ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-[5] pointer-events-none" />
    </section>
  );
}
