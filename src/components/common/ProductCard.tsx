"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import * as gtm from '@/lib/gtm';
import * as fpixel from '@/lib/fpixel';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  isNew?: boolean;
}

export default function ProductCard({ id, name, price, image, rating, isNew }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: id,
      name,
      price,
      image,
      quantity: 1,
      variant: 'Standard',
    });
    fpixel.event('AddToCart', {
      content_name: name,
      content_ids: [id],
      content_type: 'product',
      value: price,
      currency: 'BDT'
    });
    gtm.trackAddToCart({ id, name, price, category: 'General', brand: 'Unknown' }, 1, 'Standard');
  };

  return (
    <Link href={`/product/${id}`} className="block group flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 hover:border-primary-500/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-dark-900">
        {isNew && (
          <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            NEW
          </span>
        )}
        <Image 
          src={image} 
          alt={name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        fill={true} style={{objectFit: "cover"}} />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleAddToCart}
            className="bg-white text-slate-900 font-medium px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-slate-50"
          >
            <ShoppingBag size={18} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow p-5">
        <div className="block flex-grow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-primary-500 transition-colors">
              {name}
            </h3>
            <span className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">
              ৳{price.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(rating) ? "text-accent-500 fill-accent-500" : "text-slate-300 dark:text-slate-600"} 
              />
            ))}
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-medium">({rating})</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-3 mt-auto bg-slate-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white text-slate-900 dark:text-white font-medium rounded-xl transition-colors border border-transparent dark:border-white/5 group-hover:border-primary-500/30"
        >
          <ShoppingBag size={18} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
