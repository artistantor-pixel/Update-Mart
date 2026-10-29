"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Check, Star, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/store/productStore';
import * as gtm from '@/lib/gtm';
import * as fpixel from '@/lib/fpixel';

interface BoyamProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * Extracts a formatted weight/volume label (e.g., '400g', '500ml', '1 Litre')
 * from product specs, variants, or product name.
 */
function extractWeight(product: Product): string {
  // Check specs first
  const weightSpec = product.specs?.find((s) =>
    /weight|পরিমাণ|ওজন|net\s*weight|size/i.test(s.key)
  );
  if (weightSpec?.value) return weightSpec.value;

  // Check variants
  const weightVariant = product.variants?.find((v) =>
    /\d+\s*(?:g|gm|kg|ml|ltr|লিটার|গ্রাম)/i.test(v.value)
  );
  if (weightVariant?.value) return weightVariant.value;

  // Extract from title (e.g. '... 400g', '... 1 Litre')
  const match = product.name.match(/\b(\d+(?:\.\d+)?\s*(?:g|gm|kg|ml|ltr|লিটার|গ্রাম|L))\b/i);
  if (match) return match[1].trim();

  return 'Jar Sealed';
}

export default function BoyamProductCard({ product, priority = false }: BoyamProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const weight = extractWeight(product);
  const discount =
    product.regularPrice && product.regularPrice > product.price
      ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
      : null;

  const handleQuantityChange = (delta: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      variant: weight,
      isFreeDelivery: product.isFreeDelivery,
      customDeliveryCharge: product.customDeliveryCharge,
    });

    // Analytics
    fpixel.event('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT',
    });
    gtm.trackAddToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || 'Food & Gourmet',
        brand: 'Boyam',
      },
      quantity,
      weight
    );

    // Frictionless in-place visual feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBuying(true);

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      variant: weight,
      isFreeDelivery: product.isFreeDelivery,
      customDeliveryCharge: product.customDeliveryCharge,
    });

    fpixel.event('InitiateCheckout', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT',
    });

    router.push('/checkout');
  };

  return (
    <div className="group relative flex flex-col h-full bg-[#FFFFFF] dark:bg-[#1A1613] rounded-3xl p-3 sm:p-4 border border-[#ECE5DD] dark:border-[#2C231B] hover:border-[#C57E3A]/40 dark:hover:border-[#C57E3A]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#C57E3A]/5 hover:-translate-y-1">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF6F0] dark:bg-[#231E19] flex items-center justify-center p-3">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Weight Badge */}
          <span className="inline-flex items-center gap-1 bg-white/90 dark:bg-[#1A1613]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#5A4839] dark:text-[#E2D5C8] border border-[#E8DFD4] dark:border-[#382E25] shadow-xs">
            {weight}
          </span>

          {/* Discount Badge */}
          {discount && discount > 0 && (
            <span className="bg-[#9C5B23] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-tight">
              -{discount}%
            </span>
          )}
        </div>

        {/* Jar Image */}
        <Link href={`/product/${product.id}`} className="relative w-full h-full block">
          <Image
            src={product.image || '/placeholder.png'}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow pt-4">
        {/* Category & Star Rating */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#8A7C6E] dark:text-[#A89888] mb-1.5">
          <span className="uppercase tracking-wider font-medium text-[10px] text-[#A6682E] dark:text-[#D98F4C]">
            {product.category || 'Food & Gourmet'}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-xs text-[#3E342B] dark:text-[#E2D5C8]">
              {Number(product.rating || 5).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`} className="block group-hover:text-[#A6682E] transition-colors">
          <h3 className="font-serif font-medium text-base sm:text-lg text-[#2A2118] dark:text-[#F3EDE6] line-clamp-2 leading-snug tracking-tight mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Price & Savings */}
        <div className="mt-auto pt-2 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#1F1914] dark:text-[#FAF6F0] tracking-tight">
              ৳{product.price.toLocaleString()}
            </span>
            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-xs sm:text-sm text-[#9C8F82] line-through font-normal">
                ৳{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
          {product.regularPrice && product.regularPrice > product.price && (
            <p className="text-[11px] text-[#2F6F3E] dark:text-[#52B768] font-medium mt-0.5">
              সাশ্রয় ৳{(product.regularPrice - product.price).toLocaleString()}
            </p>
          )}
        </div>

        {/* In-Card Quantity & Conversion Controls */}
        <div className="pt-2 border-t border-[#EFE8DF] dark:border-[#2C231B] flex flex-col gap-2">
          {/* Quantity Selector & Add to Cart Row */}
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-[#F8F4EE] dark:bg-[#251F19] rounded-xl px-2 py-1.5 border border-[#E6DED2] dark:border-[#382E25]">
              <button
                type="button"
                onClick={(e) => handleQuantityChange(-1, e)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center text-[#5A4839] dark:text-[#D5C7B8] hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-semibold text-[#2A2118] dark:text-[#F0E6DC]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => handleQuantityChange(1, e)}
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center text-[#5A4839] dark:text-[#D5C7B8] hover:text-black dark:hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Frictionless Add to Cart (In-Place) */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-[#F2ECE3] hover:bg-[#EAE1D5] dark:bg-[#2C231B] dark:hover:bg-[#382E25] text-[#3E3125] dark:text-[#F0E6DC]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#A6682E] dark:text-[#D98F4C]" />
                  <span>কার্টে যোগ করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Buy (Direct Checkout) */}
          <button
            type="button"
            onClick={handleQuickBuy}
            disabled={isBuying}
            className="w-full py-2.5 px-3 rounded-xl bg-[#9C5B23] hover:bg-[#834919] active:scale-[0.99] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#9C5B23]/15 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{isBuying ? 'প্রসেসিং হচ্ছে...' : 'সরাসরি অর্ডার করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

