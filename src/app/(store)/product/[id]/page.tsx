"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star, Shield, Truck, RefreshCcw, ChevronDown, ChevronUp, ShoppingBag, Heart, CreditCard, CheckCircle2, X, Send, MessageSquarePlus } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useReviewStore } from '@/store/reviewStore';

// Accordion Component
const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 dark:border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

// Hover Zoom Image Component
const ZoomImage = ({ src, alt }: { src: string, alt: string }) => {
  const [backgroundPos, setBackgroundPos] = useState('0% 0%');
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPos(`${x}% ${y}%`);
  };

  return (
    <div 
      className="aspect-square bg-slate-100 dark:bg-dark-800 rounded-3xl overflow-hidden relative cursor-zoom-in group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Image 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
      fill={true} style={{objectFit: "cover"}} />
      {isHovering && (
        <div 
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: `url(${src})`, 
            backgroundPosition: backgroundPos,
            backgroundSize: '200%'
          }}
        />
      )}
    </div>
  );
};

// Star Rating Picker Component
const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600'
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
  const { products, isLoading: productsLoading } = useProductStore();
  const addItem = useCartStore(state => state.addItem);
  const { reviews, isLoading: reviewsLoading, isSubmitting, submitSuccess, fetchReviewsForProduct, submitReview, resetSubmitState } = useReviewStore();

  const product = products.find(p => p.id === id); // no fallback to products[0]

  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Sticky CTA state
  const [showStickyCta, setShowStickyCta] = useState(false);
  const inlineCtaRef = useRef<HTMLDivElement>(null);

  // State for gallery and variants
  const [activeImage, setActiveImage] = useState(0);
  const [colorImageUrl, setColorImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  // Map of variant type -> selected value, e.g. { Color: 'Black', Size: 'Large' }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Update Mart`;
    }
    window.scrollTo(0, 0);
    if (id) fetchReviewsForProduct(id);
  }, [id, product, fetchReviewsForProduct]);

  // Observer for sticky CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when inline is out of view (scrolled past it)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowStickyCta(true);
        } else {
          setShowStickyCta(false);
        }
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );

    if (inlineCtaRef.current) {
      observer.observe(inlineCtaRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Re-fetch after successful submit
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
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-40 font-bold text-2xl dark:text-white">Product Not Found</div>;

  // Group variants by type
  const variantGroups = (product.variants || []).reduce<Record<string, typeof product.variants>>((acc, v) => {
    if (!v) return acc;
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name]!.push(v);
    return acc;
  }, {});

  // Find the currently selected variant to get its price override
  const selectedVariantObj = (product.variants || []).find(v => {
    if (!v) return false;
    const selected = selectedVariants[v.name];
    return selected === v.value;
  });

  // Gallery: use product.images if available, else single image
  const images = product.images?.length
    ? product.images
    : [product.image];

  // Colors: use product.colors if available, else empty
  const colors = product.colors || [];

  // Effective price: variant override → product.price
  const effectivePrice = selectedVariantObj?.price
    ? Number(selectedVariantObj.price)
    : product.price;

  // Find sibling products in the same variant group
  const siblingProducts = product.variantGroupId 
    ? products.filter(p => p.variantGroupId === product.variantGroupId)
    : [];
  const originalPrice = product.regularPrice || (product.price * 1.33);
  const savings = originalPrice - effectivePrice;
  const discountPercent = Math.round((savings / originalPrice) * 100);

  // Related products (same category or random, excluding current product and up to 4 items)
  const relatedProducts = products
    .filter(p => p.id !== product.id)
    .sort(() => 0.5 - Math.random()) // shuffle
    .slice(0, 4);

  const addToCartInternal = () => {
    const variantLabel = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    const finalVariant = [selectedColor ? `Color: ${selectedColor}` : '', variantLabel].filter(Boolean).join(' | ');
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      quantity: 1,
      variant: finalVariant,
    });
  };

  const handleAddToCart = () => {
    addToCartInternal();
    router.push('/cart');
  };

  const handleBuyNow = () => {
    addToCartInternal();
    router.push('/checkout');
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
    : 0;

  if (!product) return <div className="text-center py-40 font-bold text-2xl dark:text-white">Product Not Found</div>;

  return (
    <div className="bg-white dark:bg-dark-900 pb-20 sm:pb-10 transition-colors relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <Link href="/products" className="inline-flex items-center text-slate-500 hover:text-primary-500 mb-8 transition-colors font-medium">
          <ArrowLeft size={16} className="mr-2" /> Back to Catalog
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          
          {/* ================= LEFT: IMAGE GALLERY ================= */}
          <div className="lg:w-[55%] flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnail Slider */}
            <div className="flex md:flex-col gap-3 md:w-24 overflow-x-auto custom-scrollbar md:overflow-visible flex-shrink-0 pb-2 md:pb-0">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setActiveImage(i);
                    setColorImageUrl(null); // clear color override on thumbnail click
                  }}
                  className={`relative w-20 h-20 md:w-full md:aspect-square bg-slate-100 dark:bg-dark-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${activeImage === i && !colorImageUrl ? 'border-primary-500 shadow-md ring-4 ring-primary-500/10' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100'}`}
                >
                   <Image src={img} alt={`Thumbnail ${i + 1}`} className="object-cover w-full h-full" fill={true} style={{objectFit: "cover"}} />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 w-full">
              <ZoomImage src={colorImageUrl || images[activeImage]} alt={`Product image ${activeImage + 1}`} />
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT INFO ================= */}
          <div className="lg:w-[45%] flex flex-col lg:sticky lg:top-28 self-start">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className="bg-primary-500 text-white font-bold tracking-widest text-[10px] uppercase px-3 py-1.5 rounded-full shadow-sm shadow-primary-500/30">New Arrival</span>
                {savings > 0 && <span className="bg-rose-500 text-white font-bold tracking-widest text-[10px] uppercase px-3 py-1.5 rounded-full shadow-sm shadow-rose-500/30">Sale</span>}
              </div>
              <span className="flex items-center bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-2"></span>
                In Stock
              </span>
            </div>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                {product.name}
              </h1>
              <button className="hidden sm:flex mt-1 p-3 bg-slate-50 dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-rose-500 text-slate-400 rounded-full transition-all flex-shrink-0 group">
                <Heart size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={`text-accent-500 ${i < Math.round(avgRating) ? 'fill-accent-500' : 'fill-transparent'}`} />
                ))}
              </div>
              <a href="#reviews" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                {avgRating > 0 ? `${avgRating.toFixed(1)} / 5 (${reviews.length} Reviews)` : 'No Reviews Yet'}
              </a>
            </div>

            {/* Pricing */}
            <div className="mb-8 bg-slate-50 dark:bg-dark-800/50 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-black text-primary-500 tracking-tight transition-all">৳{effectivePrice.toFixed(0)}</span>
                {savings > 0 && <span className="text-xl text-slate-400 dark:text-slate-500 font-semibold line-through mb-1">৳{originalPrice.toFixed(0)}</span>}
              </div>
              {savings > 0 && (
                <p className="text-green-600 dark:text-green-400 font-bold text-sm mt-1.5 flex items-center gap-2">
                  <span className="bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-md">Save {discountPercent}%</span>
                  You save ৳{savings.toFixed(0)}
                  {selectedVariantObj?.price && (
                    <span className="text-[10px] uppercase bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300">
                      Variant applied
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Color Swatches (Variant Mapping) */}
            {(siblingProducts.length > 0 || product.primaryColor || colors.length > 0) && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Color: <span className="font-normal text-slate-600 dark:text-slate-400">{product.primaryColor?.name || selectedColor || colors[0]?.name || 'Standard'}</span></h3>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {siblingProducts.length > 0 ? (
                    siblingProducts.map(sibling => (
                      <Link
                        href={`/product/${sibling.id}`}
                        key={sibling.id}
                        className={`w-12 h-12 rounded-full p-1 border-2 transition-all duration-200 ${sibling.id === product.id ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20 scale-110' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:scale-105 opacity-80 hover:opacity-100'}`}
                        aria-label={`Select ${sibling.primaryColor?.name || sibling.name}`}
                        title={sibling.primaryColor?.name || sibling.name}
                      >
                        <div className="w-full h-full rounded-full shadow-inner flex items-center justify-center text-xs font-medium bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 overflow-hidden relative" style={sibling.primaryColor ? { backgroundColor: sibling.primaryColor.hex } : {}}>
                          {!sibling.primaryColor && sibling.name.charAt(0)}
                        </div>
                      </Link>
                    ))
                  ) : product.primaryColor ? (
                    <div className="w-12 h-12 rounded-full p-1 border-2 border-primary-500">
                       <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: product.primaryColor.hex }} />
                    </div>
                  ) : colors.length > 0 ? (
                    colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color.name);
                          if (color.imageUrl) {
                            setColorImageUrl(color.imageUrl);
                          } else {
                            setColorImageUrl(null);
                          }
                        }}
                        className={`w-12 h-12 rounded-full p-1 border-2 transition-all duration-200 ${(selectedColor || colors[0]?.name) === color.name ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20 scale-110' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:scale-105 opacity-80 hover:opacity-100'}`}
                        aria-label={`Select ${color.name}`}
                        title={color.name}
                      >
                        <div className="w-full h-full rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color.hex }} />
                      </button>
                    ))
                  ) : null}
                </div>
              </div>
            )}

            {/* Dynamic Variant Selectors */}
            {Object.entries(variantGroups).map(([typeName, typeVariants]) => {
              const selected = selectedVariants[typeName];
              return (
                <div key={typeName} className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    {typeName}: <span className="font-normal text-slate-600 dark:text-slate-400">{selected || 'Select one'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(typeVariants || []).map(v => {
                      const isSelected = selected === v.value;
                      const hasCustomPrice = !!v.price;
                      return (
                        <button
                          key={v.value}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [typeName]: v.value }))}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/30 -translate-y-0.5'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-dark-800'
                          }`}
                        >
                          {v.value}
                          {hasCustomPrice && (
                            <span className={`ml-1.5 text-xs font-semibold ${
                              isSelected ? 'text-primary-100' : 'text-slate-400'
                            }`}>+৳{Number(v.price).toFixed(0)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Action Box: Delivery + CTAs */}
            <div className="bg-slate-50/80 dark:bg-dark-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none mb-8">
              {/* Delivery Estimator */}
              <div className="flex items-center gap-4 bg-white dark:bg-dark-900 p-4 rounded-2xl mb-5 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="text-primary-500" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Delivery inside Bangladesh</p>
                    <p className="text-xs text-slate-500 mt-0.5">Estimated delivery: 2-4 business days.</p>
                  </div>
              </div>

              {/* Inline Action Buttons */}
              <div ref={inlineCtaRef} className="flex flex-col gap-3">
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Buy It Now
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-white dark:bg-dark-700 hover:bg-slate-100 dark:hover:bg-dark-600 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 mb-10 border-y border-slate-200 dark:border-white/10 py-6">
              <div className="flex flex-col items-center text-center gap-2">
                <Shield size={24} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">2 Year<br/>Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 border-x border-slate-200 dark:border-white/10">
                <RefreshCcw size={24} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">30-Day<br/>Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <CreditCard size={24} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Secure<br/>Payment</span>
              </div>
            </div>

            {/* Functional Specs (Accordions) */}
            <div className="mb-4">
              <Accordion title="Product Details" defaultOpen={true}>
                {product.description ? (
                  <p className="mb-4">{product.description}</p>
                ) : (
                  <p className="mb-4 text-slate-500">No product description provided.</p>
                )}
                {product.specs && product.specs.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {product.specs.map((spec, i) => (
                      <li key={i}><strong>{spec.key}:</strong> {spec.value}</li>
                    ))}
                  </ul>
                )}
              </Accordion>
              {product.materialsAndCare && (
                <Accordion title="Materials & Care">
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {product.materialsAndCare}
                  </div>
                </Accordion>
              )}
              {product.shippingAndReturns && (
                <Accordion title="Shipping & Returns">
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {product.shippingAndReturns}
                  </div>
                </Accordion>
              )}
              <Accordion title="Warranty Info">
                <p>{product.warranty ? product.warranty + ' — Covers manufacturing defects. Does not cover normal wear and tear.' : 'No warranty information available.'}</p>
              </Accordion>
            </div>

          </div>
        </div>

        {/* ================= REVIEWS SECTION ================= */}
        <div id="reviews" className="mt-24 pt-16 border-t border-slate-200 dark:border-white/10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-slate-50 dark:bg-dark-800 p-8 rounded-3xl border border-slate-200 dark:border-white/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-slate-900 dark:text-white">{avgRating > 0 ? avgRating.toFixed(1) : '0.0'}</span>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-accent-500 fill-accent-500' : 'text-slate-300 dark:text-slate-600'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</span>
              </div>
              <div className="hidden md:block w-px h-20 bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Customer Reviews</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Real reviews from our awesome customers.</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
            >
              <MessageSquarePlus size={20} />
              Write a Review
            </button>
          </div>

          {/* Reviews Grid */}
          {reviewsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
              <MessageSquarePlus size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No reviews yet for this product.</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, idx) => {
                const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const avatarColors = [
                  'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
                  'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
                  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
                  'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
                  'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
                ];
                const timeAgo = new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <div key={review.id} className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 font-bold flex items-center justify-center rounded-full text-sm ${avatarColors[idx % avatarColors.length]}`}>
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{review.name}</h4>
                          <span className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                            <CheckCircle2 size={12} className="mr-1" /> Verified Buyer
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-dark-700 px-2 py-1 rounded-md">{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-slate-300 dark:text-slate-600'} />
                      ))}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">&quot;{review.content}&quot;</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= REVIEW MODAL ================= */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowReviewModal(false); }}>
            <div ref={modalRef} className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-dark-700 hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors"
              >
                <X size={16} className="text-slate-600 dark:text-slate-300" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Write a Review</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{product?.name}</p>

              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thank you!</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      placeholder="e.g. Ahmed Rahman"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rating *</label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Review *</label>
                    <textarea
                      required
                      value={reviewContent}
                      onChange={e => setReviewContent(e.target.value)}
                      placeholder="Tell others what you think about this product..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20"
                  >
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><Send size={18} /> Submit Review</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================= RELATED PRODUCTS (UPSELLING) ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-slate-200 dark:border-white/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(related => (
                <ProductCard 
                  key={related.id}
                  id={related.id} 
                  name={related.name} 
                  price={related.price} 
                  image={related.image} 
                  rating={related.rating || 4.5} 
                  isNew={related.isNew}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= STICKY MOBILE CTA ================= */}
      <div className={`fixed left-0 right-0 p-3 sm:hidden z-40 transition-all duration-300 pointer-events-none ${showStickyCta ? 'bottom-[80px] opacity-100 translate-y-0' : 'bottom-0 opacity-0 translate-y-8'}`}>
        <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 mx-2 flex gap-2 pointer-events-auto">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag size={18} /> Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium py-3 rounded-xl text-sm"
          >
            Buy Now
          </button>
          <button className="w-12 flex items-center justify-center bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
            <Heart size={20} />
          </button>
        </div>
      </div>

    </div>
  );
}
