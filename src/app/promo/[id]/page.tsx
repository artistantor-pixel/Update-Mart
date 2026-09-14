"use client";

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Truck, CreditCard, CheckCircle2, Star, ChevronRight } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';

const BD_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
].sort();

export default function PromoPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { products } = useProductStore();
  const addOrder = useOrderStore(state => state.addOrder);
  
  const product = products.find(p => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  
  // Checkout Form State
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Special Offer`;
      // Pre-select first variant of each type
      const initialVariants: Record<string, string> = {};
      if (product.colors && product.colors.length > 0) {
        initialVariants['Color'] = product.colors[0].name;
      }
      const groups = (product.variants || []).reduce<Record<string, any[]>>((acc, v) => {
        if (!acc[v.name]) acc[v.name] = [];
        acc[v.name].push(v);
        return acc;
      }, {});
      Object.entries(groups).forEach(([k, vals]) => {
        if (vals.length > 0) initialVariants[k] = vals[0].value;
      });
      setSelectedVariants(initialVariants);
    }
  }, [product]);

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl dark:text-white">Offer Not Found</div>;

  const variantGroups = (product.variants || []).reduce<Record<string, typeof product.variants>>((acc, v) => {
    if (!v) return acc;
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name]!.push(v);
    return acc;
  }, {});

  const selectedVariantObj = (product.variants || []).find(v => v.value === selectedVariants[v.name]);
  
  const basePrice = selectedVariantObj?.price ? Number(selectedVariantObj.price) : product.price;
  const regularPrice = product.regularPrice || (product.price * 1.33);
  
  const shippingFee = district === 'Dhaka' ? 60 : 120;
  const totalAmount = (basePrice * quantity) + shippingFee;

  // Find sibling products in the same variant group
  const siblingProducts = product.variantGroupId 
    ? products.filter(p => p.variantGroupId === product.variantGroupId)
    : [];

  const scrollToCheckout = () => {
    document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{11}$/.test(phone)) {
      setPhoneError("Mobile number must be exactly 11 digits (e.g. 017XXXXXXXX)");
      return;
    }
    
    const variantLabel = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const fullAddress = thana ? `${address}, ${thana}` : address;

    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      customerName: firstName,
      customerEmail: `${phone}@placeholder.com`,
      customerPhone: phone,
      customerAvatar: firstName.charAt(0).toUpperCase(),
      address: fullAddress,
      district: district,
      status: 'New' as const,
      items: [{
        id: product.id,
        name: product.name,
        price: basePrice,
        quantity,
        variant: variantLabel || 'Default',
      }],
      total: totalAmount,
      deliveryCharge: shippingFee,
      paymentMethod: 'COD' as const,
      paymentStatus: 'Pending' as const,
      createdAt: new Date().toISOString(),
      timeline: [
        { 
          id: `t-${Date.now()}`,
          status: 'New' as const, 
          timestamp: new Date().toISOString(), 
          note: 'Order placed via Promo Landing Page' 
        }
      ]
    };

    addOrder(newOrder);
    router.push('/order-complete');
  };

  return (
    <div className="bg-slate-50 dark:bg-dark-900 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-white/5 pt-12 pb-20">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Product Image */}
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white dark:border-dark-700 w-full max-w-md mx-auto lg:mx-0">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
            {product.regularPrice && (
              <div className="absolute top-6 right-6 bg-red-500 text-white font-black px-6 py-3 rounded-full shadow-2xl transform rotate-3">
                SAVE ৳{(product.regularPrice - basePrice).toFixed(0)}
              </div>
            )}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg">
              <Star size={24} className="fill-accent-500 text-accent-500" />
              <span className="font-bold text-slate-900 dark:text-white">4.9/5 Average Rating</span>
            </div>
          </div>

          {/* Product Details & CTA */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-full text-sm uppercase tracking-wider">
              🔥 Limited Time Offer
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <span className="text-5xl lg:text-6xl font-black text-primary-500">৳{basePrice.toFixed(0)}</span>
              {regularPrice > basePrice && (
                <div className="flex flex-col items-start">
                  <span className="text-2xl text-slate-400 line-through font-bold">৳{regularPrice.toFixed(0)}</span>
                  <span className="text-sm font-semibold text-green-500 uppercase">In Stock</span>
                </div>
              )}
            </div>

            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {product.description || "The ultimate choice for premium quality and style. Order today to get fast delivery and exclusive discounts."}
            </p>

            {/* Sibling Variants on Landing Page */}
            {(siblingProducts.length > 0) && (
              <div className="mb-2 text-left">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Available Colors: <span className="font-normal text-slate-600 dark:text-slate-400">{product.primaryColor?.name || 'Standard'}</span></h3>
                </div>
                <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
                  {siblingProducts.map(sibling => (
                    <button
                      key={sibling.id}
                      type="button"
                      onClick={() => {
                        router.push(`/promo/${sibling.id}`);
                      }}
                      className={`w-12 h-12 rounded-full p-1 border-2 transition-colors ${sibling.id === product.id ? 'border-primary-500' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}
                      aria-label={`Select ${sibling.primaryColor?.name || sibling.name}`}
                      title={sibling.primaryColor?.name || sibling.name}
                    >
                      <div className="w-full h-full rounded-full shadow-inner flex items-center justify-center text-xs font-medium bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 overflow-hidden relative" style={sibling.primaryColor ? { backgroundColor: sibling.primaryColor.hex } : {}}>
                        {!sibling.primaryColor && sibling.name.charAt(0)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button 
                onClick={scrollToCheckout}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white text-2xl font-black py-6 px-12 rounded-3xl shadow-2xl shadow-primary-500/40 transition-all hover:scale-105 flex items-center justify-center gap-4 animate-pulse-slow"
              >
                ORDER NOW <ChevronRight size={28} className="animate-bounce-x" />
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
              <div className="flex flex-col items-center lg:items-start gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-1"><Truck size={24} /></div>
                <span className="font-bold text-sm">Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-1"><Shield size={24} /></div>
                <span className="font-bold text-sm">{product.warranty || "Premium Quality"}</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-1"><CheckCircle2 size={24} /></div>
                <span className="font-bold text-sm">Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Specs Section */}
      {product.specs && product.specs.length > 0 && (
        <section className="py-16 max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">Why Choose {product.name}?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specs.map((spec, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex items-start gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-500/10 text-primary-500 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{spec.key}</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inline Checkout Form */}
      <section id="checkout-form" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Complete Your Order</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Please fill in your details below. You will pay when you receive the product.</p>
        </div>

        <form onSubmit={handleSubmitOrder} className="bg-white dark:bg-dark-800 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side: Order Form */}
          <div className="p-5 sm:p-8 lg:p-12 lg:w-3/5 space-y-8 sm:space-y-10">
            
            {/* Variant Selectors */}
            {(product.colors?.length || Object.keys(variantGroups).length > 0) && (
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm">1</span> 
                  Select Options
                </h3>
                
                {product.colors && product.colors.length > 0 && (
                  <div className="pl-0 sm:pl-11 mt-3 sm:mt-0">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Color</label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map(color => (
                        <button
                          type="button"
                          key={color.name}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, Color: color.name }))}
                          className={`px-5 py-3 rounded-xl text-sm font-bold border-2 flex items-center gap-3 transition-all ${
                            selectedVariants['Color'] === color.name
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-md shadow-primary-500/10'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {Object.entries(variantGroups).map(([typeName, typeVariants]) => (
                  <div key={typeName} className="pl-0 sm:pl-11 mt-3 sm:mt-0">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{typeName}</label>
                    <div className="flex flex-wrap gap-3">
                      {(typeVariants || []).map(v => (
                        <button
                          type="button"
                          key={v.value}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [typeName]: v.value }))}
                          className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                            selectedVariants[typeName] === v.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-md shadow-primary-500/10'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {v.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery Info */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm">{(product.colors?.length || Object.keys(variantGroups).length > 0) ? '2' : '1'}</span> 
                Delivery Details
              </h3>
              
              <div className="pl-0 sm:pl-11 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-3 sm:mt-0">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                  <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-shadow" placeholder="e.g. Rahul Islam" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mobile Number *</label>
                  <input 
                    required 
                    type="tel" 
                    value={phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      if (val.length !== 11 && val.length > 0) {
                        setPhoneError("Mobile number must be exactly 11 digits.");
                      } else {
                        setPhoneError("");
                      }
                    }}
                    maxLength={11}
                    className={`w-full bg-slate-50 dark:bg-dark-900 border ${phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-shadow`} 
                    placeholder="01XXXXXXXXX" 
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">District *</label>
                  <div className="relative">
                    <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-medium cursor-pointer appearance-none">
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thana / Upazila <span className="font-normal text-slate-500">(Optional)</span></label>
                  <input type="text" value={thana} onChange={e => setThana(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-shadow" placeholder="e.g. Dhanmondi" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Address *</label>
                  <textarea required rows={3} value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none transition-shadow" placeholder="House/Apartment, Street Name, Area" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:w-2/5 bg-slate-50 dark:bg-dark-900/50 p-8 lg:p-12 border-l border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Order Summary</h3>
              
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{product.name}</h4>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-2">
                    {Object.entries(selectedVariants).map(([k,v]) => <span key={k}>{v}</span>)}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1">৳{basePrice.toFixed(0)}</div>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Quantity</span>
                  <div className="flex items-center bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">-</button>
                    <span className="w-10 py-1 text-center font-bold border-x border-slate-200 dark:border-slate-600">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">+</button>
                  </div>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>৳{(basePrice * quantity).toFixed(0)}</span>
                </div>
                
                <div className="flex justify-between font-medium pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span>Delivery ({district})</span>
                  <span>৳{shippingFee}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-slate-900 dark:text-white text-xl">Total to Pay</span>
                  <span className="font-black text-primary-500 text-3xl">৳{totalAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  You don&apos;t need to pay anything now. Pay the full amount in cash when you receive the product.
                </p>
              </div>

              <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-xl py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex justify-center items-center gap-3">
                CONFIRM ORDER <ChevronRight size={24} />
              </button>
              <div className="flex justify-center gap-2 items-center text-sm text-slate-500 mt-6 font-medium">
                <Shield size={16} /> 100% Safe & Secure Checkout
              </div>
            </div>
          </div>
        </form>
      </section>

    </div>
  );
}
