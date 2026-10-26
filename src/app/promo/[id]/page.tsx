"use client";

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Truck, CreditCard, CheckCircle2, Star, ChevronRight, ChevronLeft, ChevronDown, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useProductStore, ProductVariant } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { useCourierStore } from '@/store/courierStore';
import * as fpixel from '@/lib/fpixel';

const BD_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
].sort();

export default function PromoPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { products, fetchProducts, isLoading } = useProductStore();
  const addOrder = useOrderStore(state => state.addOrder);
  
  const [activeId, setActiveId] = useState(id);

  useEffect(() => {
    if (id) setActiveId(id);
  }, [id]);

  const product = products.find(p => p.id === activeId) || products.find(p => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  
  // Checkout Form State
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  // Courier & Delivery Charges
  const { couriers, fetchCouriers } = useCourierStore();

  useEffect(() => {
    if (couriers.length === 0) {
      fetchCouriers();
    }
  }, [couriers.length, fetchCouriers]);

  const activeCourier = couriers.find(c => c.isActive) || { deliveryChargeInsideDhaka: 80, deliveryChargeOutsideDhaka: 130 };
  const insideDhakaFee = activeCourier.deliveryChargeInsideDhaka ?? 80;
  const outsideDhakaFee = activeCourier.deliveryChargeOutsideDhaka ?? 130;

  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [address, setAddress] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Gallery images support (primary image + optional gallery)
  const galleryImages = (product?.images && product.images.length > 0) 
    ? product.images 
    : (product?.image ? [product.image] : []);
  const currentImage = galleryImages[activeImageIndex] || product?.image || '';

  // Handle ESC key and scroll lock for image zoom lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageZoomed(false);
        setZoomScale(1);
      }
    };
    if (isImageZoomed) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageZoomed]);

  // Restore form state if saved in sessionStorage
  useEffect(() => {
    try {
      const sName = sessionStorage.getItem('pm_name');
      const sPhone = sessionStorage.getItem('pm_phone');
      const sDist = sessionStorage.getItem('pm_district');
      const sThana = sessionStorage.getItem('pm_thana');
      const sAddr = sessionStorage.getItem('pm_address');
      if (sName) setFirstName(sName);
      if (sPhone) setPhone(sPhone);
      if (sDist) {
        setDistrict(sDist);
        setDeliveryZone(sDist === 'Dhaka' ? 'inside' : 'outside');
      }
      if (sThana) setThana(sThana);
      if (sAddr) setAddress(sAddr);
    } catch {}
  }, []);

  const updateFirstName = (val: string) => {
    setFirstName(val);
    try { sessionStorage.setItem('pm_name', val); } catch {}
  };
  const updatePhone = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    setPhone(digitsOnly);
    if (digitsOnly.length !== 11 && digitsOnly.length > 0) {
      setPhoneError("Mobile number must be exactly 11 digits.");
    } else {
      setPhoneError("");
    }
    try { sessionStorage.setItem('pm_phone', digitsOnly); } catch {}
  };
  const handleZoneChange = (zone: 'inside' | 'outside') => {
    setDeliveryZone(zone);
    if (zone === 'inside') {
      setDistrict('Dhaka');
      try { sessionStorage.setItem('pm_district', 'Dhaka'); } catch {}
    } else if (district === 'Dhaka') {
      setDistrict('Chittagong');
      try { sessionStorage.setItem('pm_district', 'Chittagong'); } catch {}
    }
  };

  const updateDistrict = (val: string) => {
    setDistrict(val);
    if (val === 'Dhaka') {
      setDeliveryZone('inside');
    } else {
      setDeliveryZone('outside');
    }
    try { sessionStorage.setItem('pm_district', val); } catch {}
  };
  const updateThana = (val: string) => {
    setThana(val);
    try { sessionStorage.setItem('pm_thana', val); } catch {}
  };
  const updateAddress = (val: string) => {
    setAddress(val);
    try { sessionStorage.setItem('pm_address', val); } catch {}
  };

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Find sibling products in the same variant group
  const siblingProducts = product?.variantGroupId 
    ? products.filter(p => p.variantGroupId === product.variantGroupId)
    : [];

  const rawVariants = Array.isArray(product?.variants) ? product.variants : [];
  const variantGroups = rawVariants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!v || !v.name) return acc;
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name]!.push(v);
    return acc;
  }, {});

  const colorGroupKey = Object.keys(variantGroups).find(k => 
    ['color', 'colour', 'colors', 'edition', 'variant', 'রঙ'].includes(k.trim().toLowerCase())
  );
  const dynamicColorVariants = colorGroupKey ? variantGroups[colorGroupKey] : null;

  // Selected Color Name
  const selectedColorName = 
    siblingProducts.length > 1
      ? (product?.primaryColor?.name || product?.name || '')
      : (product?.colors && product.colors.length > 0)
      ? (selectedVariants['Color'] || product.colors[0]?.name || '')
      : dynamicColorVariants && dynamicColorVariants.length > 0
      ? (selectedVariants[colorGroupKey!] || dynamicColorVariants[0]?.value || '')
      : (product?.primaryColor?.name || '');

  // Active color dot hex
  const activeColorHex = 
    siblingProducts.length > 1
      ? (product?.primaryColor?.hex || '#1e293b')
      : (product?.colors && product.colors.length > 0)
      ? (product.colors.find(c => c.name === (selectedVariants['Color'] || product.colors?.[0]?.name))?.hex || '#1e293b')
      : (product?.primaryColor?.hex || '#1e293b');

  const handleSelectSibling = (siblingId: string) => {
    setActiveId(siblingId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/promo/${siblingId}`);
    }
  };

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Special Offer`;
      fpixel.event('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BDT'
      });

      const initialVariants: Record<string, string> = {};
      if (product.colors && product.colors.length > 0) {
        initialVariants['Color'] = product.colors[0].name;
      } else if (dynamicColorVariants && dynamicColorVariants.length > 0) {
        initialVariants[colorGroupKey!] = dynamicColorVariants[0].value;
        initialVariants['Color'] = dynamicColorVariants[0].value;
      } else if (product.primaryColor?.name) {
        initialVariants['Color'] = product.primaryColor.name;
      }

      Object.entries(variantGroups).forEach(([k, vals]) => {
        if (vals && vals.length > 0 && vals[0]?.value) {
          initialVariants[k] = vals[0].value;
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [product?.id]);

  if (isLoading || (products.length === 0 && !product)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl dark:text-white">Offer Not Found</div>;

  const selectedVariantObj = rawVariants.find(v => v && v.value === selectedVariants[v.name]);
  
  const parsedProductPrice = typeof product.price === 'number'
    ? product.price
    : (parseFloat(String(product.price || '0').replace(/[^0-9.]/g, '')) || 0);
  const basePrice = selectedVariantObj?.price 
    ? (typeof selectedVariantObj.price === 'number' ? selectedVariantObj.price : parseFloat(String(selectedVariantObj.price).replace(/[^0-9.]/g, '')) || 0)
    : parsedProductPrice;
  const regularPrice = product.regularPrice || (basePrice * 1.33);
  
  const standardFee = deliveryZone === 'inside' ? Number(insideDhakaFee || 0) : Number(outsideDhakaFee || 0);
  const shippingFee = product?.isFreeDelivery 
    ? 0 
    : (product?.customDeliveryCharge !== null && product?.customDeliveryCharge !== undefined && !isNaN(Number(product.customDeliveryCharge))
        ? Number(product.customDeliveryCharge)
        : standardFee);
  const totalAmount = Math.max(0, Math.round(((basePrice * (Number(quantity) || 1)) + shippingFee) * 100) / 100);

  const scrollToCheckout = () => {
    fpixel.event('InitiateCheckout');
    document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{11}$/.test(phone)) {
      setPhoneError("Mobile number must be exactly 11 digits (e.g. 017XXXXXXXX)");
      return;
    }

    const variantList = Object.entries(selectedVariants)
      .filter(([k]) => !['color', 'colour', 'colors', 'edition', 'variant', 'রঙ'].includes(k.trim().toLowerCase()))
      .map(([k, v]) => `${k}: ${v}`);

    if (selectedColorName) {
      variantList.unshift(`Color: ${selectedColorName}`);
    }

    const variantLabel = variantList.join(', ') || 'Default';
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
        variant: variantLabel,
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

    // Track Purchase immediately on order submission (Browser Pixel + Server CAPI with customer data)
    try {
      sessionStorage.setItem('last_placed_order', JSON.stringify(newOrder));
      sessionStorage.setItem(`tracked_order_${newOrder.id}`, 'true');
      const purchaseValue = Math.max(0, Math.round(Number(totalAmount || 0) * 100) / 100);
      await fpixel.event('Purchase', {
        value: purchaseValue,
        currency: 'BDT',
        content_ids: [String(product.id)],
        content_name: product.name,
        content_type: 'product',
        num_items: Number(quantity) || 1,
      }, {
        phone: phone,
        name: firstName,
      });
    } catch (err) {
      console.error('Error firing promo purchase event:', err);
    }

    router.push('/order-complete');
  };




  return (
    <div className="bg-slate-50 dark:bg-dark-900 pb-20 lg:pb-0">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-white/5 pt-12 pb-20">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-0 lg:px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
          
          {/* Product Image - Clickable for zoom */}
          <div className="flex flex-col items-center w-full max-w-md mx-auto lg:mx-0">
            <div 
              className="relative aspect-square sm:aspect-[4/5] overflow-hidden rounded-2xl lg:rounded-[2rem] shadow-xl lg:shadow-2xl border-4 lg:border-8 border-slate-100 dark:border-dark-700 w-full bg-white dark:bg-dark-800 cursor-zoom-in group transition-all"
              onClick={() => {
                setIsImageZoomed(true);
                setZoomScale(1);
              }}
              title="Click to zoom image"
            >
              <Image 
                src={currentImage} 
                alt={product.name} 
                fill 
                className="object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105" 
                priority 
              />
              {/* Zoom hint overlay */}
              <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20 transition-all pointer-events-none group-hover:scale-105">
                <ZoomIn size={14} className="text-primary-400" />
                <span>জুম করে দেখুন</span>
              </div>
            </div>

            {/* Thumbnail Gallery (if multiple images exist) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx 
                        ? 'border-primary-500 shadow-md ring-2 ring-primary-500/30' 
                        : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & CTA */}
          <div className="space-y-8 text-left px-4 lg:px-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-full text-sm uppercase tracking-wider">
              🔥 Limited Time Offer
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.2]">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-start gap-3 sm:gap-4">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary-500">৳{basePrice.toFixed(0)}</span>
              {regularPrice > basePrice && (
                <div className="flex flex-col items-start">
                  <span className="text-xl sm:text-2xl text-slate-400 line-through font-bold">৳{regularPrice.toFixed(0)}</span>
                  <span className="text-xs sm:text-sm font-bold text-red-500 uppercase bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded animate-pulse">Save ৳{(regularPrice - basePrice).toFixed(0)}</span>
                </div>
              )}
            </div>

            {/* Scarcity Bar */}
            <div className="max-w-md mx-0 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> 
                  High Demand
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Only 14 items left!</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 w-[15%] h-full rounded-full"></div>
              </div>
            </div>

            {/* Product Details - Dropdown/Accordion */}
            <div className="max-w-xl mx-0 bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
              <button 
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="w-full flex justify-between items-center p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors select-none text-left"
                aria-expanded={isDescriptionExpanded}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center">
                    <Star size={18} className="fill-primary-500/20" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white text-sm sm:text-base block">
                      Product Details (প্রোডাক্ট বিবরণ)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isDescriptionExpanded ? 'ক্লিক করে বন্ধ করুন' : 'বিস্তারিত দেখতে ক্লিক করুন'}
                    </span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180 bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : ''}`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              {isDescriptionExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700 p-4 sm:p-5 bg-slate-50/50 dark:bg-dark-800/50 animate-fade-in">
                  <ul className="space-y-2.5 text-left">
                    {(product.description || "The ultimate choice for premium quality and style.\nOrder today to get fast delivery.\nExclusive discounts available.")
                      .split('\n')
                      .filter(line => line.trim())
                      .map((line, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="mt-2 w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>
                          <span>{line.trim()}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              )}
            </div>



            <div className="pt-4 pb-4 lg:pb-0 flex flex-col items-start gap-3">
              <button 
                onClick={scrollToCheckout}
                className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-2xl sm:text-3xl font-black py-5 sm:py-6 px-8 sm:px-14 rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-primary-500/40 transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 animate-pulse-slow border-b-4 border-primary-700"
              >
                <div className="flex items-center gap-2">
                  ORDER NOW <ChevronRight size={32} className="animate-bounce-x" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-primary-100 opacity-90 tracking-wide uppercase">Cash on Delivery Available</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Specs Dropdown Section */}
      {product.specs && product.specs.length > 0 && (
        <section className="py-16 max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">Features & Specifications</h2>
          <div className="space-y-4">
            {product.specs.map((spec, idx) => (
              <details key={idx} className="group bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                  <span className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-primary-500" />
                    {spec.key}
                  </span>
                  <span className="transition group-open:rotate-180 text-slate-400">
                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-slate-600 dark:text-slate-400 p-5 pt-0 pl-14 group-open:animate-fade-in border-t border-slate-100 dark:border-slate-700 mt-2">
                  {spec.value}
                </div>
              </details>
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
            
            {/* Delivery Info */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full shrink-0 bg-primary-500 text-white flex items-center justify-center text-sm shadow-md shadow-primary-500/30">1</span> 
                ডেলিভারি ঠিকানা
              </h3>
              
              <div className="pl-0 sm:pl-11 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-3 sm:mt-0">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">আপনার নাম *</label>
                  <input required type="text" value={firstName} onChange={e => updateFirstName(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-shadow" placeholder="e.g. Rahul Islam" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">মোবাইল নাম্বার *</label>
                  <input 
                    required 
                    type="tel" 
                    value={phone} 
                    onChange={e => updatePhone(e.target.value)}
                    maxLength={11}
                    className={`w-full bg-slate-50 dark:bg-dark-900 border ${phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-shadow`} 
                    placeholder="01XXXXXXXXX" 
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
                {/* ডেলিভারি এলাকা নির্বাচন (Delivery Area) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    ডেলিভারি এরিয়া সিলেক্ট করুন *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      onClick={() => handleZoneChange('inside')}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        deliveryZone === 'inside'
                          ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-500/10 shadow-sm ring-1 ring-primary-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          id="zone-inside"
                          name="deliveryZone" 
                          checked={deliveryZone === 'inside'} 
                          onChange={() => handleZoneChange('inside')} 
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                        />
                        <label htmlFor="zone-inside" className="cursor-pointer">
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">ঢাকার ভিতরে</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">হোম ডেলিভারি</span>
                        </label>
                      </div>
                      <span className="font-black text-base text-primary-600 dark:text-primary-400">
                        ৳{insideDhakaFee}
                      </span>
                    </div>

                    <div 
                      onClick={() => handleZoneChange('outside')}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        deliveryZone === 'outside'
                          ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-500/10 shadow-sm ring-1 ring-primary-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          id="zone-outside"
                          name="deliveryZone" 
                          checked={deliveryZone === 'outside'} 
                          onChange={() => handleZoneChange('outside')} 
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                        />
                        <label htmlFor="zone-outside" className="cursor-pointer">
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">ঢাকার বাইরে</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">সারা বাংলাদেশ</span>
                        </label>
                      </div>
                      <span className="font-black text-base text-primary-600 dark:text-primary-400">
                        ৳{outsideDhakaFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">জেলা *</label>
                  <div className="relative">
                    <select value={district} onChange={e => updateDistrict(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-medium cursor-pointer appearance-none">
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">থানা / উপজেলা <span className="font-normal text-slate-500">(Optional)</span></label>
                  <input type="text" value={thana} onChange={e => updateThana(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-shadow" placeholder="e.g. Dhanmondi" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">সম্পূর্ণ ঠিকানা *</label>
                  <textarea required rows={3} value={address} onChange={e => updateAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none transition-shadow" placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:w-2/5 bg-slate-50 dark:bg-dark-900/50 p-6 sm:p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8">Order Summary</h3>
              
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2">{product.name}</h4>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap gap-1.5 items-center">
                    {selectedColorName && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-500/20">
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: activeColorHex }} />
                        {selectedColorName}
                      </span>
                    )}
                    {Object.entries(selectedVariants)
                      .filter(([k]) => !['color', 'colour', 'colors', 'edition', 'variant', 'রঙ'].includes(k.trim().toLowerCase()))
                      .map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          {k}: {v}
                        </span>
                      ))}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1.5 text-base">৳{basePrice.toFixed(0)}</div>
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
                  <span>ডেলিভারি চার্জ ({deliveryZone === 'inside' ? 'ঢাকার ভিতরে' : `ঢাকার বাইরে - ${district}`})</span>
                  <span className="font-bold text-slate-900 dark:text-white">৳{shippingFee}</span>
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

              <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black text-xl sm:text-2xl py-5 rounded-2xl transition-all shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:-translate-y-1 flex justify-center items-center gap-3 animate-pulse-slow">
                CONFIRM ORDER <ChevronRight size={28} className="animate-bounce-x" />
              </button>
              <div className="flex justify-center gap-2 items-center text-sm text-slate-500 mt-6 font-medium">
                <Shield size={16} /> 100% Safe & Secure Checkout
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Sticky Mobile Order Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
        <button 
          onClick={scrollToCheckout}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xl font-black py-4 px-8 rounded-2xl shadow-2xl shadow-primary-500/40 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 border-b-4 border-primary-700"
        >
          <div className="flex items-center gap-2">
            ORDER NOW <ChevronRight size={24} className="animate-bounce-x" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-primary-100 uppercase tracking-widest">Pay Cash on Delivery</span>
        </button>
      </div>

      {/* Fullscreen Image Zoom Lightbox Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-fade-in"
          onClick={() => {
            setIsImageZoomed(false);
            setZoomScale(1);
          }}
        >
          {/* Header Controls */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between text-white py-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base line-clamp-1">{product.name}</span>
              <span className="text-[11px] sm:text-xs text-white/60">
                {zoomScale > 1 ? 'ট্যাপ করে ১x রিসেট করুন' : 'ছবিতে ট্যাপ করে জুম ইন করুন (২.৫x)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale(prev => (prev === 1 ? 2.5 : 1))}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all border border-white/10"
                title="Toggle Zoom Level"
              >
                {zoomScale === 1 ? (
                  <>
                    <ZoomIn size={16} /> <span>2.5x Zoom</span>
                  </>
                ) : (
                  <>
                    <ZoomOut size={16} /> <span>1x Zoom</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsImageZoomed(false);
                  setZoomScale(1);
                }}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/40 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-xl border border-white/20"
                aria-label="Close image modal"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Center Image Canvas */}
          <div 
            className="relative flex-1 w-full max-w-4xl flex items-center justify-center overflow-auto my-2"
            onClick={() => setZoomScale(prev => (prev === 1 ? 2.5 : 1))}
          >
            <div 
              className={`relative w-full h-[65vh] sm:h-[75vh] max-h-[800px] transition-transform duration-300 ${
                zoomScale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              style={{ transform: `scale(${zoomScale})` }}
            >
              <Image 
                src={currentImage} 
                alt={product.name} 
                fill 
                className="object-contain" 
                priority 
                sizes="(max-width: 1024px) 100vw, 85vw"
              />
            </div>

            {/* Prev / Next Arrows if multiple images */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                    setZoomScale(1);
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all z-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                    setZoomScale(1);
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all z-20"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Footer Controls / Gallery Thumbnails */}
          <div 
            className="w-full max-w-xl flex flex-col items-center gap-2 py-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomScale(1);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx 
                        ? 'border-primary-400 shadow-lg scale-105 ring-2 ring-primary-400/50' 
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] sm:text-xs text-white/50 text-center">
              ট্যাপ করে বন্ধ করতে বাইরে ক্লিক করুন অথবা ESC চাপুন
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
