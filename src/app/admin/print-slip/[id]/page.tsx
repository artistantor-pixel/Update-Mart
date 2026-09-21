"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/store/orderStore';
import { useSettingsStore } from '@/store/settingsStore';
import Image from 'next/image';
import { Printer, ArrowLeft } from 'lucide-react';
import { Order } from '@/components/admin/orders/types';

export default function PrintSlip() {
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
      document.title = `Slip_${order.id} | Update Mart`;
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
    month: 'short',
    year: 'numeric'
  });

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = order.deliveryCharge || Math.max(0, order.total - subtotal + (order.discountAmount || 0));

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-black font-sans pb-12">
      
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
          <Printer size={16} /> Print Slip
        </button>
      </div>

      {/* Spacer for floating bar */}
      <div className="h-24 print:hidden"></div>

      {/* Thermal Slip Container (80mm width standard) */}
      <div className="w-[80mm] mx-auto bg-white shadow-2xl print:shadow-none print:m-0 sm:mt-12 print:mt-0 p-4 text-[12px] leading-tight font-mono">
        
        {/* Header */}
        <div className="text-center mb-4 border-b-2 border-black pb-3 border-dashed">
          <h1 className="text-xl font-bold uppercase tracking-widest mb-1">Update Mart</h1>
          <p className="text-[10px]">{footer?.phone || '01XXXXXXXXX'}</p>
          <p className="text-[10px]">Dhaka, Bangladesh</p>
        </div>

        {/* Consignment / Barcode */}
        <div className="text-center mb-4 border-b-2 border-black pb-3 border-dashed">
          <p className="text-[10px] font-bold uppercase mb-1">Consignment ID</p>
          {order.consignmentId ? (
            <div className="flex flex-col items-center justify-center">
              {/* Using TEC-IT barcode generator API */}
              <img 
                src={`https://barcode.tec-it.com/barcode.ashx?data=${order.consignmentId}&code=Code128&translate-esc=true`} 
                alt="Barcode" 
                className="max-w-full h-12 object-contain"
              />
              <p className="font-bold text-sm mt-1">{order.consignmentId}</p>
            </div>
          ) : (
            <p className="font-bold text-sm">NOT ASSIGNED</p>
          )}
        </div>

        {/* Invoice Info */}
        <div className="mb-4 text-[11px]">
          <div className="flex justify-between mb-1">
            <span className="font-bold">Invoice:</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-bold">Date:</span>
            <span>{orderDate}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-bold">Payment:</span>
            <span className="uppercase">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 border-y-2 border-black py-3 border-dashed text-[11px]">
          <p className="font-bold text-[13px] uppercase mb-1">{order.customerName}</p>
          <p className="font-bold">{order.customerPhone}</p>
          <p className="mt-1">{order.address}</p>
          {(order.thana || order.district) && (
            <p>{order.thana ? `${order.thana}, ` : ''}{order.district}</p>
          )}
          {order.orderNote && (
            <p className="mt-2 italic bg-slate-100 p-1">Note: {order.orderNote}</p>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1 font-bold w-[60%]">Item</th>
                <th className="py-1 font-bold text-center w-[15%]">Qty</th>
                <th className="py-1 font-bold text-right w-[25%]">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-dotted border-gray-400">
                  <td className="py-2 pr-1">
                    <p className="font-bold truncate">{item.name.substring(0, 20)}</p>
                    {item.variant && item.variant !== 'Standard' && (
                      <p className="text-[9px]">Var: {item.variant}</p>
                    )}
                  </td>
                  <td className="py-2 text-center align-top">{item.quantity}</td>
                  <td className="py-2 text-right align-top">{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6 w-[80%] ml-auto text-[11px]">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Delivery:</span>
            <span>{shipping.toLocaleString()}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="flex justify-between py-1">
              <span>Discount:</span>
              <span>-{order.discountAmount.toLocaleString()}</span>
            </div>
          ) : null}
          <div className="flex justify-between py-1 border-t-2 border-black mt-1 font-bold text-[14px]">
            <span>TOTAL:</span>
            <span>Tk {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] border-t-2 border-black border-dashed pt-4 mb-4">
          <p className="font-bold">THANK YOU FOR YOUR ORDER</p>
          <p>Please come again!</p>
        </div>
        
      </div>
    </div>
  );
}
