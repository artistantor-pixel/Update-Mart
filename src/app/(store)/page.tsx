"use client";

import HeroSection from '@/components/home/HeroSection';
import FeaturesBanner from '@/components/home/FeaturesBanner';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import TrendingProducts from '@/components/home/TrendingProducts';
import Testimonials from '@/components/home/Testimonials';
import { useEffect } from 'react';
import { useHomepageStore } from '@/store/homepageStore';

export default function Home() {
  const { content, fetchSettings } = useHomepageStore();
  const newsletter = content.newsletter;
  const visibility = content.visibility || {
    hero: true,
    features: true,
    category: true,
    trending: true,
    testimonials: true,
    newsletter: true,
  };

  useEffect(() => {
    document.title = 'Update Mart | Premium E-Commerce Experience';
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="flex flex-col">
      {visibility.hero && <HeroSection />}
      {visibility.features && <FeaturesBanner />}
      {visibility.category && <CategoryShowcase />}
      {visibility.trending && <TrendingProducts />}
      {visibility.testimonials && <Testimonials />}
      
      {/* Newsletter Section */}
      {visibility.newsletter && (
        <section className="py-24 bg-slate-100 dark:bg-dark-800 transition-colors">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">{newsletter.headline}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              {newsletter.subtext}
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={newsletter.placeholder}
                className="flex-grow bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white shadow-sm"
                required
              />
              <button 
                type="submit" 
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/30 whitespace-nowrap"
              >
                {newsletter.buttonLabel}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
