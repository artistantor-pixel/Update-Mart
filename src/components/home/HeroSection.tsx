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
        {/* Cinematic dark overlay — center is lighter, edges are dark */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,10,15,0.45)_0%,_rgba(10,10,15,0.85)_70%,_rgba(10,10,15,0.97)_100%)]" />
        {/* Bottom fade for trust bar */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        {/* Top fade for navbar */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0f]/70 to-transparent" />
        {/* Subtle color tint */}
        <div className="absolute inset-0 bg-primary-600/5 mix-blend-screen" />
      </div>

      {/* ── DECORATIVE GLOW ORBS (centered) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/15 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[80px] animate-blob animation-delay-2000" />
      </div>

      {/* ── MAIN CONTENT — CENTERED ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 sm:px-10 pt-24 pb-24">

        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 border border-white/15 bg-white/5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
          </span>
          <span className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
            {hero.badgeText}
          </span>
        </div>

        {/* Decorative line above headline */}
        <div className="flex items-center gap-4 mb-6 w-full justify-center">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
          <Star size={12} className="text-accent-500 fill-accent-500" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Headline */}
        <h1 className="font-extrabold leading-[1.05] tracking-tight mb-6 max-w-4xl">
          <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white drop-shadow-2xl">
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
        <p className="text-base sm:text-lg text-white/55 leading-relaxed mb-10 max-w-xl font-light">
          {hero.subtext}
        </p>

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

        {/* Stats Row — centered with dividers */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 p-4 px-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">10K+</p>
            <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">Customers</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">Products</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-accent-500 fill-accent-500" />
              <p className="text-2xl font-bold text-white">4.9</p>
            </div>
            <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">Rating</p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TRUST BAR ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-center sm:justify-between py-3.5 gap-6 overflow-x-auto scrollbar-hide flex-wrap">
            {[
              { icon: <Truck size={14} />, label: 'Free Shipping over ৳5000' },
              { icon: <ShieldCheck size={14} />, label: 'Secure Payment' },
              { icon: <Headphones size={14} />, label: '24/7 Support' },
              { icon: <Star size={14} className="fill-current" />, label: 'Top Rated Store' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/55 hover:text-white/90 transition-colors whitespace-nowrap group cursor-default">
                <span className="text-primary-400 group-hover:text-accent-500 transition-colors">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
