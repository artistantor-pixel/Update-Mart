"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, MapPin, ListOrdered } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import * as fpixel from '@/lib/fpixel';

export default function OrderComplete() {
  const columns = useOrderStore(state => state.columns);
  // Get the most recently added order based on createdAt
  const allOrders = Object.values(columns).flat();
  const latestOrder = allOrders.length > 0 
    ? allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] 
    : null;
  
  useEffect(() => {
    document.title = 'Order Confirmed | Update Mart';
    window.scrollTo(0, 0);
    
    if (latestOrder) {
      const trackedKey = `tracked_order_${latestOrder.id}`;
      if (!sessionStorage.getItem(trackedKey)) {
        fpixel.event('Purchase', {
          value: latestOrder.total,
          currency: 'BDT',
          content_ids: latestOrder.items.map(i => i.productId),
          content_type: 'product',
        });
        sessionStorage.setItem(trackedKey, 'true');
      }
    }
  }, [latestOrder]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          
          <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-white/10 shadow-lg">
            
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full mb-8">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Order Confirmed!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Thank you for your purchase. We've received your order and are getting it ready for shipment.
            </p>

            {latestOrder && (
              <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-6 mb-10 text-left border border-slate-100 dark:border-white/5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Order Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-400"><Package size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Order Number</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{latestOrder.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-400"><MapPin size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shipping to</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{latestOrder.customerName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{latestOrder.address}</p>
                      {latestOrder.orderNote && (
                        <p className="text-sm text-slate-500 italic mt-1">Note: {latestOrder.orderNote}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ListOrdered size={18} className="text-slate-400" />
                    <h4 className="font-medium text-slate-900 dark:text-white">Items</h4>
                  </div>
                  <div className="space-y-3">
                    {latestOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-500">Variant: {item.variant} • Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                    <p>Total</p>
                    <p>৳{latestOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products"
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 inline-flex items-center justify-center gap-2"
              >
                Continue Shopping <ArrowRight size={20} />
              </Link>
              <Link href="/"
                className="w-full sm:w-auto bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-700 font-medium py-4 px-8 rounded-xl transition-colors"
              >
                Back to Home
              </Link>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
