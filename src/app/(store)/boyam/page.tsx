import type { Metadata } from 'next';
import { getBoyamProducts, getBoyamPageSettings } from '@/lib/products';
import BoyamPageClient from './BoyamPageClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBoyamPageSettings();
  return {
    title: settings.seo.metaTitle,
    description: settings.seo.metaDescription,
    openGraph: {
      title: `${settings.hero.brandNameBn} (${settings.hero.brandNameEn}) — ${settings.hero.badgeText}`,
      description: settings.hero.tagline,
      type: 'website',
    },
  };
}

/**
 * Boyam Sales Landing Page — Server Component shell.
 * Fetches Boyam-brand products and dynamic page settings server-side.
 */
export default async function BoyamPage() {
  const [products, settings] = await Promise.all([
    getBoyamProducts(),
    getBoyamPageSettings(),
  ]);

  return <BoyamPageClient products={products} settings={settings} />;
}
