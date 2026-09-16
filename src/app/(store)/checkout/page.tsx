"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ChevronLeft, ChevronRight, CreditCard, Banknote, Ticket } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCartStore } from '@/store/cartStore';
import { usePromoStore, PromoCode } from '@/store/promoStore';
import { Order } from '@/components/admin/orders/types';

import { BD_DISTRICTS_MAP } from '@/lib/data/bd-districts';

const BD_DISTRICTS = Object.keys(BD_DISTRICTS_MAP).sort();

export default function Checkout() {
  const router = useRouter();
  const addOrder = useOrderStore(state => state.addOrder);
  const { isCODEnabled, codFee } = useSettingsStore();
  const { items: cartItems, clearCart } = useCartStore();
  const { validatePromo } = usePromoStore();
  
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [selectedThana, setSelectedThana] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
  const [phoneError, setPhoneError] = useState("");
  const [phone, setPhone] = useState("");
  
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = selectedDistrict === 'Dhaka' ? 60 : 120;
  const total = Math.max(0, subtotal + shipping - discountAmount);
  
  // Re-validate promo if subtotal changes (e.g. if they somehow change cart during checkout)
  useEffect(() => {
    if (appliedPromo) {
      const result = validatePromo(appliedPromo.code, subtotal);
      if (!result.isValid) {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoError(result.error || "Promo code is no longer valid for this cart.");
      } else {
        setDiscountAmount(result.discountAmount);
        setPromoError("");
      }
    }
  }, [subtotal, appliedPromo, validatePromo]);

  // Update thana selection when district changes
  useEffect(() => {
    const thanas = BD_DISTRICTS_MAP[selectedDistrict] || [];
    if (thanas.length > 0 && !thanas.includes(selectedThana)) {
      setSelectedThana(thanas[0]);
    } else if (thanas.length === 0) {
      setSelectedThana("");
    }
  }, [selectedDistrict]);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }
    const result = validatePromo(promoInput.trim(), subtotal);
    if (result.isValid && result.appliedPromo) {
      setAppliedPromo(result.appliedPromo);
      setDiscountAmount(result.discountAmount);
      setPromoError("");
      setPromoInput("");
    } else {
      setPromoError(result.error || "Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoError("");
  };

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    document.title = 'Checkout | Update Mart';
    window.scrollTo(0, 0);
    if (cartItems.length === 0 && !isOrderPlaced) {
      router.push('/cart');
    }
  }, [cartItems.length, router, isOrderPlaced]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (cartItems.length === 0) return;

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const note = formData.get('note') as string;

    if (!/^\d{11}$/.test(phone)) {
      setPhoneError("Mobile number must be exactly 11 digits (e.g. 017XXXXXXXX)");
      return;
    }
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: firstName,
      customerEmail: email,
      customerPhone: phone,
      customerAvatar: firstName.charAt(0).toUpperCase(),
      address: address,
      district: selectedDistrict,
      thana: selectedThana,
      status: 'New',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price
      })),
      total: total,
      deliveryCharge: shipping,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
      paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Paid',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Verified',
      orderNote: note ? note : undefined,
      createdAt: new Date().toISOString(),
      timeline: [
        { id: `t-${Date.now()}`, status: 'New', timestamp: new Date().toISOString(), note: `Order placed via ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}.` }
      ]
    };

    setIsOrderPlaced(true);
    addOrder(newOrder);
    clearCart();
    router.push('/order-complete');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        <Link href="/cart" className="inline-flex items-center text-slate-500 hover:text-primary-500 mb-8 transition-colors">
          <ChevronLeft size={20} /> Back to Cart
        </Link>

        <div className="flex flex-col-reverse lg:flex-row gap-12">
          
          {/* Checkout Form (Left side) */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Contact Info */}
              <section className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center font-bold">1</div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email address <span className="font-normal text-slate-500">(Optional)</span></label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      className="w-full bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="you@example.com"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-dark-900 dark:border-slate-700 cursor-pointer" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Email me with news and offers</span>
                  </label>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center font-bold">2</div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full name *</label>
                    <input type="text" id="firstName" name="firstName" required className="w-full bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600" placeholder="e.g. Ahmed Rahman" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mobile Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                        if (val.length !== 11 && val.length > 0) {
                          setPhoneError("Mobile number must be exactly 11 digits.");
                        } else {
                          setPhoneError("");
                        }
                      }}
                      maxLength={11}
                      required 
                      className={`w-full bg-slate-50/50 dark:bg-dark-900/50 border ${phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600`} 
                      placeholder="01XXXXXXXXX" 
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address *</label>
                    <input type="text" id="address" name="address" required className="w-full bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600" placeholder="House number, Street, Apartment etc." />
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="district" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">District *</label>
                    <div className="relative">
                      <select 
                        id="district" 
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white appearance-none hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                      >
                        {BD_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="thana" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thana / Upazila *</label>
                    <div className="relative">
                      <select 
                        id="thana" 
                        value={selectedThana}
                        onChange={(e) => setSelectedThana(e.target.value)}
                        required
                        className="w-full bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white appearance-none hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                      >
                        {(BD_DISTRICTS_MAP[selectedDistrict] || []).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order Note <span className="font-normal text-slate-500">(Optional)</span></label>
                    <textarea 
                      id="note" 
                      name="note" 
                      rows={3} 
                      className="w-full bg-slate-50/50 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 resize-none" 
                      placeholder="Special instructions for delivery..." 
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center font-bold">3</div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
                  </div>
                </div>
                
                <div className="border-2 border-primary-500 rounded-2xl overflow-hidden shadow-sm bg-primary-50/50 dark:bg-primary-500/5 relative">
                  <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                  <div className="p-5 flex items-center justify-between cursor-pointer">
                    <label className="flex items-center gap-3 cursor-pointer font-medium text-slate-900 dark:text-white">
                      <div className="w-5 h-5 rounded-full border-4 border-primary-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      </div>
                      Cash on Delivery (COD)
                    </label>
                    <Banknote size={24} className="text-primary-500" />
                  </div>
                  <div className="p-5 bg-white/50 dark:bg-dark-900/30 border-t border-primary-500/20 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Pay safely with cash when your order is delivered to your doorstep.
                  </div>
                </div>
              </section>

              {/* Submit */}
              <button 
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-5 px-6 rounded-2xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 text-lg flex items-center justify-center gap-2"
              >
                Place Order (৳{total.toFixed(2)}) <Lock size={18} />
              </button>

            </form>
          </div>

          {/* Order Summary Sidebar (Right side) */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none sticky top-28">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
              
              {/* Mini Cart Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative">
                      <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-900 flex-shrink-0 border border-slate-100 dark:border-white/5">
                        <Image src={item.image} alt={item.name} className="w-full h-full object-cover" fill={true} style={{objectFit: "cover"}} />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-slate-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.variant}</p>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 py-6 space-y-4">
                {/* Promo Code Input */}
                <div className="pb-4 border-b border-slate-100 dark:border-white/5">
                  {!appliedPromo ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="Promo code"
                          className="flex-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Ticket size={16} />
                        <span className="font-semibold">{appliedPromo.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-900 dark:text-white">৳{shipping.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Discount {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                    <span>-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}

              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">৳{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">BDT, includes VAT if applicable</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
