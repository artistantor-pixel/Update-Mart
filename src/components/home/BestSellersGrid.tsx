'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import * as gtm from '@/lib/gtm';
import * as fpixel from '@/lib/fpixel';
import type { Product } from '@/store/productStore';

interface BestSellersGridProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
  sectionId?: string;
}

function getStableReviewCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 420;
  }
  return 45 + Math.abs(hash);
}

export default function BestSellersGrid({
  products,
  title = 'Best Sellers',
  viewAllLink = '/products',
  sectionId = 'trending',
}: BestSellersGridProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistIds, setWishlistIds] = useState<Record<string, boolean>>({});

  if (!products || products.length === 0) return null;

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant =
      product.variants && product.variants.length > 0
        ? product.variants[0].value
        : 'Standard';

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      variant: defaultVariant,
      isFreeDelivery: product.isFreeDelivery,
      customDeliveryCharge: product.customDeliveryCharge,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);

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
        brand: product.brand || 'Update Mart',
      },
      1,
      defaultVariant
    );
  };

  return (
    <section
      id={sectionId}
      className="py-10 sm:py-14 bg-white dark:bg-dark-900 transition-colors"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-500 dark:text-indigo-300 hover:text-primary-600 dark:hover:text-indigo-200 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {products.map((product, idx) => {
            const isAdded = Boolean(addedIds[product.id]);
            const isWishlisted = Boolean(wishlistIds[product.id]);
            const ratingValue = Math.min(5, Math.max(1, Math.round(product.rating || 5)));
            const reviewCount = getStableReviewCount(product.id);
            const discountPct =
              product.regularPrice && product.regularPrice > product.price
                ? Math.round(
                    ((product.regularPrice - product.price) / product.regularPrice) * 100
                  )
                : null;

            return (
              <div
                key={product.id}
                className="group flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-primary-500/30 dark:hover:border-primary-400/30 transition-all duration-300 overflow-hidden"
              >
                {/* Product Image Box */}
                <Link
                  href={`/product/${product.id}`}
                  className="relative block m-2 sm:m-2.5 aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-900"
                >
                  <Image
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    fill
                    priority={idx < 4}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount or New Tag (Top Left) */}
                  {(discountPct || product.isNew) && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {discountPct ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-accent-500 text-white text-[10px] sm:text-[11px] font-extrabold tracking-tight shadow-sm">
                          -{discountPct}%
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-primary-500 text-white text-[10px] sm:text-[11px] font-extrabold tracking-tight shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                  )}

                  {/* Wishlist Heart Toggle (Top Right) */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(e, product.id)}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-sm ${
                      isWishlisted
                        ? 'bg-rose-500 text-white border-rose-500 scale-105'
                        : 'bg-white/90 dark:bg-dark-800/85 text-primary-500 dark:text-slate-300 border-slate-200/70 dark:border-white/10 hover:text-rose-500'
                    }`}
                  >
                    <Heart
                      size={15}
                      className={isWishlisted ? 'fill-current' : ''}
                    />
                  </button>
                </Link>

                {/* Product Info & Action Area */}
                <div className="flex flex-col flex-1 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
                  {/* Product Name */}
                  <Link
                    href={`/product/${product.id}`}
                    className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-indigo-300 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>

                  {/* Pricing Row */}
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      ৳{product.price.toLocaleString()}
                    </span>
                    {product.regularPrice && product.regularPrice > product.price && (
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 line-through">
                        ৳{product.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Star Rating Row */}
                  <div className="mt-1.5 flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={12}
                          className={
                            starIdx < ratingValue
                              ? 'text-accent-500 fill-accent-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      ({reviewCount})
                    </span>
                  </div>

                  {/* Add To Cart Button Row */}
                  <div className="mt-auto pt-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-primary-500 text-slate-800 hover:text-white dark:bg-dark-700 dark:text-slate-100 dark:hover:bg-primary-500'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      aria-label={`Quick add ${product.name} to cart`}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-primary-500 text-slate-700 hover:text-white dark:bg-dark-700 dark:text-slate-200 dark:hover:bg-primary-500'
                      }`}
                    >
                      {isAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

