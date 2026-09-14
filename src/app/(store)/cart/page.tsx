"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

import { useCartStore } from '@/store/cartStore';

export default function Cart() {
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    document.title = 'Your Cart | Update Mart';
    window.scrollTo(0, 0);
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 15.00 : 0; // Flat rate shipping
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your cart is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Looks like you haven't added anything to your cart yet. Discover our premium collection and find something you love.
        </p>
        <Link href="/products"
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/30"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-10">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Cart Items List */}
        <div className="lg:w-2/3">
          <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-slate-200 dark:border-white/10 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-6 items-center">
                  
                  {/* Product Info */}
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors hidden sm:block"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                    <Link href={`/product/${item.id}`} className="block relative w-24 h-24 flex-shrink-0 bg-slate-50 dark:bg-dark-900 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
                      <Image src={item.image} alt={item.name} className="w-full h-full object-cover" fill={true} style={{objectFit: "cover"}} />
                    </Link>
                    <div>
                      <Link href={`/product/${item.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Variant: {item.variant}</p>
                      
                      {/* Mobile Remove & Price */}
                      <div className="flex items-center justify-between sm:hidden mt-3">
                        <span className="font-bold text-slate-900 dark:text-white">${item.price.toFixed(2)}</span>
                        <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 font-medium">Remove</button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Control */}
                  <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-dark-900/50">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium text-slate-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Unit Price (Desktop) */}
                  <div className="col-span-2 text-right hidden sm:block font-medium text-slate-500 dark:text-slate-400">
                    ৳{item.price.toFixed(2)}
                  </div>

                  {/* Total Price */}
                  <div className="col-span-2 text-right hidden sm:block font-bold text-slate-900 dark:text-white text-lg">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-slate-50 dark:bg-dark-800 rounded-3xl p-8 border border-slate-200 dark:border-white/10 sticky top-32">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-slate-600 dark:text-slate-300 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span className="font-medium text-slate-900 dark:text-white">৳{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Estimate</span>
                <span className="font-medium text-slate-900 dark:text-white">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">৳{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">BDT, includes VAT if applicable</p>
            </div>

            <Link href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
            >
              Proceed to Checkout <ArrowRight size={20} />
            </Link>
            
            <div className="mt-6 flex justify-center gap-4 text-slate-400 opacity-60">
               {/* Mock Payment Icons using SVGs or text */}
               <span className="text-xs font-semibold tracking-widest uppercase">Secure Checkout</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
