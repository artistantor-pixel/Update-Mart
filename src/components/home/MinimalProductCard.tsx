'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import * as gtm from '@/lib/gtm';
import * as fpixel from '@/lib/fpixel';
import type { Product } from '@/store/productStore';

interface MinimalProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function MinimalProductCard({
  product,
  priority = false,
}: MinimalProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = React.useState(false);

  const discountPercentage =
    product.regularPrice && product.regularPrice > product.price
      ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      variant: 'Standard',
      isFreeDelivery: product.isFreeDelivery,
      customDeliveryCharge: product.customDeliveryCharge,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);

    fpixel.event('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'BDT',
    });

    gtm.trackAddToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || 'General',
        brand: product.brand || 'Unknown',
      },
      1,
      'Standard'
    );
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col h-full bg-white dark:bg-dark-800 rounded-3xl overflow-hidden border border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-dark-900">
        <Image
          src={product.image || '/placeholder.png'}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discountPercentage && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold tracking-tight shadow-sm">
              -{discountPercentage}%
            </span>
          )}
          {product.isNew && !discountPercentage && (
            <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold tracking-tight shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Quick Add Button (Desktop Hover Overlay + Mobile Corner Touch) */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-semibold text-xs transition-all shadow-lg backdrop-blur-md ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 hover:bg-primary-500 dark:hover:bg-primary-400 dark:hover:text-white'
            }`}
            title="Quick Add to Cart"
          >
            {isAdded ? (
              <>
                <Check size={16} />
                <span className="hidden sm:inline">Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span className="hidden sm:inline">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Brand / Category Micro-Tag */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300 truncate">
            {product.brand || product.category || 'Essentials'}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Star size={12} className="fill-amber-600 dark:fill-amber-400" />
            <span>{product.rating || 5}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            ৳{product.price.toLocaleString()}
          </span>

          {product.regularPrice && product.regularPrice > product.price && (
            <span className="text-xs text-slate-600 dark:text-slate-300 line-through">
              ৳{product.regularPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

