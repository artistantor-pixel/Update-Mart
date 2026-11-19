import { Suspense } from 'react';
import type { Metadata } from 'next';
import HeroBannerSlider from '@/components/home/HeroBannerSlider';
import FeaturesBanner from '@/components/home/FeaturesBanner';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import BestSellersGrid from '@/components/home/BestSellersGrid';
import PromoBanners from '@/components/home/PromoBanners';
import RewardsBanner from '@/components/home/RewardsBanner';
import BottomTrustBar from '@/components/home/BottomTrustBar';
import Testimonials from '@/components/home/Testimonials';
import CuratedProductRow from '@/components/home/CuratedProductRow';
import JustForYouGrid from '@/components/home/JustForYouGrid';
import { CuratedRowSkeleton, JustForYouSkeleton } from '@/components/home/HomeSkeletons';
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
  description:
    'Shop curated premium watches, flagship electronics, audio gear, and lifestyle essentials with instant nationwide delivery.',
};

// Incremental Static Regeneration (ISR): Serve cached page instantly in ~30ms, revalidate in background every 60s
export const revalidate = 60;

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
    getTrendingProducts(8),
    getFlashSaleProducts(4),
    getNewArrivalProducts(4),
    getJustForYouProducts(10),
  ]);

  const newsletter = content.newsletter;
  const heroContent = content.hero;
  const visibility = content.visibility;

  // Map untouched legacy defaults ("Future" / "Forward.") to the redesigned hero copy
  const isLegacyDefaultHeadline =
    heroContent?.headlineLine1 === 'Future' && heroContent?.headlineLine2 === 'Forward.';
  const heroBadge =
    !heroContent?.badgeText || heroContent.badgeText === 'Just Released'
      ? 'LIMITED TIME OFFER'
      : heroContent.badgeText;
  const heroLine1 = isLegacyDefaultHeadline
    ? 'Shop More,'
    : heroContent?.headlineLine1 || 'Shop More,';
  const heroLine2 = isLegacyDefaultHeadline
    ? 'Save More'
    : heroContent?.headlineLine2 || 'Save More';
  const heroSubtext =
    isLegacyDefaultHeadline || !heroContent?.subtext
      ? 'Explore top quality products at unbeatable prices with fast nationwide delivery.'
      : heroContent.subtext;
  const heroCtaLabel =
    !heroContent?.button1Label || heroContent.button1Label === 'Buy Now'
      ? 'EXPLORE COLLECTION'
      : heroContent.button1Label;

  return (
    <div className="flex flex-col bg-white dark:bg-dark-900 transition-colors">
      {/* 1. Hero Banner Slider (TrendMart Split Layout with stats & discount badge) */}
      {visibility?.hero !== false && (
        <HeroBannerSlider
          banners={heroContent?.banners}
          autoSlideInterval={heroContent?.autoSlideInterval || 5}
          showArrows={heroContent?.showArrows ?? true}
          showDots={heroContent?.showDots ?? true}
          badgeText={heroBadge}
          headlineLine1={heroLine1}
          headlineLine2={heroLine2}
          subtext={heroSubtext}
          ctaLabel={heroCtaLabel}
          ctaLink={heroContent?.button1Link || '/products'}
        />
      )}

      {/* 2. Top Trust & Value Features Bar (Free Shipping, Easy Returns, Secure Payment, Premium Quality) */}
      {visibility?.features !== false && (
        <FeaturesBanner features={content.features} />
      )}

      {/* 3. Shop By Category (Circular Category Row matching TrendMart) */}
      {visibility?.category !== false && (
        <CategoryShowcase categories={categories} title="Shop By Category" />
      )}

      {/* 4. Best Sellers Product Grid (Heart wishlist, Stars, BDT prices, Add to Cart) */}
      {visibility?.trending !== false && (
        <BestSellersGrid
          products={trendingProducts}
          title="Best Sellers"
          viewAllLink="/products?filter=trending"
        />
      )}

      {/* 5. Promotional Banners (Side-by-side: Exclusive Offer 15% OFF + Deal of the Day Countdown) */}
      <PromoBanners />

      {/* 6. Rewards & Membership Callout Banner */}
      <RewardsBanner />

      {/* 7. Flash Sales & New Arrivals Curated Rows */}
      {flashSaleProducts && flashSaleProducts.length > 0 && (
        <Suspense fallback={<CuratedRowSkeleton count={4} />}>
          <CuratedProductRow
            title="Flash Deals"
            subtitle="Limited-time markdowns on premier electronics and accessories."
            badge="Limited Deals"
            badgeType="sale"
            viewAllLink="/products?filter=sale"
            products={flashSaleProducts}
          />
        </Suspense>
      )}

      {newArrivalProducts && newArrivalProducts.length > 0 && (
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
      )}

      {/* 8. Just For You Recommendations */}
      <Suspense fallback={<JustForYouSkeleton count={10} />}>
        <JustForYouGrid
          products={justForYouProducts}
          title="Just For You"
          subtitle="Recommendations tailored to your lifestyle and verified buyer favorites."
        />
      </Suspense>

      {/* 9. Verified Customer Testimonials */}
      {visibility?.testimonials !== false &&
        content.testimonials &&
        content.testimonials.length > 0 && (
          <Testimonials testimonials={content.testimonials} />
        )}

      {/* 10. Bottom Trust & Support Bar (Track Order, Best Price, Flexible Payment, Customer Support) */}
      <BottomTrustBar />

      {/* 11. Minimal Newsletter Subscription Section */}
      {visibility?.newsletter !== false && newsletter && (
        <section className="py-16 sm:py-20 bg-slate-50 dark:bg-dark-800 border-t border-slate-200/60 dark:border-white/5 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-extrabold text-primary-500 dark:text-indigo-300 mb-2 block">
              Exclusive Member Drops
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {newsletter.headline}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-sm sm:text-base leading-relaxed">
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
