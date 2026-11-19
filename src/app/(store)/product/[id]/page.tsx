"use client";

import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Shield,
  Truck,
  RefreshCcw,
  ShoppingBag,
  Heart,
  CreditCard,
  CheckCircle2,
  X,
  Send,
  MessageSquarePlus,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Plus,
  Minus,
  Flame,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useReviewStore } from '@/store/reviewStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useHomepageStore } from '@/store/homepageStore';
import * as fpixel from '@/lib/fpixel';
import * as gtm from '@/lib/gtm';

// Star Rating Picker Component
const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-125 focus:outline-none"
        >
          <Star
            size={26}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function ProductDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { products, fetchProducts, isLoading: productsLoading } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);
  const {
    reviews,
    isLoading: reviewsLoading,
    isSubmitting,
    submitSuccess,
    fetchReviewsForProduct,
    submitReview,
    resetSubmitState,
  } = useReviewStore();
  const { footer } = useSettingsStore();
  const { content } = useHomepageStore();
  const showTrustBadges = content.visibility?.productTrustBadges !== false;

  const product = products.find((p) => p.id === id);

  // States
  const [activeImage, setActiveImage] = useState(0);
  const [colorImageUrl, setColorImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState<'inside' | 'outside'>('inside');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping' | 'reviews'>('details');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  // Sticky CTA Observer
  const [showStickyCta, setShowStickyCta] = useState(false);
  const inlineCtaRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch product & track views
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Update Mart`;
      fpixel.event('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BDT',
      });
      gtm.trackViewItem(product);
    }
    window.scrollTo(0, 0);
    if (id) fetchReviewsForProduct(id);
  }, [id, product, fetchReviewsForProduct]);

  // Fetch products if store is empty on hard reload
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Observer for sticky mobile CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowStickyCta(true);
        } else {
          setShowStickyCta(false);
        }
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    if (inlineCtaRef.current) {
      observer.observe(inlineCtaRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Review submission reset
  useEffect(() => {
    if (submitSuccess && id) {
      fetchReviewsForProduct(id);
      setReviewName('');
      setReviewRating(5);
      setReviewContent('');
      setTimeout(() => {
        setShowReviewModal(false);
        resetSubmitState();
      }, 2000);
    }
  }, [submitSuccess, id, fetchReviewsForProduct, resetSubmitState]);

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-dark-900">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-slate-500 mb-6">প্রোডাক্টটি স্টক আউট বা সরিয়ে নেওয়া হতে পারে।</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-xl transition shadow-md shadow-primary-500/20"
        >
          <ArrowLeft size={18} /> সব পণ্য দেখুন
        </Link>
      </div>
    );
  }

  // Variant Calculations
  const variantGroups = (product.variants || []).reduce<Record<string, typeof product.variants>>((acc, v) => {
    if (!v) return acc;
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name]!.push(v);
    return acc;
  }, {});

  const selectedVariantObj = (product.variants || []).find((v) => {
    if (!v) return false;
    const selected = selectedVariants[v.name];
    return selected === v.value;
  });

  const images = product.images?.length ? product.images : [product.image];
  const colors = product.colors || [];

  const effectivePrice = selectedVariantObj?.price ? Number(selectedVariantObj.price) : product.price;

  const siblingProducts = product.variantGroupId
    ? products.filter((p) => p.variantGroupId === product.variantGroupId)
    : [];

  const originalPrice = product.regularPrice || Math.round(effectivePrice * 1.35);
  const savings = originalPrice > effectivePrice ? originalPrice - effectivePrice : 0;
  const discountPercent = savings > 0 ? Math.round((savings / originalPrice) * 100) : 0;
  const totalPrice = effectivePrice * quantity;

  // Delivery charge estimate
  const deliveryFee = product.isFreeDelivery
    ? 0
    : product.customDeliveryCharge !== null && product.customDeliveryCharge !== undefined
    ? Number(product.customDeliveryCharge)
    : deliveryLocation === 'inside'
    ? 60
    : 120;

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || !product.category))
    .slice(0, 4);

  // Cart and Order Actions
  const addToCartInternal = () => {
    const variantLabel = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    const actualColor = selectedColor || product.primaryColor?.name || colors[0]?.name || 'Standard';
    const finalVariant = [actualColor !== 'Standard' ? `${actualColor}` : 'Standard', variantLabel]
      .filter(Boolean)
      .join(' | ');

    fpixel.event('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: totalPrice,
      currency: 'BDT',
    });
    gtm.trackAddToCart(product, quantity, finalVariant);

    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: colorImageUrl || images[activeImage] || product.image,
      quantity,
      variant: finalVariant,
      isFreeDelivery: product.isFreeDelivery,
      customDeliveryCharge: product.customDeliveryCharge,
    });
  };

  const handleAddToCart = () => {
    addToCartInternal();
    router.push('/cart');
  };

  const handleBuyNow = () => {
    addToCartInternal();
    fpixel.event('InitiateCheckout');
    router.push('/checkout');
  };

  // WhatsApp Order Handler
  const handleWhatsAppOrder = () => {
    const phone = footer?.phone?.replace(/[^0-9]/g, '') || '8801700000000';
    const variantLabel = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    const actualColor = selectedColor || product.primaryColor?.name || colors[0]?.name || 'Standard';
    const fullVariant = [actualColor !== 'Standard' ? `${actualColor}` : 'Standard', variantLabel]
      .filter(Boolean)
      .join(' | ');

    const text = encodeURIComponent(
      `আসসালামু আলাইকুম! আমি Update Mart থেকে এই পণ্যটি অর্ডার করতে চাই:\n\n` +
      `📦 *প্রোডাক্ট:* ${product.name}\n` +
      `🏷️ *ভ্যারিয়েন্ট:* ${fullVariant}\n` +
      `🔢 *পরিমাণ:* ${quantity} টি\n` +
      `💰 *মোট দাম:* ৳${totalPrice}\n` +
      `📍 *ডেলিভারি এরিয়া:* ${deliveryLocation === 'inside' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকার বাইরে'}\n` +
      `🔗 *প্রোডাক্ট লিংক:* ${typeof window !== 'undefined' ? window.location.href : ''}`
    );

    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Copy product link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewContent.trim()) return;
    await submitReview({
      product_id: id,
      product_name: product.name,
      name: reviewName.trim(),
      rating: reviewRating,
      content: reviewContent.trim(),
    });
  };

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
    : Number(product.rating) || 5.0;

  return (
    <div className="bg-[#fcfcfd] dark:bg-dark-900 min-h-screen transition-colors pb-24 sm:pb-16">
      {/* 1. Breadcrumbs & Header Actions */}
      <div className="border-b border-slate-200/80 dark:border-white/5 bg-white dark:bg-dark-900/60 sticky top-16 z-20 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            <Link href="/" className="hover:text-primary-500 whitespace-nowrap transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
            <Link href="/products" className="hover:text-primary-500 whitespace-nowrap transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                <Link
                  href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-primary-500 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0 hidden sm:inline" />
            <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px] hidden sm:inline">
              {product.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              title="লিংক কপি করুন"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition text-xs font-semibold"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'কপি হয়েছে!' : 'Share'}</span>
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              title="উইশলিস্টে রাখুন"
              className={`p-2 rounded-full transition ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10'
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400'
              }`}
            >
              <Heart size={16} className={isWishlisted ? 'fill-rose-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ================= LEFT: MEDIA GALLERY ================= */}
          <div className="lg:w-[52%] flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32 self-start">
            {/* Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 md:w-20 lg:w-24 overflow-x-auto no-scrollbar md:overflow-visible flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveImage(i);
                    setColorImageUrl(null);
                  }}
                  className={`relative w-18 h-18 sm:w-20 sm:h-20 md:w-full md:aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 bg-white dark:bg-dark-800 ${
                    activeImage === i && !colorImageUrl
                      ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20 scale-102'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="flex-1 relative bg-white dark:bg-dark-800 rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm group">
              {/* Badges on Image */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {savings > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-[11px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md shadow-rose-500/25">
                    Save {discountPercent}%
                  </span>
                )}
                {product.isFreeDelivery && (
                  <span className="bg-emerald-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md shadow-emerald-600/20 flex items-center gap-1">
                    <Truck size={12} /> Free Delivery
                  </span>
                )}
              </div>

              {/* Expand Lightbox Button */}
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-dark-900 shadow-md transition-all hover:scale-105"
                title="বড় করে দেখুন"
              >
                <ZoomIn size={18} />
              </button>

              {/* Main Image with Zoom Trigger */}
              <div
                onClick={() => setShowLightbox(true)}
                className="relative aspect-square w-full cursor-zoom-in flex items-center justify-center p-4 sm:p-6"
              >
                <Image
                  src={colorImageUrl || images[activeImage]}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Mobile Image Indicator */}
              <div className="md:hidden absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {activeImage + 1} / {images.length}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT INFO & PURCHASE ================= */}
          <div className="lg:w-[48%] flex flex-col">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-500/20">
                <Sparkles size={13} />
                {product.brand || 'Update Mart Official'}
              </span>

              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                In Stock • রেডি স্টক
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-3">
              {product.name}
            </h1>

            {/* Rating & Social Urgency */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 pb-5 border-b border-slate-200/80 dark:border-white/5 text-sm">
              <a
                href="#reviews"
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline"
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < Math.round(avgRating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }
                    />
                  ))}
                </div>
                <span className="text-slate-900 dark:text-white ml-0.5">{avgRating.toFixed(1)}</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">({reviews.length} রিভিউ)</span>
              </a>

              <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-white/10" />

              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg">
                <Flame size={14} className="fill-rose-500 text-rose-500 animate-bounce" />
                <span>আজকে ১৪ জন এই পণ্যটি দেখেছেন</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-white dark:bg-dark-800 border border-slate-200/90 dark:border-white/10 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-primary-500 dark:text-primary-400 tracking-tight">
                  ৳{effectivePrice.toLocaleString('en-US')}
                </span>
                {savings > 0 && (
                  <span className="text-xl sm:text-2xl text-slate-400 dark:text-slate-500 font-semibold line-through">
                    ৳{originalPrice.toLocaleString('en-US')}
                  </span>
                )}
                {savings > 0 && (
                  <span className="ml-auto bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    সাশ্রয় ৳{savings.toLocaleString('en-US')}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={14} /> ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পেমেন্ট)
                </span>
                {quantity > 1 && (
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    মোট: ৳{totalPrice.toLocaleString('en-US')} ({quantity} টি)
                  </span>
                )}
              </div>
            </div>

            {/* Sibling Products / Color Options */}
            {(siblingProducts.length > 0 || colors.length > 0 || product.primaryColor) && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    কালার / ভ্যারিয়েন্ট:{' '}
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      {product.primaryColor?.name || selectedColor || colors[0]?.name || 'Standard'}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {siblingProducts.length > 0
                    ? siblingProducts.map((sibling) => (
                        <Link
                          href={`/product/${sibling.id}`}
                          key={sibling.id}
                          className={`w-11 h-11 rounded-full p-1 border-2 transition-all duration-200 flex items-center justify-center ${
                            sibling.id === product.id
                              ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20 scale-110'
                              : 'border-slate-200 dark:border-dark-700 hover:border-slate-400 opacity-80 hover:opacity-100'
                          }`}
                          title={sibling.primaryColor?.name || sibling.name}
                        >
                          <div
                            className="w-full h-full rounded-full shadow-inner flex items-center justify-center text-xs font-bold bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 overflow-hidden"
                            style={sibling.primaryColor ? { backgroundColor: sibling.primaryColor.hex } : {}}
                          >
                            {!sibling.primaryColor && sibling.name.charAt(0)}
                          </div>
                        </Link>
                      ))
                    : colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => {
                            setSelectedColor(c.name);
                            setColorImageUrl(c.imageUrl || null);
                          }}
                          className={`w-11 h-11 rounded-full p-1 border-2 transition-all duration-200 ${
                            (selectedColor || colors[0]?.name) === c.name
                              ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20 scale-110'
                              : 'border-slate-200 dark:border-dark-700 hover:border-slate-400 opacity-80 hover:opacity-100'
                          }`}
                          title={c.name}
                        >
                          <div
                            className="w-full h-full rounded-full shadow-inner border border-black/10"
                            style={{ backgroundColor: c.hex }}
                          />
                        </button>
                      ))}
                </div>
              </div>
            )}

            {/* Dynamic Attributes / Variant Selectors */}
            {Object.entries(variantGroups).map(([typeName, typeVariants]) => {
              const selected = selectedVariants[typeName];
              return (
                <div key={typeName} className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {typeName}:{' '}
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {selected || 'নির্বাচন করুন'}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {(typeVariants || []).map((v) => {
                      const isSelected = selected === v.value;
                      const hasCustomPrice = !!v.price;
                      return (
                        <button
                          key={v.value}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [typeName]: v.value }))}
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/20 scale-102'
                              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:border-primary-300'
                          }`}
                        >
                          {v.value}
                          {hasCustomPrice && (
                            <span
                              className={`text-[11px] font-semibold ${
                                isSelected ? 'text-primary-100' : 'text-slate-400'
                              }`}
                            >
                              +৳{Number(v.price).toLocaleString('en-US')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quantity Selector */}
            <div className="mb-6">
              <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2.5">পরিমাণ (Quantity)</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-dark-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-extrabold text-base text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  সর্বোচ্চ স্টক উপলব্ধ আছে
                </span>
              </div>
            </div>

            {/* Delivery Location Selector */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-dark-800/60 border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary-500" /> ডেলিভারি লোকেশন সিলেক্ট করুন:
                </span>
                <span className="text-primary-600 dark:text-primary-400 font-extrabold">
                  {deliveryFee === 0 ? 'ফ্রি ডেলিভারি' : `ডেলিভারি চার্জ: ৳${deliveryFee}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('inside')}
                  className={`p-3 rounded-xl border text-left transition text-xs flex flex-col gap-1 ${
                    deliveryLocation === 'inside'
                      ? 'border-primary-500 bg-white dark:bg-dark-800 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-dark-900/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white">ঢাকা সিটি (২৪-৪৮ ঘণ্টা)</span>
                  <span className="text-[11px] text-slate-500">
                    {product.isFreeDelivery ? '৳০ ফ্রি' : 'চার্জ ৳৬০'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryLocation('outside')}
                  className={`p-3 rounded-xl border text-left transition text-xs flex flex-col gap-1 ${
                    deliveryLocation === 'outside'
                      ? 'border-primary-500 bg-white dark:bg-dark-800 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-dark-900/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white">ঢাকার বাইরে (২-৩ দিন)</span>
                  <span className="text-[11px] text-slate-500">
                    {product.isFreeDelivery ? '৳০ ফ্রি' : 'চার্জ ৳১২০'}
                  </span>
                </button>
              </div>
            </div>

            {/* CTAs (Inline Action Box) */}
            <div ref={inlineCtaRef} className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleBuyNow}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-base sm:text-lg py-4 px-6 rounded-2xl transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <span>অর্ডার করুন (Buy Now)</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  ৳{totalPrice.toLocaleString('en-US')}
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} /> কার্টে যোগ করুন
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle size={18} /> হোয়াটসঅ্যাপে অর্ডার
                </button>
              </div>
            </div>

            {/* Customer Trust Badges */}
            {showTrustBadges && (
              <div className="grid grid-cols-3 gap-2 py-5 border-y border-slate-200/80 dark:border-white/10 mb-8 bg-slate-50/50 dark:bg-dark-800/30 rounded-2xl px-2">
                <div className="flex flex-col items-center text-center gap-1.5 p-2">
                  <Shield size={22} className="text-primary-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">১০০% অরিজিনাল</span>
                  <span className="text-[10px] text-slate-500">গ্যারান্টিযুক্ত পণ্য</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5 p-2 border-x border-slate-200/80 dark:border-white/10">
                  <RefreshCcw size={22} className="text-primary-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">৭ দিনের রিটার্ন</span>
                  <span className="text-[10px] text-slate-500">সহজ রিপ্লেসমেন্ট</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5 p-2">
                  <CreditCard size={22} className="text-primary-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">ক্যাশ অন ডেলিভারি</span>
                  <span className="text-[10px] text-slate-500">সারা বাংলাদেশে</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= LOWER: PRODUCT SPECS & DETAILS TABS ================= */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-slate-200/80 dark:border-white/10">
          {/* Segmented Tab Headers */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              বিস্তারিত তথ্য (Description)
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              স্পেসিফিকেশন (Specifications)
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ডেলিভারি ও রিটার্ন পলিসি
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              id="reviews"
              className={`pb-3.5 px-4 font-bold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              রিভিউ ({reviews.length})
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'details' && (
            <div className="max-w-4xl bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 leading-relaxed text-slate-700 dark:text-slate-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">প্রোডাক্ট ওভারভিউ</h3>
              {product.description ? (
                <div className="space-y-3">
                  {product.description.split('\n').filter((l) => l.trim()).map((line, idx) => (
                    <p key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                      <span>{line.trim()}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">এই প্রোডাক্টের বিস্তারিত বিবরণ শীঘ্রই যুক্ত করা হবে।</p>
              )}

              {product.materialsAndCare && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">উপাদান ও যত্ন (Materials & Care)</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {product.materialsAndCare}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Specifications Table */}
          {activeTab === 'specs' && (
            <div className="max-w-3xl bg-white dark:bg-dark-800 rounded-3xl border border-slate-200/80 dark:border-white/5 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                <div className="grid grid-cols-3 p-4 text-sm bg-slate-50/50 dark:bg-dark-900/30">
                  <span className="font-bold text-slate-500 dark:text-slate-400">ব্র্যান্ড (Brand)</span>
                  <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                    {product.brand || 'Update Mart'}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-bold text-slate-500 dark:text-slate-400">ক্যাটাগরি (Category)</span>
                  <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                    {product.category || 'Lifestyle & Tech'}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-4 text-sm bg-slate-50/50 dark:bg-dark-900/30">
                  <span className="font-bold text-slate-500 dark:text-slate-400">ওয়ারেন্টি (Warranty)</span>
                  <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                    {product.warranty || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'}
                  </span>
                </div>
                {product.specs &&
                  product.specs.map((spec, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-3 p-4 text-sm ${
                        i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-dark-900/30'
                      }`}
                    >
                      <span className="font-bold text-slate-500 dark:text-slate-400">{spec.key}</span>
                      <span className="col-span-2 font-semibold text-slate-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab 3: Shipping & Returns */}
          {activeTab === 'shipping' && (
            <div className="max-w-4xl bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 space-y-6">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Truck size={18} className="text-primary-500" /> ডেলিভারি নিয়মাবলী
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li><strong>ঢাকা সিটির ভেতরে:</strong> ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয় (চার্জ ৬০ টাকা)।</li>
                  <li><strong>ঢাকার বাইরে (সমগ্র বাংলাদেশ):</strong> ২ থেকে ৩ কার্যদিবসের মধ্যে হোম ডেলিভারি প্রদান করা হয় (চার্জ ১২০ টাকা)।</li>
                  <li>ডেলিভারির সময় ডেলিভারিম্যানের সামনে পণ্য চেক করে নেওয়া যাবে।</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <RefreshCcw size={18} className="text-primary-500" /> রিটার্ন ও এক্সচেঞ্জ পলিসি
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  পণ্য হাতে পাওয়ার পর কোনো ত্রুটি বা সমস্যা থাকলে ২৪ ঘণ্টার মধ্যে আমাদের সাপোর্ট নাম্বারে অথবা WhatsApp-এ মেসেজ দিন। কোনো অতিরিক্ত চার্জ ছাড়াই আমরা দ্রুত এক্সচেঞ্জ অথবা রিফান্ড নিশ্চিত করব।
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Reviews Section */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-dark-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 mb-8">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                      {avgRating > 0 ? avgRating.toFixed(1) : '5.0'}
                    </span>
                    <div className="flex items-center justify-center mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className={
                            i < Math.round(avgRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      {reviews.length} টি ভেরিফাইড রিভিউ
                    </span>
                  </div>
                  <div className="hidden sm:block w-px h-16 bg-slate-200 dark:bg-slate-700" />
                  <div className="hidden sm:block">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">গ্রাহকদের বিশ্বস্ত মতামত</h3>
                    <p className="text-xs text-slate-500">প্রকৃত ক্রেতাদের দেওয়া রেটিং ও রিভিউ দেখুন।</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-md"
                >
                  <MessageSquarePlus size={18} /> রিভিউ লিখুন
                </button>
              </div>

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-8">
                  <MessageSquarePlus size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">এখনো কোনো রিভিউ যোগ করা হয়নি</h4>
                  <p className="text-xs text-slate-500 mb-4">পণ্যটি সম্পর্কে সবার আগে আপনার অভিজ্ঞতা শেয়ার করুন!</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold rounded-xl text-xs hover:bg-primary-600 transition"
                  >
                    প্রথম রিভিউ দিন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((r, idx) => {
                    const initials = r.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={r.id}
                        className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs">
                              {initials}
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</h5>
                              <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 size={11} className="mr-1" /> ভেরিফাইড ক্রেতা
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(r.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          &quot;{r.content}&quot;
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RELATED PRODUCTS (UPSELL) ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">সম্পর্কিত অন্যান্য পণ্য</h3>
                <p className="text-xs text-slate-500 mt-1">আপনার পছন্দের ক্যাটাগরির সেরা কালেকশন</p>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                সবগুলো দেখুন <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  name={rel.name}
                  price={rel.price}
                  image={rel.image}
                  rating={rel.rating || 4.8}
                  isNew={rel.isNew}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= LIGHTBOX IMAGE MODAL ================= */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-50"
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-3xl aspect-square max-h-[85vh]">
            <Image
              src={colorImageUrl || images[activeImage]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* ================= REVIEW SUBMIT MODAL ================= */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative"
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-500 hover:text-slate-800 transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">পণ্যটির রিভিউ দিন</h3>
            <p className="text-xs text-slate-500 mb-6 truncate">{product.name}</p>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">ধন্যবাদ!</h4>
                <p className="text-xs text-slate-500">আপনার মূল্যবান রিভিউটি সফলভাবে সাবমিট হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রেটিং সিলেক্ট করুন *
                  </label>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    আপনার অভিজ্ঞতা বা মতামত *
                  </label>
                  <textarea
                    required
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="পণ্যটির মান ও ডেলিভারি কেমন লেগেছে তা লিখুন..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md shadow-primary-500/20"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} /> সাবমিট রিভিউ
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= STICKY MOBILE BOTTOM BAR ================= */}
      <div
        className={`fixed left-0 right-0 z-40 p-2 sm:hidden transition-all duration-300 pointer-events-none ${
          showStickyCta ? 'bottom-16 opacity-100 translate-y-0' : 'bottom-0 opacity-0 translate-y-12'
        }`}
      >
        <div className="bg-white/95 dark:bg-dark-900/95 backdrop-blur-lg border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 mx-1 flex items-center gap-2.5 pointer-events-auto">
          {/* Thumb */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 flex-shrink-0 border border-slate-200 dark:border-white/5">
            <Image
              src={colorImageUrl || images[activeImage] || product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Title & Price */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
            <p className="text-sm font-black text-primary-500">৳{totalPrice.toLocaleString('en-US')}</p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center bg-slate-100 dark:bg-dark-800 rounded-xl p-0.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-primary-500/25 whitespace-nowrap"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </div>
  );
}
