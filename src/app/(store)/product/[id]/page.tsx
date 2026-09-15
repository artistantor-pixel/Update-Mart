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
  const { products } = useProductStore();
  const addItem = useCartStore(state => state.addItem);
  const { reviews, isLoading: reviewsLoading, isSubmitting, submitSuccess, fetchReviewsForProduct, submitReview, resetSubmitState } = useReviewStore();

  const product = products.find(p => p.id === id) || products[0]; // fallback to first product if not found

  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // State for gallery and variants
  const [activeImage, setActiveImage] = useState(0);
  const [colorImageUrl, setColorImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  // Map of variant type -> selected value, e.g. { Color: 'Black', Size: 'Large' }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

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

  const handleAddToCart = () => {
    const variantLabel = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      quantity: 1,
      variant: variantLabel || selectedColor || '',
    });
    router.push('/cart');
  };

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

  useEffect(() => {
    document.title = `${product?.name || 'Product Details'} | Update Mart`;
    window.scrollTo(0, 0);
    if (id) fetchReviewsForProduct(id);
  }, [id, product, fetchReviewsForProduct]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewContent.trim()) return;
    await submitReview({
      product_id: id,
      product_name: product?.name || '',
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* ================= LEFT: IMAGE GALLERY ================= */}
          <div className="lg:col-span-6 space-y-4">
            <ZoomImage src={colorImageUrl || images[activeImage]} alt={`Product image ${activeImage + 1}`} />
            
            {/* Thumbnail Slider */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setActiveImage(i);
                    setColorImageUrl(null); // clear color override on thumbnail click
                  }}
                  className={`relative aspect-square bg-slate-100 dark:bg-dark-800 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === i && !colorImageUrl ? 'border-primary-500' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                   <Image src={img} alt={`Thumbnail ${i + 1}`} className={`object-cover w-full h-full transition-opacity ${activeImage === i ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} fill={true} style={{objectFit: "cover"}} />
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT INFO ================= */}
          <div className="lg:col-span-6 flex flex-col">
            
            <div className="flex items-center justify-between mb-3">
              <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold tracking-wider text-xs uppercase px-3 py-1 rounded-full">New Arrival</span>
              <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                In Stock
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={`text-accent-500 ${i < Math.round(avgRating) ? 'fill-accent-500' : 'fill-transparent'}`} />
                ))}
              </div>
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium border-l border-slate-300 dark:border-slate-700 pl-4">
                {avgRating > 0 ? `${avgRating.toFixed(1)} (${reviews.length} Reviews)` : 'No Reviews Yet'}
              </span>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white transition-all">৳{effectivePrice.toFixed(2)}</span>
                {savings > 0 && <span className="text-xl text-slate-400 dark:text-slate-500 line-through mb-1">৳{originalPrice.toFixed(2)}</span>}
              </div>
              {savings > 0 && (
                <p className="text-green-600 dark:text-green-400 font-medium text-sm mt-1">
                  You save ৳{savings.toFixed(2)} ({discountPercent}%)
                  {selectedVariantObj?.price && (
                    <span className="ml-2 text-xs bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
                      Variant price applied
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
                        className={`w-12 h-12 rounded-full p-1 border-2 transition-colors ${sibling.id === product.id ? 'border-primary-500' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}
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
                        className={`w-12 h-12 rounded-full p-1 border-2 transition-colors ${(selectedColor || colors[0]?.name) === color.name ? 'border-primary-500' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}
                        aria-label={`Select ${color.name}`}
                        title={color.name}
                      >
                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.hex }} />
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
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-dark-800'
                          }`}
                        >
                          {v.value}
                          {hasCustomPrice && (
                            <span className={`ml-1.5 text-xs ${
                              isSelected ? 'text-primary-500' : 'text-slate-400'
                            }`}>৳{Number(v.price).toFixed(0)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Delivery Estimator */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-8">
                <Truck className="text-primary-500" size={24} />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Delivery inside Bangladesh</p>
                  <p className="text-xs text-slate-500 mt-1">Free standard shipping on orders over ৳5000.</p>
                </div>
            </div>

            <div className="hidden sm:flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
              <button 
                onClick={() => {
                  const variantLabel = Object.entries(selectedVariants)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ');
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: effectivePrice,
                    image: product.image,
                    quantity: 1,
                    variant: variantLabel || selectedColor || ''
                  });
                  router.push('/checkout');
                }}
                className="flex-1 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Buy It Now
              </button>
              <button className="p-4 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                <Heart size={24} />
              </button>
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
        <div className="mt-24 pt-16 border-t border-slate-200 dark:border-white/10">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className={i < Math.round(avgRating) ? 'text-accent-500 fill-accent-500' : 'text-slate-300 dark:text-slate-600'} />
                  ))}
                </div>
                {reviews.length > 0 ? (
                  <>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{avgRating} / 5</span>
                    <span className="text-slate-500 dark:text-slate-400">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first!</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
            >
              <MessageSquarePlus size={18} />
              Write a Review
            </button>
          </div>

          {/* Reviews Grid */}
          {reviewsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-dark-800 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
              <MessageSquarePlus size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No reviews yet for this product.</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Share your experience to help others!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, idx) => {
                const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const avatarColors = [
                  'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400',
                  'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
                  'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
                  'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400',
                  'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
                ];
                const timeAgo = new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <div key={review.id} className="bg-slate-50 dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 font-bold flex items-center justify-center rounded-full text-sm ${avatarColors[idx % avatarColors.length]}`}>
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{review.name}</h4>
                          <span className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle2 size={12} className="mr-1" /> Verified Buyer
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-slate-300 dark:text-slate-600'} />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">&quot;{review.content}&quot;</p>
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 sm:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <div className="flex-1">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
            >
              Add to Cart
            </button>
          </div>
          <button 
            onClick={() => router.push('/checkout')}
            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium py-3 rounded-xl text-sm"
          >
            Buy Now
          </button>
          <button className="w-12 flex items-center justify-center bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 rounded-xl">
            <Heart size={20} />
          </button>
        </div>
      </div>

    </div>
  );
}
