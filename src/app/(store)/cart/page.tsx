"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, MapPin } from 'lucide-react';

import { useCartStore } from '@/store/cartStore';
import { useCourierStore } from '@/store/courierStore';
import { useProductStore } from '@/store/productStore';
import { calculateDeliveryFee } from '@/lib/delivery';
import * as fpixel from '@/lib/fpixel';

export default function Cart() {
  const router = useRouter();
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const { couriers, fetchCouriers } = useCourierStore();
  const { products, fetchProducts } = useProductStore();

  const [deliveryLocation, setDeliveryLocation] = useState<'inside' | 'outside'>('inside');

  useEffect(() => {
    document.title = 'Shopping Cart | Update Mart';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (couriers.length === 0) {
      fetchCouriers();
    }
  }, [couriers.length, fetchCouriers]);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Robust Subtotal Calculation
  const subtotal = cartItems.reduce((acc, item) => {
    const p =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
    const q = Number(item.quantity) || 1;
    return acc + p * q;
  }, 0);

  // Enrich cart items with product-level delivery settings
  const enrichedCartItems = cartItems.map((item) => {
    const prod = products.find((p) => p.id === item.productId || p.id === item.id);
    return {
      ...item,
      isFreeDelivery:
        item.isFreeDelivery !== undefined
          ? item.isFreeDelivery
          : Boolean(prod?.isFreeDelivery),
      customDeliveryCharge:
        item.customDeliveryCharge !== undefined && item.customDeliveryCharge !== null
          ? item.customDeliveryCharge
          : prod?.customDeliveryCharge != null
          ? Number(prod.customDeliveryCharge)
          : null,
    };
  });

  const activeCourier = couriers.find((c) => c.isActive) || {
    deliveryChargeInsideDhaka: 60,
    deliveryChargeOutsideDhaka: 120,
  };
  const insideCharge = Number(activeCourier.deliveryChargeInsideDhaka) || 60;
  const outsideCharge = Number(activeCourier.deliveryChargeOutsideDhaka) || 120;

  // Accurate Delivery Calculation (matching Checkout page)
  const deliveryResult = calculateDeliveryFee({
    cartItems: enrichedCartItems,
    selectedDistrict: deliveryLocation === 'inside' ? 'Dhaka' : 'Chittagong',
    insideDhakaFee: insideCharge,
    outsideDhakaFee: outsideCharge,
  });

  const shipping = subtotal > 0 ? deliveryResult.fee : 0;
  const total = Math.max(0, subtotal + shipping);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[55vh]">
        <div className="w-24 h-24 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={44} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          আপনার কার্ট বর্তমানে খালি
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm">
          আপনি এখনো কোনো পণ্য কার্টে যুক্ত করেননি। আমাদের আকর্ষণীয় ক্যাটালগ থেকে আপনার পছন্দের পণ্যটি বেছে নিন।
        </p>
        <Link
          href="/products"
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-primary-500/25"
        >
          শপিং শুরু করুন (Start Shopping)
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items)
        </h1>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-primary-500 hover:text-primary-600 hover:underline"
        >
          আরও পণ্য দেখুন
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm">
            {/* Table Header (Desktop) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-dark-900/30">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {enrichedCartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-6 items-center"
                >
                  {/* Product Info */}
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-3.5">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition hidden sm:block p-1"
                      title="মুছে ফেলুন"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link
                      href={`/product/${item.productId || item.id}`}
                      className="block relative w-20 h-20 sm:w-22 sm:h-22 flex-shrink-0 bg-slate-50 dark:bg-dark-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="object-cover"
                        fill
                        sizes="88px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productId || item.id}`}
                        className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary-500 transition line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {item.variant}
                        </p>
                      )}
                      {item.isFreeDelivery && (
                        <span className="inline-block text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full mt-1">
                          Free Delivery
                        </span>
                      )}

                      {/* Mobile Row: Price & Quantity */}
                      <div className="flex items-center justify-between sm:hidden mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center bg-slate-100 dark:bg-dark-700 rounded-xl p-0.5 border border-slate-200 dark:border-white/5">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                              else removeItem(item.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-red-500 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Control (Desktop) */}
                  <div className="hidden sm:flex col-span-2 justify-center">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-dark-900/50 p-0.5">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                          else removeItem(item.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary-500 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary-500 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Unit Price (Desktop) */}
                  <div className="col-span-2 text-right hidden sm:block font-medium text-slate-500 dark:text-slate-400 text-sm">
                    ৳{item.price.toFixed(2)}
                  </div>

                  {/* Total Line Price (Desktop) */}
                  <div className="col-span-2 text-right hidden sm:block font-extrabold text-slate-900 dark:text-white text-base">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary (Right Column) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-slate-50 dark:bg-dark-800 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 sticky top-28 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Order Summary</h2>

            {/* Delivery Location Selector */}
            <div className="mb-5 p-3.5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
                <Truck size={14} className="text-primary-500" /> ডেলিভারি চার্জ হিসাব করুন:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('inside')}
                  className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                    deliveryLocation === 'inside'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/10'
                      : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">ঢাকা সিটি</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {deliveryResult.isFree ? '৳০ ফ্রি' : `৳${insideCharge}`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('outside')}
                  className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                    deliveryLocation === 'outside'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/10'
                      : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">ঢাকার বাইরে</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {deliveryResult.isFree ? '৳০ ফ্রি' : `৳${outsideCharge}`}
                  </span>
                </button>
              </div>
            </div>

            {/* Calculation Lines */}
            <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300 mb-6">
              <div className="flex justify-between">
                <span>Subtotal (সাবটোটাল)</span>
                <span className="font-bold text-slate-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span>Shipping (ডেলিভারি)</span>
                  {deliveryResult.isFree && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      Free Delivery
                    </span>
                  )}
                </div>
                <span
                  className={`font-bold ${
                    deliveryResult.isFree
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {deliveryResult.isFree ? 'FREE (৳0.00)' : `৳${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 dark:border-white/10 pt-5 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total (মোট)</span>
                <span className="text-2xl sm:text-3xl font-black text-primary-500 dark:text-primary-400">
                  ৳{total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-right">ভ্যাট অন্তর্ভুক্ত • BDT</p>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => {
                fpixel.event('InitiateCheckout', {
                  value: total,
                  currency: 'BDT',
                });
                router.push('/checkout');
              }}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-extrabold py-4 px-6 rounded-2xl transition shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 text-base"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="mt-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                🛡️ নিরাপদ ক্যাশ অন ডেলিভারি
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
