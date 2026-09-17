"use client";

import { useState } from 'react';
import { 
  Search, Package, Truck, CheckCircle, 
  Clock, MapPin, ArrowRight, Loader2, Calendar, FileText
} from 'lucide-react';

type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered';

interface MockOrder {
  id: string;
  date: string;
  status: OrderStatus;
  estimatedDelivery: string;
  items: { name: string; quantity: number; price: number; image?: string }[];
  total: number;
  address: string;
}

// Dummy database
const mockOrders: Record<string, MockOrder> = {
  'UM-10293': {
    id: 'UM-10293',
    date: 'Oct 24, 2026',
    status: 'shipped',
    estimatedDelivery: 'Oct 28, 2026',
    items: [
      { name: 'Wireless Noise-Cancelling Headphones', quantity: 1, price: 299.99 },
      { name: 'Premium Silicone Case', quantity: 1, price: 29.99 },
    ],
    total: 329.98,
    address: '123 Tech Lane, Silicon Valley, CA 94025'
  },
  'UM-99882': {
    id: 'UM-99882',
    date: 'Oct 15, 2026',
    status: 'delivered',
    estimatedDelivery: 'Oct 18, 2026',
    items: [
      { name: 'Smart Fitness Watch Series 5', quantity: 2, price: 199.99 },
    ],
    total: 399.98,
    address: '456 Innovation Blvd, Austin, TX 78701'
  }
};

const timelineSteps = [
  { id: 'placed', label: 'Order Placed', icon: Clock },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'out-for-delivery', label: 'Out for Delivery', icon: MapPin },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<MockOrder | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter your Order ID');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setOrder(null);
    
    // Simulate network request
    setTimeout(() => {
      const foundOrder = mockOrders[orderId.trim().toUpperCase()];
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Just mock a generic one if not found for better demo
        setOrder({
          id: orderId.trim().toUpperCase(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'processing',
          estimatedDelivery: new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          items: [
            { name: 'Example Product (Mocked Data)', quantity: 1, price: 99.99 },
          ],
          total: 99.99,
          address: 'Your Address (Hidden for security)'
        });
        // Uncomment below line if you want strict checking instead of mocking random orders
        // setError("We couldn't find an order with that ID. Please check and try again.");
      }
      setIsLoading(false);
    }, 1500);
  };

  const getCurrentStepIndex = (status: OrderStatus) => {
    return timelineSteps.findIndex(step => step.id === status);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 dark:from-dark-800 dark:to-dark-950 py-20 px-4">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl mix-blend-overlay"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Enter your order ID below to get real-time updates on your shipment status.
          </p>
          
          {/* Form */}
          <div className="glass p-6 md:p-8 rounded-2xl md:rounded-full shadow-xl max-w-3xl mx-auto transform transition-all hover:shadow-2xl">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Order ID (e.g. UM-10293)"
                  className="w-full bg-slate-50/50 dark:bg-dark-800/50 border border-slate-200 dark:border-dark-700 rounded-xl md:rounded-full pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white transition-all"
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address (Optional)"
                  className="w-full bg-slate-50/50 dark:bg-dark-800/50 border border-slate-200 dark:border-dark-700 rounded-xl md:rounded-full pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl md:rounded-full px-8 py-3.5 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Track</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-3 font-medium text-left ml-4">{error}</p>}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {!order && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <Package size={64} className="text-slate-300 dark:text-dark-700 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Ready to track your package?</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Find your Order ID in the confirmation email we sent you after your purchase.
            </p>
          </div>
        )}

        {order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header Info */}
            <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <Calendar size={16} /> Order placed on {order.date}
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  Order <span className="text-primary-600 dark:text-primary-400">#{order.id}</span>
                </h2>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl p-4 flex flex-col items-start md:items-end w-full md:w-auto">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated Delivery</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck size={18} className="text-primary-500" />
                  {order.estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass rounded-2xl p-6 sm:p-10 overflow-hidden relative">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-10">Tracking Status</h3>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[27px] sm:left-auto sm:top-6 sm:bottom-auto sm:left-8 sm:right-8 bottom-0 top-0 w-1 sm:w-auto sm:h-1 bg-slate-200 dark:bg-dark-700 rounded-full z-0"></div>
                
                {/* Active Line */}
                <div 
                  className="absolute left-[27px] sm:left-auto sm:top-6 sm:bottom-auto sm:left-8 w-1 sm:h-1 bg-primary-500 rounded-full z-0 transition-all duration-1000 ease-in-out"
                  style={{ 
                    height: 'auto', 
                    top: 0,
                    bottom: typeof window !== 'undefined' && window.innerWidth < 640 
                      ? `${100 - ((getCurrentStepIndex(order.status) + 1) / timelineSteps.length) * 100}%` 
                      : 'auto',
                    width: typeof window !== 'undefined' && window.innerWidth >= 640 
                      ? `${(getCurrentStepIndex(order.status) / (timelineSteps.length - 1)) * 100}%` 
                      : '4px',
                  }}
                ></div>

                <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                  {timelineSteps.map((step, index) => {
                    const isActive = index <= getCurrentStepIndex(order.status);
                    const isCurrent = index === getCurrentStepIndex(order.status);
                    const StepIcon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 group relative">
                        {/* Icon Circle */}
                        <div className={`
                          w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all duration-300
                          ${isActive 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-white dark:bg-dark-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-dark-700'
                          }
                          ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/30 scale-110' : ''}
                        `}>
                          <StepIcon size={24} />
                        </div>
                        
                        {/* Label */}
                        <div className={`sm:text-center sm:absolute sm:-bottom-8 sm:w-32 ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-dark-800 pb-4">
                  Items in this Order
                </h3>
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-dark-700/50 text-slate-400">
                        <Package size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-800 flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Total Amount</span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-primary-500" /> Delivery Address
                  </h3>
                  <div className="bg-slate-50 dark:bg-dark-800 rounded-xl p-4 border border-slate-100 dark:border-dark-700 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {order.address}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-primary-500" /> Need Help?
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Have an issue with your order? Our support team is here to help.
                  </p>
                  <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-900 dark:text-white font-medium rounded-xl py-3 transition-colors text-sm border border-slate-200 dark:border-dark-700 shadow-sm">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
