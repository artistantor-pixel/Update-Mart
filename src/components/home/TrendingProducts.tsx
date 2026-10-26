"use client";

import Link from "next/link";
import ProductCard from '../common/ProductCard';
import { useProductStore, Product } from '@/store/productStore';
import { useEffect } from 'react';

interface TrendingProductsProps {
  initialProducts?: Product[];
}

export default function TrendingProducts({ initialProducts = [] }: TrendingProductsProps) {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    // If client store hasn't loaded, fetch in background for full catalog interactivity
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Use server pre-rendered products immediately for zero-CLS first paint
  const displayProducts = initialProducts.length > 0 
    ? initialProducts 
    : (products.length > 0 ? products.slice(0, 4) : []);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section id="trending" className="py-20 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Trending Now</h2>
            <p className="text-slate-500 dark:text-slate-400">Discover our most sought-after products this week.</p>
          </div>
          <Link href="/products" className="hidden sm:inline-block text-primary-500 hover:text-primary-600 font-medium transition-colors">
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, idx) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              priority={idx < 2} 
            />
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="inline-block text-primary-500 hover:text-primary-600 font-medium transition-colors">
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

