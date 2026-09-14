import Link from "next/link";
import ProductCard from '../common/ProductCard';
import { useProductStore } from '@/store/productStore';

export default function TrendingProducts() {
  const { products } = useProductStore();
  const trendingProducts = products.slice(0, 4);
  return (
    <section id="trending" className="py-20 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Trending Now</h2>
            <p className="text-slate-500 dark:text-slate-400">Discover our most sought-after products this week.</p>
          </div>
          <Link href="#" className="hidden sm:inline-block text-primary-500 hover:text-primary-600 font-medium transition-colors">
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="#" className="inline-block text-primary-500 hover:text-primary-600 font-medium transition-colors">
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
