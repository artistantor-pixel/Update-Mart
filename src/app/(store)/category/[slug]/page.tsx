import type { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';
import {
  getCategoryPageConfigServer,
  getProductsByCategory,
  getCategoriesForHome,
} from '@/lib/products';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const config = await getCategoryPageConfigServer(slug);

  return {
    title: config.seoTitle || `${config.headline || config.name} | Update Mart`,
    description:
      config.seoDescription ||
      config.description ||
      `Shop the finest ${config.name} collection with express delivery and official warranty at Update Mart.`,
    openGraph: {
      title: config.seoTitle || `${config.headline || config.name} | Update Mart`,
      description: config.description,
      images: config.bannerImageUrl ? [{ url: config.bannerImageUrl }] : [],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug).toLowerCase();

  // Parallel server data fetching for category config, products & all categories
  const [config, categoryData, allCategories] = await Promise.all([
    getCategoryPageConfigServer(slug),
    getProductsByCategory(slug),
    getCategoriesForHome(),
  ]);

  return (
    <CategoryPageClient
      slug={slug}
      categoryName={categoryData.categoryName || config.name}
      config={config}
      initialProducts={categoryData.products}
      allCategories={allCategories}
    />
  );
}
