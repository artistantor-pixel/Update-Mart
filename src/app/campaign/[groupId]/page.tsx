"use client";

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/productStore';
import { ChevronRight, Shield, Star, CheckCircle2 } from 'lucide-react';

export default function CampaignHubPage() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const { products, fetchProducts, isLoading } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Find all products that belong to this variant group
  const variantProducts = products.filter(p => p.variantGroupId === groupId);
  
  // If no products found for this group, maybe it's just a single product ID fallback
  const fallbackProducts = products.filter(p => p.id === groupId);
  const displayProducts = variantProducts.length > 0 ? variantProducts : fallbackProducts;

  if (displayProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-2xl text-slate-800 dark:text-white bg-slate-50 dark:bg-dark-900">
        <span className="text-6xl mb-4">😢</span>
        Campaign Not Found
        <button onClick={() => router.push('/')} className="mt-4 text-sm bg-primary-500 text-white px-6 py-2 rounded-full">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 font-sans pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-white/5 pt-16 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-32 w-[800px] h-[400px] bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-full text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6">
            🔥 Exclusive Offer
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">Perfect Style</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium px-2">
            Select your favorite color below to view details and complete your order. Limited stock available!
          </p>
        </div>
      </section>

      {/* Variants Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => router.push(`/promo/${product.id}`)}
              className="group bg-white dark:bg-dark-800 rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-white/5 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-500/30 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Product Image */}
              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-dark-700 mb-6">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Color Badge */}
                {product.primaryColor && (
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600 shadow-inner" 
                      style={{ backgroundColor: product.primaryColor.hex }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {product.primaryColor.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="px-2 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-2">
                  <Star size={16} className="fill-accent-500 text-accent-500" />
                  <Star size={16} className="fill-accent-500 text-accent-500" />
                  <Star size={16} className="fill-accent-500 text-accent-500" />
                  <Star size={16} className="fill-accent-500 text-accent-500" />
                  <Star size={16} className="fill-accent-500 text-accent-500" />
                  <span className="text-xs text-slate-500 font-semibold ml-1">4.9/5</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-primary-500">৳{product.price.toFixed(0)}</span>
                    {product.regularPrice && product.regularPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through font-medium">৳{product.regularPrice.toFixed(0)}</span>
                    )}
                  </div>
                  
                  <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-lg">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><CheckCircle2 size={32} /></div>
            <h4 className="font-bold text-slate-900 dark:text-white">Cash on Delivery</h4>
            <p className="text-sm text-slate-500 mt-2">Pay when you receive the product in your hands.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-4"><Shield size={32} /></div>
            <h4 className="font-bold text-slate-900 dark:text-white">Premium Quality</h4>
            <p className="text-sm text-slate-500 mt-2">100% authentic and tested products.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-4"><Star size={32} /></div>
            <h4 className="font-bold text-slate-900 dark:text-white">Easy Returns</h4>
            <p className="text-sm text-slate-500 mt-2">Hassle-free replacement policy.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
