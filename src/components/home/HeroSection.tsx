"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Star, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { useHomepageStore } from '@/store/homepageStore';

export default function HeroSection() {
  const { content } = useHomepageStore();
  const hero = content.hero;

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0f] -mt-24">

      {/* ── FULL-BLEED BACKGROUND IMAGE ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.heroImageUrl}
          alt="Hero"
          fill
          className="object-cover object-center scale-105"
          priority
        />
        {/* Strong dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#0a0a0f]/75" />
        {/* Radial vignette — darker at edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(10,10,15,0.6)_100%)]" />
        {/* Bottom fade for trust bar */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        {/* Top fade for navbar */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0f]/60 to-transparent" />
      </div>

      {/* ── DECORATIVE GLOW ORBS (centered) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary-500/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-accent-500/10 rounded-full blur-[80px] animate-blob animation-delay-2000" />
      </div>


      {/* ── MAIN CONTENT — CENTERED ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 sm:px-10 pt-24 pb-24">

        {/* ── Text content wrapper with dark glass backdrop ── */}
        <div className="relative w-full max-w-3xl mx-auto px-8 py-10 sm:py-12 rounded-3xl bg-black/40 backdrop-blur-sm border border-white/8 shadow-2xl mb-10">

          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-7 border border-white/20 bg-white/8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            <span className="text-xs font-semibold tracking-[0.2em] text-white/90 uppercase">
              {hero.badgeText}
            </span>
          </div>

          {/* Decorative line */}
          <div className="flex items-center gap-4 mb-6 w-full justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
            <Star size={12} className="text-accent-500 fill-accent-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          {/* Headline */}
          <h1 className="font-extrabold leading-[1.05] tracking-tight mb-5">
            <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
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

          {/* Subtext */}
          <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto font-light">
            {hero.subtext}
          </p>
        </div>


        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full max-w-md sm:max-w-none">
          <Link
            href={hero.button1Link}
            className="group inline-flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 w-full sm:w-auto"
          >
            <ShoppingBag size={18} />
            {hero.button1Label}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
