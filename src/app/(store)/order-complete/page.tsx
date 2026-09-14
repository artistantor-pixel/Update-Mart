"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, MapPin } from 'lucide-react';

export default function OrderComplete() {
  
  useEffect(() => {
    document.title = 'Order Confirmed | Update Mart';
    window.scrollTo(0, 0);
  }, []);

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

            <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-6 mb-10 text-left border border-slate-100 dark:border-white/5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Order Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-400"><Package size={20} /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Order Number</p>
                    <p className="font-semibold text-slate-900 dark:text-white">#UM-{Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-slate-400"><MapPin size={20} /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shipping to</p>
                    <p className="font-semibold text-slate-900 dark:text-white">123 Tech Ave, Suite 4</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>
            </div>

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
