import { Suspense } from 'react';
import type { Metadata } from 'next';
import MinimalHero from '@/components/home/MinimalHero';
import CategoryPillNav from '@/components/home/CategoryPillNav';
import CuratedProductRow from '@/components/home/CuratedProductRow';
import JustForYouGrid from '@/components/home/JustForYouGrid';
import { CuratedRowSkeleton, JustForYouSkeleton } from '@/components/home/HomeSkeletons';
import Testimonials from '@/components/home/Testimonials';
import {
  getHomepageContent,
  getTrendingProducts,
  getCategoriesForHome,
  getFlashSaleProducts,
  getNewArrivalProducts,
  getJustForYouProducts,
} from '@/lib/products';

export const metadata: Metadata = {
  title: 'Update Mart | Ultra-Fast Minimalist Shopping',
  description: 'Shop curated premium watches, flagship electronics, audio gear, and lifestyle essentials with instant nationwide delivery.',
};

// Force dynamic server rendering for fresh catalog on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Parallel Next.js Server Component data fetching for lightning fast initial load
  const [
    content,
    categories,
    trendingProducts,
    flashSaleProducts,
    newArrivalProducts,
    justForYouProducts,
  ] = await Promise.all([
    getHomepageContent(),
    getCategoriesForHome(),
    getTrendingProducts(4),
    getFlashSaleProducts(4),
    getNewArrivalProducts(4),
    getJustForYouProducts(10),
  ]);

  const newsletter = content.newsletter;
  const heroContent = content.hero;

  return (
    <div className="flex flex-col bg-white dark:bg-dark-900 transition-colors">
      {/* 1. Minimal Hero Section (Optimal LCP with Priority Image) */}
      <MinimalHero
        badge={heroContent?.badgeText || 'New Curated Drop'}
        headline={
          heroContent
            ? `${heroContent.headlineLine1} ${heroContent.headlineLine2}`
            : 'Engineered for Life. Designed with Intent.'
        }
        subtext={heroContent?.subtext}
        ctaText={heroContent?.button1Label || 'Explore Catalog'}
        ctaLink={heroContent?.button1Link || '/products'}
        imageUrl={heroContent?.heroImageUrl}
      />

      {/* 2. Dynamic Category Navigation (Smooth Touch-Scrollable Pill Menu) */}
      <CategoryPillNav categories={categories} />

      {/* 3. Curated Product Rows (Smooth Touch Carousel on Mobile / CSS Grid on Desktop) */}
      {/* Flash Sales Row */}
      <Suspense fallback={<CuratedRowSkeleton count={4} />}>
        <CuratedProductRow
          title="Flash Sales"
          subtitle="Limited-time markdowns on premier electronics and accessories."
          badge="Limited Deals"
          badgeType="sale"
          viewAllLink="/products?filter=sale"
          products={flashSaleProducts}
        />
      </Suspense>

      {/* Trending Now Row */}
      <Suspense fallback={<CuratedRowSkeleton count={4} />}>
        <CuratedProductRow
          title="Trending Now"
          subtitle="Most wanted picks by shoppers this week across all categories."
          badge="High Demand"
          badgeType="trending"
          viewAllLink="/products?filter=trending"
          products={trendingProducts}
        />
      </Suspense>

      {/* New Arrivals Row */}
      <Suspense fallback={<CuratedRowSkeleton count={4} />}>
        <CuratedProductRow
          title="New Arrivals"
          subtitle="Fresh drops, newly engineered devices, and seasonal gear."
          badge="Just Landed"
          badgeType="new"
          viewAllLink="/products?filter=new"
          products={newArrivalProducts}
        />
      </Suspense>

      {/* 4. 'Just For You' Grid (2 cols mobile / 4-5 cols desktop) */}
      <Suspense fallback={<JustForYouSkeleton count={10} />}>
        <JustForYouGrid
          products={justForYouProducts}
          title="Just For You"
          subtitle="Recommendations tailored to your lifestyle and verified buyer favorites."
        />
      </Suspense>

      {/* 5. Verified Customer Testimonials */}
      {content.testimonials && content.testimonials.length > 0 && (
        <Testimonials testimonials={content.testimonials} />
      )}

      {/* 6. Minimal Newsletter Section */}
      {newsletter && (
        <section className="py-20 sm:py-24 bg-slate-100 dark:bg-dark-800 border-t border-slate-200/60 dark:border-white/5 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-bold text-primary-500 mb-2 block">
              Exclusive Member Drops
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {newsletter.headline}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base leading-relaxed">
              {newsletter.subtext}
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder={newsletter.placeholder || 'Enter your email address'}
                className="flex-grow bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-900 dark:text-white shadow-sm"
                required
              />
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all shadow-md shadow-primary-500/20 whitespace-nowrap text-sm"
              >
                {newsletter.buttonLabel || 'Subscribe'}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
