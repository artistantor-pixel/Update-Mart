"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, FileText, Printer, MoreVertical, Package, Clock, Phone, Truck } from 'lucide-react';
import { Order, OrderStatus } from './types';
import { useCourierStore } from '@/store/courierStore';
import { useOrderStore } from '@/store/orderStore';

interface OrderTableRowProps {
  order: Order;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onEdit?: (order: Order) => void;
}

export default function OrderTableRow({ order, isSelected, onSelect, onStatusChange, onEdit }: OrderTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { couriers } = useCourierStore();
  const { updateOrder } = useOrderStore();
  const activeCouriers = couriers.filter(c => c.isActive);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <>
      <tr className={`border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors ${isExpanded ? 'bg-slate-50 dark:bg-dark-800/50' : ''}`}>
        <td className="py-5 pl-6 pr-4 w-12">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => onSelect(order.id, e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
        </td>
        <td className="py-5 px-4 align-top min-w-[150px]">
          <div className="flex items-start gap-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white mt-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm p-0.5">
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white hover:text-primary-500 cursor-pointer text-sm mb-1">{order.id}</p>
              <p className="text-xs text-slate-500">{formatDate(order.createdAt)} • {formatTime(order.createdAt)}</p>
            </div>
          </div>
        </td>
        <td className="py-5 px-4 align-top">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
              {order.customerAvatar.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.customerAvatar} alt={order.customerName} className="w-full h-full object-cover" />
              ) : (
                order.customerAvatar
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">{order.customerName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {order.customerPhone}</p>
            </div>
          </div>
        </td>
        <td className="py-5 px-4 align-top">
          <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">৳ {order.total.toLocaleString()}</p>
          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {order.paymentMethod}
          </span>
        </td>
        <td className="py-5 px-4 align-top">
          <select 
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className="bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-xs font-medium px-2 py-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none text-center min-w-[90px]"
          >
            <option value="New">New</option>
            <option value="On Hold">On Hold</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Reject Order">Reject Order</option>
          </select>
        </td>
        <td className="py-5 px-6 align-top text-right">
          <div className="flex items-center justify-end gap-1 text-slate-400">
            <button 
              onClick={() => onEdit && onEdit(order)}
              className="p-2 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" 
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => window.open(`/admin/print/${order.id}`, '_blank')}
              className="p-2 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" 
              title="Print Invoice"
            >
              <Printer size={16} />
            </button>
            <button className="p-2 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="More"><MoreVertical size={16} /></button>
          </div>
        </td>
      </tr>

      {/* Expanded Row - Simplified & Spacious */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-dark-800/30">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12">
              
              {/* Left Side: Items & Shipping (Wider) */}
              <div className="flex-[2] space-y-8">
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Package size={18} className="text-primary-500" /> Order Details
                    </h4>
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(order)}
                        className="text-[11px] font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5"
                      >
                        <Edit size={12} /> Edit Items
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-dark-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                             <Package size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                            <div className="text-slate-500 text-xs mt-1 flex flex-wrap gap-2">
                              {item.variant && item.variant !== 'Default' && (
                                <span className="inline-flex items-center bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                  Variant: <span className="font-semibold ml-1">{item.variant}</span>
                                </span>
                              )}
                              <span className="inline-flex items-center bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                Qty: <span className="font-semibold ml-1">{item.quantity}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">৳ {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-sm">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>৳ {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Shipping Cost</span>
                      <span>৳ {(order.deliveryCharge || Math.max(0, order.total - order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (order.discountAmount || 0))).toLocaleString()}</span>
                    </div>
                    {order.discountAmount && order.discountAmount > 0 ? (
                      <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                        <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                        <span>- ৳ {order.discountAmount.toLocaleString()}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <span>Total</span>
                      <span>৳ {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Shipping Address</h5>
                      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <span className="block font-medium text-slate-800 dark:text-slate-200 mb-0.5">{order.address}</span>
                        {order.thana && <span className="block">{order.thana}</span>}
                        {order.district && <span className="block font-medium">{order.district}</span>}
                      </div>
                    </div>
                    
                    {order.orderNote && (
                      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-lg mt-auto">
                        <h6 className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-1 uppercase tracking-wider">Customer Note</h6>
                        <p className="text-sm text-amber-700 dark:text-amber-300 italic">&quot;{order.orderNote}&quot;</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    {order.status === 'New' && (
                      <>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Action Required</h5>
                        <button 
                          onClick={() => onStatusChange(order.id, 'Processing')}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                        >
                          Confirm Order
                        </button>
                      </>
                    )}

                    {order.status === 'Processing' && (
                      <>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                          <Truck size={16} className="text-primary-500" /> Assign Courier
                        </h5>
                        
                        {activeCouriers.length > 0 ? (
                          <select 
                            value=""
                            onChange={(e) => {
                              const newCourierId = e.target.value;
                              if (newCourierId) {
                                updateOrder(order.id, { assignedCourierId: newCourierId });
                                onStatusChange(order.id, 'Assigned Courier');
                              }
                            }}
                            className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          >
                            <option value="">-- Select Courier --</option>
                            {activeCouriers.map(courier => (
                              <option key={courier.id} value={courier.id}>{courier.name}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 p-2 rounded-lg">
                            No active couriers found. Please configure them in the Couriers tab.
                          </p>
                        )}
                      </>
                    )}

                    {order.status === 'Assigned Courier' && (
                      <>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                          <Truck size={16} className="text-primary-500" /> Courier Info
                        </h5>
                        <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{couriers.find(c => c.id === order.assignedCourierId)?.name || 'Unknown Courier'}</span>
                            <span className="text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 px-2 py-0.5 rounded-full font-bold">ASSIGNED</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open(`/admin/print/${order.id}`, '_blank')}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1"
                          >
                            <Printer size={12} /> Print Slip
                          </button>
                          <button 
                            onClick={() => onStatusChange(order.id, 'Shipped')}
                            className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-green-200 dark:border-green-500/20"
                          >
                            Simulate Ship
                          </button>
                        </div>
                      </>
                    )}

                    {order.status !== 'New' && order.status !== 'Processing' && order.status !== 'Assigned Courier' && (
                      <>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                          <Truck size={16} className="text-primary-500" /> Courier Info
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {order.assignedCourierId ? couriers.find(c => c.id === order.assignedCourierId)?.name : 'Not assigned'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Timeline */}
              <div className="flex-1">
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm h-full">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-6 text-sm flex items-center gap-2">
                    <Clock size={18} className="text-primary-500" /> Activity Timeline
                  </h4>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {order.timeline.map((event, index) => (
                      <div key={event.id} className="relative flex gap-4 text-sm z-10">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-900 shrink-0 ${index === 0 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                          {index === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="-mt-0.5 pb-2">
                          <p className={`font-medium ${index === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {event.note || event.status}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(event.timestamp)} • {formatTime(event.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
