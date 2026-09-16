"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/store/orderStore';
import { useSettingsStore } from '@/store/settingsStore';
import Image from 'next/image';
import { Printer, ArrowLeft } from 'lucide-react';
import { Order } from '@/components/admin/orders/types';

export default function PrintInvoice() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { columns, fetchOrders, isLoading: storeIsLoading } = useOrderStore();
  const { footer, fetchSettings } = useSettingsStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, [fetchOrders, fetchSettings]);

  useEffect(() => {
    if (!storeIsLoading) {
      const allOrders = Object.values(columns).flat();
      const found = allOrders.find((o: Order) => o.id === id);
      setOrder(found || null);
      setIsLoading(false);
    }
  }, [columns, storeIsLoading, id]);

  useEffect(() => {
    if (order) {
      document.title = `Invoice_${order.id} | Update Mart`;
    }
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Order Not Found</h1>
        <button onClick={() => router.back()} className="text-primary-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = order.deliveryCharge || Math.max(0, order.total - subtotal + (order.discountAmount || 0));

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900 pb-12">
      
      {/* Floating Action Bar (Hidden in Print) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 print:hidden border border-white/10">
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-2 hover:text-primary-400 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Close
        </button>
        <div className="w-px h-5 bg-white/20"></div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-full transition-colors text-sm font-bold shadow-lg shadow-primary-500/30"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Spacer for floating bar */}
      <div className="h-24 print:hidden"></div>

      {/* Invoice Container */}
      <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:max-w-none print:min-h-0 print:m-0 sm:mt-12 print:mt-0 relative overflow-hidden">
        
        {/* Decorative Header Shape */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none print:hidden"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-2xl translate-x-1/4 -translate-y-1/4 pointer-events-none hidden print:block"></div>
        
        <div className="p-12 sm:p-16 relative z-10 flex flex-col min-h-full h-full">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-16">
            <div className="flex flex-col gap-4">
              <Image src="/logo.svg" alt="Update Mart" width={180} height={52} className="w-auto h-12" priority />
              <div className="text-sm text-slate-500 mt-2">
                <p className="font-semibold text-slate-700">UPDATE MART</p>
                <p>{footer?.phone || '01XXXXXXXXX'}</p>
                <p>{footer?.email || 'support@updatemart.com'}</p>
                <p>Dhaka, Bangladesh</p>
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-5xl font-black text-slate-200 tracking-tighter uppercase mb-4">Invoice</h1>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Invoice No: <span className="font-normal text-slate-600">{order.id}</span></p>
                <p className="text-sm font-bold text-slate-900">Date: <span className="font-normal text-slate-600">{orderDate}</span></p>
                <p className="text-sm font-bold text-slate-900 flex items-center justify-end gap-2 mt-1">Status: 
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.paymentMethod === 'COD' ? 'Unpaid (COD)' : 'Paid'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Shipping */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <div className="mb-3 border-b-2 border-primary-500 pb-2 inline-block">
                <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest">Billed To</h3>
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">{order.customerName}</p>
              <p className="text-sm text-slate-600 flex flex-col gap-1">
                <span>{order.customerPhone}</span>
                {order.customerEmail && <span>{order.customerEmail}</span>}
              </p>
            </div>
            
            <div>
              <div className="mb-3 border-b-2 border-primary-500 pb-2 inline-block">
                <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest">Shipped To</h3>
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">{order.customerName}</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {order.address}<br />
                {order.thana && <>{order.thana}, </>}
                {order.district}
              </p>
              {order.orderNote && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-bold text-amber-800 uppercase mb-1">Customer Note:</p>
                  <p className="text-xs text-amber-700 italic">"{order.orderNote}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 border-y-2 border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                  <th className="py-4 border-y-2 border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-4 border-y-2 border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
                  <th className="py-4 border-y-2 border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-5">
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      {item.variant && item.variant !== 'Standard' && (
                        <p className="text-xs text-slate-500 mt-1">Variant: {item.variant}</p>
                      )}
                    </td>
                    <td className="py-5 text-center text-sm font-medium text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-5 text-right text-sm font-medium text-slate-700">
                      ৳ {item.price.toLocaleString()}
                    </td>
                    <td className="py-5 text-right text-sm font-bold text-slate-900">
                      ৳ {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-16">
            <div className="w-1/2 sm:w-1/3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Subtotal</span>
                <span className="text-sm font-bold text-slate-900">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Shipping</span>
                <span className="text-sm font-bold text-slate-900">৳ {shipping.toLocaleString()}</span>
              </div>
              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between py-2 border-b border-slate-100 text-green-600">
                  <span className="text-sm font-medium">Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                  <span className="text-sm font-bold">- ৳ {order.discountAmount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-4 mt-2">
                <span className="text-lg font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-primary-600">৳ {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-auto border-t-2 border-slate-100 pt-8">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Thank you for your business!</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                If you have any questions about this invoice, please contact us at<br/>
                <span className="font-semibold text-slate-700">{footer?.phone || '01XXXXXXXXX'}</span> or <span className="font-semibold text-slate-700">{footer?.email || 'support@updatemart.com'}</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
