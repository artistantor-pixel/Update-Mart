"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Truck,
  ShoppingBag,
  Heart,
  CheckCircle2,
  X,
  Send,
  MessageSquarePlus,
  Share2,
  Check,
  Plus,
  Minus,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useReviewStore } from '@/store/reviewStore';
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
            size={24}
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

  const product = products.find((p) => p.id === id);

  // States
  const [activeImage, setActiveImage] = useState(0);
  const [colorImageUrl, setColorImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
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
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
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
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-dark-900">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-slate-500 text-sm mb-6">প্রোডাক্টটি স্টক আউট বা সরিয়ে নেওয়া হতে পারে।</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm"
        >
          <ArrowLeft size={16} /> সব পণ্য দেখুন
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

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
    <div className="bg-white dark:bg-dark-900 min-h-screen transition-colors pb-24 sm:pb-20">
      {/* 1. Minimal Breadcrumb Navigation */}
      <div className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-dark-900/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              Home
            </Link>
            <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
            <Link href="/products" className="hover:text-primary-500 transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                <Link
                  href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-primary-500 font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0 hidden sm:inline" />
            <span className="text-slate-900 dark:text-white font-medium truncate max-w-[220px] hidden sm:inline">
              {product.name}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Share link"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-dark-800 text-slate-500 dark:text-slate-400 transition"
            >
              {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span className="text-[11px] font-medium">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              title="Wishlist"
              className={`p-1.5 rounded-lg transition ${
                isWishlisted
                  ? 'text-rose-500'
                  : 'text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'
              }`}
            >
              <Heart size={15} className={isWishlisted ? 'fill-rose-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        {/* ================= PRIMARY GRID (56% Gallery : 44% Info) ================= */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
          
          {/* ================= LEFT: PRODUCT GALLERY (Dominant, Focused) ================= */}
          <div className="w-full lg:w-[56%] flex flex-col-reverse md:flex-row gap-3 sm:gap-4 lg:sticky lg:top-24">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2.5 md:w-20 lg:w-22 overflow-x-auto no-scrollbar md:overflow-visible flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImage(i);
                      setColorImageUrl(null);
                    }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-full md:aspect-square rounded-2xl overflow-hidden border transition-all duration-200 flex-shrink-0 bg-slate-50 dark:bg-dark-800 ${
                      activeImage === i && !colorImageUrl
                        ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                        : 'border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="88px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Hero Image */}
            <div className="flex-1 relative bg-slate-50/70 dark:bg-dark-800/80 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden group">
              {/* Discrete discount tag if on sale */}
              {savings > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              {/* Lightbox Trigger */}
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-dark-900 transition-all opacity-0 group-hover:opacity-100 shadow-xs"
                title="Zoom view"
              >
                <ZoomIn size={16} />
              </button>

              {/* Product Visual Centerpiece */}
              <div
                onClick={() => setShowLightbox(true)}
                className="relative aspect-square w-full cursor-zoom-in flex items-center justify-center p-6 sm:p-8"
              >
                <Image
                  src={colorImageUrl || images[activeImage]}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-103"
                  sizes="(max-width: 768px) 100vw, 56vw"
                />
              </div>

              {/* Mobile Image Index Dot */}
              {images.length > 1 && (
                <div className="md:hidden absolute bottom-3 right-3 bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT ESSENTIALS & PURCHASE ================= */}
          <div className="w-full lg:w-[44%] flex flex-col pt-1">
            
            {/* Category / Collection Tag */}
            {product.category && (
              <div className="mb-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-primary-500 dark:text-primary-400">
                  {product.category}
                </span>
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-3">
              {product.name}
            </h1>

            {/* Subtle Rating summary */}
            <div className="flex items-center gap-2 mb-5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(avgRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }
                  />
                ))}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{avgRating.toFixed(1)}</span>
              <span>•</span>
              <a
                href="#reviews"
                onClick={() => setActiveTab('reviews')}
                className="hover:text-primary-500 transition-colors"
              >
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </a>
            </div>

            {/* Price Presentation (Clean, uncluttered, prominent) */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary-500 dark:text-primary-400 tracking-tight">
                ৳{effectivePrice.toLocaleString('en-US')}
              </span>
              {savings > 0 && (
                <span className="text-lg sm:text-xl text-slate-400 dark:text-slate-500 font-normal line-through">
                  ৳{originalPrice.toLocaleString('en-US')}
                </span>
              )}
            </div>

            {/* Color / Variant Swatches */}
            {(siblingProducts.length > 0 || colors.length > 0 || product.primaryColor) && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Color:{' '}
                    <span className="text-slate-900 dark:text-white font-medium">
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
                          className={`w-9 h-9 rounded-full p-0.5 border-2 transition-all flex items-center justify-center ${
                            sibling.id === product.id
                              ? 'border-primary-500 scale-105 shadow-xs'
                              : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                          }`}
                          title={sibling.primaryColor?.name || sibling.name}
                        >
                          <div
                            className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300"
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
                          className={`w-9 h-9 rounded-full p-0.5 border-2 transition-all ${
                            (selectedColor || colors[0]?.name) === c.name
                              ? 'border-primary-500 scale-105 shadow-xs'
                              : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                          }`}
                          title={c.name}
                        >
                          <div
                            className="w-full h-full rounded-full border border-black/10"
                            style={{ backgroundColor: c.hex }}
                          />
                        </button>
                      ))}
                </div>
              </div>
            )}

            {/* Attributes / Options (Size, Specs, etc.) */}
            {Object.entries(variantGroups).map(([typeName, typeVariants]) => {
              const selected = selectedVariants[typeName];
              return (
                <div key={typeName} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {typeName}:{' '}
                      <span className="text-slate-900 dark:text-white font-medium">
                        {selected || 'Select an option'}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(typeVariants || []).map((v) => {
                      const isSelected = selected === v.value;
                      const hasCustomPrice = !!v.price;
                      return (
                        <button
                          key={v.value}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [typeName]: v.value }))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500 text-white shadow-xs'
                              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {v.value}
                          {hasCustomPrice && (
                            <span
                              className={`ml-1 text-[10px] ${
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

            {/* ================= PURCHASE ACTION BLOCK ================= */}
            <div ref={inlineCtaRef} className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Counter */}
                <div className="flex items-center bg-slate-50 dark:bg-dark-800 border border-slate-200/80 dark:border-white/10 rounded-2xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-dark-700 disabled:opacity-25 transition shadow-2xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-dark-700 transition shadow-2xs"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={17} />
                  <span>কার্টে যোগ করুন</span>
                </button>
              </div>

              {/* Buy Now (Primary Dominant Button) */}
              <button
                onClick={handleBuyNow}
                className="w-full h-13.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-2xl transition-all shadow-md shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>অর্ডার করুন (Buy Now)</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                  ৳{totalPrice.toLocaleString('en-US')}
                </span>
              </button>

              {/* Minimal Delivery Status line */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <Truck size={14} className="text-primary-500 flex-shrink-0" />
                <span>
                  {product.isFreeDelivery
                    ? 'ফ্রি ডেলিভারি প্রযোজ্য • সারাদেশে ক্যাশ অন ডেলিভারি'
                    : 'সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা (ঢাকা ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন)'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= LOWER: PRODUCT DETAILS & REVIEWS TABS ================= */}
        <div className="mt-16 lg:mt-24 pt-8 border-t border-slate-100 dark:border-white/5 max-w-4xl">
          {/* Segmented Tab Headers */}
          <div className="flex items-center gap-6 border-b border-slate-100 dark:border-white/5 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition-all ${
                activeTab === 'specs'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              id="reviews"
              className={`pb-3 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'details' && (
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
              {product.description ? (
                <div className="space-y-2.5">
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
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">Materials & Care</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {product.materialsAndCare}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                <div className="grid grid-cols-3 p-3.5 bg-slate-50/60 dark:bg-dark-800/40">
                  <span className="font-medium text-slate-400">Brand</span>
                  <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                    {product.brand || 'Update Mart'}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3.5">
                  <span className="font-medium text-slate-400">Category</span>
                  <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                    {product.category || 'General'}
                  </span>
                </div>
                {product.warranty && (
                  <div className="grid grid-cols-3 p-3.5 bg-slate-50/60 dark:bg-dark-800/40">
                    <span className="font-medium text-slate-400">Warranty</span>
                    <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                      {product.warranty}
                    </span>
                  </div>
                )}
                {product.specs &&
                  product.specs.map((spec, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-3 p-3.5 ${
                        i % 2 === 0 ? '' : 'bg-slate-50/60 dark:bg-dark-800/40'
                      }`}
                    >
                      <span className="font-medium text-slate-400">{spec.key}</span>
                      <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">{spec.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Customer Reviews</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Real feedback from verified buyers</p>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-2xs"
                >
                  <MessageSquarePlus size={15} /> Write a Review
                </button>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6">
                  <p className="text-xs text-slate-400 mb-3">No reviews yet for this product.</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white font-semibold rounded-xl text-xs hover:bg-primary-600 transition"
                  >
                    Be the first to review
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {reviews.map((r) => {
                    const initials = r.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={r.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-dark-800/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs">
                              {initials}
                            </div>
                            <div>
                              <h5 className="font-semibold text-xs text-slate-900 dark:text-white">{r.name}</h5>
                              <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={10} className="mr-0.5" /> Verified
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
          <div className="mt-16 sm:mt-20 pt-10 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">You Might Also Like</h3>
              <Link
                href="/products"
                className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-0.5"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
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
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-50"
          >
            <X size={22} />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-dark-800 rounded-3xl shadow-xl w-full max-w-md p-6 relative"
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-500 hover:text-slate-800 transition"
            >
              <X size={15} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Write a Review</h3>
            <p className="text-xs text-slate-400 mb-5 truncate">{product.name}</p>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={26} />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">Thank you!</h4>
                <p className="text-xs text-slate-500">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating *
                  </label>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Tell us what you like about this product..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} /> Submit Review
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
        <div className="bg-white/95 dark:bg-dark-900/95 backdrop-blur-lg border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xl p-2 mx-1 flex items-center gap-2.5 pointer-events-auto">
          {/* Thumb */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 flex-shrink-0 border border-slate-200/60 dark:border-white/5">
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
            <p className="text-sm font-extrabold text-primary-500">৳{totalPrice.toLocaleString('en-US')}</p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center bg-slate-100 dark:bg-dark-800 rounded-xl p-0.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              <Minus size={11} />
            </button>
            <span className="w-4 text-center text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs whitespace-nowrap"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </div>
  );
}
