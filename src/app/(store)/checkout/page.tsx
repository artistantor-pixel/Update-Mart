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

const BD_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
].sort();

export default function Checkout() {
  const router = useRouter();
  const addOrder = useOrderStore(state => state.addOrder);
  const { isCODEnabled, codFee } = useSettingsStore();
  const { items: cartItems, clearCart } = useCartStore();
  const { validatePromo } = usePromoStore();
  
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [selectedThana, setSelectedThana] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [phoneError, setPhoneError] = useState("");
  const [phone, setPhone] = useState("");
  
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = selectedDistrict === 'Dhaka' ? 60 : 120;
  const activeCodFee = paymentMethod === 'cod' ? codFee : 0;
  const total = Math.max(0, subtotal + shipping + activeCodFee - discountAmount);
  
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

  useEffect(() => {
    document.title = 'Checkout | Update Mart';
    window.scrollTo(0, 0);
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems.length, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (cartItems.length === 0) return;

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const fullAddress = `${address}, ${selectedThana}, ${selectedDistrict}, Bangladesh`;

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
      address: fullAddress,
      status: 'New',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price
      })),
      total: total,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
      paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Paid',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Verified',
      createdAt: new Date().toISOString(),
      timeline: [
        { id: `t-${Date.now()}`, status: 'New', timestamp: new Date().toISOString(), note: `Order placed via ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}.` }
      ]
    };

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
              <section className="bg-white dark:bg-dark-800 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      required
                      className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-slate-900 dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-dark-900 dark:border-slate-700 cursor-pointer" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Email me with news and offers</span>
                  </label>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-white dark:bg-dark-800 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full name</label>
                    <input type="text" id="firstName" name="firstName" required className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
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
                      className={`w-full bg-slate-50 dark:bg-dark-900 border ${phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white`} 
                      placeholder="01XXXXXXXXX" 
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                    <input type="text" id="address" name="address" required className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" placeholder="Apartment, suite, etc. (optional)" />
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="district" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">District</label>
                    <div className="relative">
                      <select 
                        id="district" 
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white appearance-none"
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
                    <label htmlFor="thana" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thana / Upazila <span className="font-normal text-slate-500">(Optional)</span></label>
                    <input 
                      type="text"
                      id="thana" 
                      value={selectedThana}
                      onChange={(e) => setSelectedThana(e.target.value)}
                      placeholder="e.g. Dhanmondi"
                      className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-white dark:bg-dark-800 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Payment</h2>
                <p className="text-slate-500 text-sm mb-6 flex items-center gap-2"><Lock size={14}/> All transactions are secure and encrypted.</p>
                
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
                  <div 
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-primary-50 dark:bg-primary-500/10 border-b border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-dark-800'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <label className="flex items-center gap-3 cursor-pointer font-medium text-slate-900 dark:text-white">
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-dark-900 border-slate-300 cursor-pointer" />
                      Credit / Debit Card
                    </label>
                    <CreditCard size={24} className={paymentMethod === 'card' ? 'text-primary-500' : 'text-slate-400'} />
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="p-6 space-y-4 bg-slate-50 dark:bg-dark-900/50">
                      <div>
                        <input type="text" placeholder="Card number" required className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Expiration date (MM / YY)" required className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                        <input type="text" placeholder="Security code" required className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <input type="text" placeholder="Name on card" required className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* COD Option */}
                {isCODEnabled && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div 
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-primary-50 dark:bg-primary-500/10' : 'bg-white dark:bg-dark-800'}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <label className="flex items-center gap-3 cursor-pointer font-medium text-slate-900 dark:text-white">
                        <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-dark-900 border-slate-300 cursor-pointer" />
                        Cash on Delivery (COD)
                      </label>
                      <Banknote size={24} className={paymentMethod === 'cod' ? 'text-primary-500' : 'text-slate-400'} />
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="p-4 bg-slate-50 dark:bg-dark-900/50 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                        An additional fee of ৳{codFee.toFixed(2)} will be applied for Cash on Delivery. Please keep exact change ready.
                      </div>
                    )}
                  </div>
                )}
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
          <div className="lg:w-1/3">
            <div className="bg-slate-100 dark:bg-dark-800 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-white/10 sticky top-32">
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
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>COD Fee</span>
                    <span className="font-medium text-slate-900 dark:text-white">৳{codFee.toFixed(2)}</span>
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
