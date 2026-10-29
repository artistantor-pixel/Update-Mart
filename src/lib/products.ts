import { supabase } from '@/lib/supabase';
import type { Product } from '@/store/productStore';
import type { HomepageContent } from '@/store/homepageStore';

const safeParse = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const DEFAULT_HOMEPAGE: HomepageContent = {
  hero: {
    banners: [
      {
        id: 'banner-1',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85',
        title: 'Minimalist Flagship Essentials',
        linkUrl: '/products',
        isActive: true,
        order: 1,
      },
      {
        id: 'banner-2',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=85',
        title: 'Future Tech & Smart Peripherals',
        linkUrl: '/products?category=Electronics',
        isActive: true,
        order: 2,
      },
      {
        id: 'banner-3',
        imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=85',
        title: 'Luxury Timepieces & Watches',
        linkUrl: '/products?category=Watches',
        isActive: true,
        order: 3,
      },
    ],
    autoSlideInterval: 5,
    showArrows: true,
    showDots: true,
    badgeText: 'Just Released',
    headlineLine1: 'Future',
    headlineLine2: 'Forward.',
    subtext: 'Experience the perfect blend of minimalist design and cutting-edge technology.',
    button1Label: 'Buy Now',
    button1Link: '/products',
    button2Label: 'Watch Video',
    heroImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85',
    floatingCards: [],
  },
  features: [
    { id: 'f1', icon: 'Truck', title: 'Free Shipping', description: 'On orders over ৳5000' },
    { id: 'f2', icon: 'Banknote', title: 'Cash on Delivery', description: 'Available nationwide' },
    { id: 'f3', icon: 'ShieldCheck', title: 'Secure Warranty', description: '2 Years coverage' },
    { id: 'f4', icon: 'Clock', title: '24/7 Support', description: 'Always here for you' },
  ],
  testimonials: [
    {
      id: 't1',
      name: 'Ahmed F.',
      role: 'Verified Buyer',
      content: 'The Obsidian Chronograph is a masterpiece. The titanium build feels incredibly premium, and delivery in Dhaka was completed within 24 hours. Highly recommended!',
      rating: 5,
      avatar: 'AF',
    },
    {
      id: 't2',
      name: 'Sarah K.',
      role: 'Verified Buyer',
      content: 'I was hesitant about buying electronics online, but the Aero Earbuds are genuine and the noise cancellation is top-notch. Customer support is very responsive.',
      rating: 5,
      avatar: 'SK',
    },
    {
      id: 't3',
      name: 'Rahim U.',
      role: 'Verified Buyer',
      content: 'Good quality backpack. The materials are sturdy and it has enough compartments for my tech gear. Only docking a star because it took 4 days to reach Chittagong.',
      rating: 4,
      avatar: 'RU',
    },
  ],
  newsletter: {
    headline: 'Join the Inner Circle',
    subtext: 'Be the first to know about new releases, exclusive drops, and insider-only promotions.',
    buttonLabel: 'Subscribe',
    placeholder: 'Enter your email address',
  },
  visibility: {
    hero: true,
    features: true,
    category: true,
    trending: true,
    testimonials: true,
    newsletter: true,
    productTrustBadges: true,
  },
};

/**
 * Fetch top trending/featured products directly on the server.
 * Selects only required card fields, filters by live status, and orders by newest.
 */
export async function getTrendingProducts(limit: number = 4): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, rating, category, brand, is_new, is_live, stock, colors, variants')
      .or('is_live.eq.true,is_live.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending products on server:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
      image: p.image || '/placeholder.png',
      rating: Number(p.rating) || 5,
      category: p.category || 'General',
      brand: p.brand || '',
      isNew: Boolean(p.is_new),
      isLive: p.is_live !== false,
      stock: p.stock,
      colors: safeParse(p.colors),
      variants: safeParse(p.variants),
    })) as Product[];
  } catch (err) {
    console.error('Failed to get trending products on server:', err);
    return [];
  }
}

/**
 * Fetch homepage settings directly on the server.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('id', 'homepage_settings')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching homepage content on server:', error.message);
    }

    if (data && data.value) {
      const val = data.value as HomepageContent;
      if (!val.hero?.banners || val.hero.banners.length === 0) {
        val.hero = {
          ...val.hero,
          banners: DEFAULT_HOMEPAGE.hero.banners,
          autoSlideInterval: val.hero?.autoSlideInterval || 5,
          showArrows: val.hero?.showArrows ?? true,
          showDots: val.hero?.showDots ?? true,
        };
      }
      return val;
    }
  } catch (err) {
    console.error('Failed to get homepage content on server:', err);
  }
  return DEFAULT_HOMEPAGE;
}

/**
 * Fetch active categories for the dynamic pill menu on the homepage.
 */
export async function getCategoriesForHome() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, image_url, is_active, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Failed to get categories on server:', err);
  }

  // Minimal fallback categories
  return [
    { id: 'cat-all', name: 'All Products', slug: 'all', image_url: null },
    { id: 'cat-watches', name: 'Watches', slug: 'watches', image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80' },
    { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80' },
    { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80' },
    { id: 'cat-bags', name: 'Bags', slug: 'bags', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80' },
    { id: 'cat-smart-home', name: 'Smart Home', slug: 'smart-home', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=300&q=80' },
  ];
}

/**
 * Fetch Flash Sales products (products with sale discount).
 */
export async function getFlashSaleProducts(limit: number = 6): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, rating, category, brand, is_new, is_live, stock, colors, variants')
      .or('is_live.eq.true,is_live.is.null')
      .gt('regular_price', 0)
      .order('price', { ascending: true })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
        image: p.image || '/placeholder.png',
        rating: Number(p.rating) || 5,
        category: p.category || 'General',
        brand: p.brand || '',
        isNew: Boolean(p.is_new),
        isLive: p.is_live !== false,
        stock: p.stock,
        colors: safeParse(p.colors),
        variants: safeParse(p.variants),
      })) as Product[];
    }
  } catch (err) {
    console.error('Failed to get flash sale products on server:', err);
  }
  return getTrendingProducts(limit);
}

/**
 * Fetch New Arrivals.
 */
export async function getNewArrivalProducts(limit: number = 6): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, rating, category, brand, is_new, is_live, stock, colors, variants')
      .or('is_live.eq.true,is_live.is.null')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
        image: p.image || '/placeholder.png',
        rating: Number(p.rating) || 5,
        category: p.category || 'General',
        brand: p.brand || '',
        isNew: true,
        isLive: p.is_live !== false,
        stock: p.stock,
        colors: safeParse(p.colors),
        variants: safeParse(p.variants),
      })) as Product[];
    }
  } catch (err) {
    console.error('Failed to get new arrivals on server:', err);
  }
  return getTrendingProducts(limit);
}

/**
 * Fetch 'Just For You' recommended product catalog.
 */
export async function getJustForYouProducts(limit: number = 10): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, rating, category, brand, is_new, is_live, stock, colors, variants')
      .or('is_live.eq.true,is_live.is.null')
      .order('rating', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
        image: p.image || '/placeholder.png',
        rating: Number(p.rating) || 5,
        category: p.category || 'General',
        brand: p.brand || '',
        isNew: Boolean(p.is_new),
        isLive: p.is_live !== false,
        stock: p.stock,
        colors: safeParse(p.colors),
        variants: safeParse(p.variants),
      })) as Product[];
    }
  } catch (err) {
    console.error('Failed to get Just For You products on server:', err);
  }
  return getTrendingProducts(limit);
}

/**
 * Fallback Boyam Artisanal Products when DB has no products seeded under brand 'boyam'.
 */
export const DEFAULT_BOYAM_PRODUCTS: Product[] = [
  {
    id: 'boyam-beef-pickle-400g',
    name: 'বোয়াম স্পেশাল সরিষার তেলে গরুর মাংসের আচার',
    price: 650,
    regularPrice: 750,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    category: 'Pickles',
    brand: 'Boyam',
    isNew: true,
    isLive: true,
    stock: 45,
    description: 'খাঁটি কাঠের ঘানির সরিষার তেলে কড়া করে ভাজা হাড় ছাড়া প্রিমিয়াম গরুর মাংস ও ঐতিহ্যবাহী মশলার নিখুঁত মিশ্রণে তৈরি বোয়াম স্পেশাল মাংসের আচার। কোনো কৃত্রিম প্রিজারভেটিভ বা রঙ নেই।',
    specs: [
      { key: 'Weight', value: '400g' },
      { key: 'Packaging', value: 'Airtight Food-Grade Glass Jar' },
      { key: 'Shelf Life', value: '6 Months (Refrigerated after opening)' },
      { key: 'Purity', value: '100% Homemade & Preservative Free' },
    ],
  },
  {
    id: 'boyam-sundarban-honey-500g',
    name: 'সুন্দরবনের খাঁটি চাকের কাঁচা মধু (Raw Wild Honey)',
    price: 780,
    regularPrice: 880,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    category: 'Honey',
    brand: 'Boyam',
    isNew: true,
    isLive: true,
    stock: 60,
    description: 'সুন্দরবনের গভীর অরণ্যের বুনো মৌচাক থেকে সরাসরি সংগৃহীত ১০০% অপরিশোধিত কাঁচা মধু। কোনো তাপ বা চিনি ছাড়াই সম্পূর্ণ প্রাকৃতিক পরাগরেণু সমৃদ্ধ।',
    specs: [
      { key: 'Weight', value: '500g' },
      { key: 'Source', value: 'Sundarbans Natural Wild Beehives' },
      { key: 'Processing', value: 'Unfiltered, Unheated, 100% Raw' },
      { key: 'Packaging', value: 'Glass Clamp Jar' },
    ],
  },
  {
    id: 'boyam-bilona-cow-ghee-450g',
    name: 'ঐতিহ্যবাহী কাঠের মন্থনে তৈরি বিলোনা গাওয়া ঘি',
    price: 950,
    regularPrice: 1100,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    category: 'Ghee',
    brand: 'Boyam',
    isNew: true,
    isLive: true,
    stock: 30,
    description: 'দেশি গরুর খাঁটি দুধের দই কাঠের মন্থন দিয়ে ঘুঁটে মাখন তৈরি করে ধীর আঁচে প্রস্তুত খাঁটি সুগন্ধি দানাদার বিলোনা ঘি। মুখে দিলেই ঐতিহ্যবাহী ঘ্রাণে মন জুড়াবে।',
    specs: [
      { key: 'Weight', value: '450g' },
      { key: 'Method', value: 'Traditional Ayurvedic Bilona Method' },
      { key: 'Aroma', value: 'Rich, Golden & Naturally Granular' },
      { key: 'Packaging', value: 'Sealed Amber Glass Jar' },
    ],
  },
  {
    id: 'boyam-garlic-chili-pickle-350g',
    name: 'বোয়াম রোদে শুকানো রসুন ও কাঁচা মরিচের আচার',
    price: 380,
    regularPrice: 450,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    category: 'Pickles',
    brand: 'Boyam',
    isNew: false,
    isLive: true,
    stock: 55,
    description: 'দেশি আস্ত রসুনের কোয়া এবং সুগন্ধি কাঁচা মরিচ দিয়ে রোদে শুকিয়ে প্রস্তুত করা অতুলনীয় স্বাদের স্বাস্থ্যকর রসুন আচার। খাবারে রুচি বাড়াতে অতুলনীয়।',
    specs: [
      { key: 'Weight', value: '350g' },
      { key: 'Base Oil', value: 'Pure Cold Pressed Mustard Oil' },
      { key: 'Taste Profile', value: 'Tangy, Pungent & Spicy' },
      { key: 'Packaging', value: 'Glass Jar' },
    ],
  },
  {
    id: 'boyam-mustard-oil-1000ml',
    name: 'বোয়াম কাঠের ঘানির খাঁটি ঝাঁঝালো সরিষার তেল',
    price: 420,
    regularPrice: 480,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    category: 'Oils',
    brand: 'Boyam',
    isNew: false,
    isLive: true,
    stock: 80,
    description: 'বাছাইকৃত দেশি মাঘী সরিষা থেকে কাঠের ঘানিতে ধীর গতিতে নিষ্কাশিত ১০০% আসল ঝাঁঝালো সরিষার তেল। রান্নায় ও ভর্তায় এনে দেয় আসল দেশীয় স্বাদ।',
    specs: [
      { key: 'Weight', value: '1 Litre' },
      { key: 'Method', value: 'Traditional Wood Cold Pressed (কাঠের ঘানি)' },
      { key: 'Purity', value: '100% Unrefined & Chemical Free' },
      { key: 'Packaging', value: 'Heavy Duty Glass Bottle' },
    ],
  },
  {
    id: 'boyam-crispy-nimki-300g',
    name: 'বোয়াম হাতে তৈরি স্পেশাল মুচমুচে নিমকি',
    price: 220,
    regularPrice: 260,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    category: 'Snacks',
    brand: 'Boyam',
    isNew: true,
    isLive: true,
    stock: 40,
    description: 'খাঁটি গাওয়া ঘি ও কালোজিরার সুবাসে হাতে গড়া মুচমুচে কুড়মুড়ে নিমকি। বৈকালিক চা কিংবা পারিবারিক আড্ডার নিখুঁত সঙ্গী।',
    specs: [
      { key: 'Weight', value: '300g' },
      { key: 'Taste', value: 'Crispy, Flaky with Black Cumin (কালোজিরা)' },
      { key: 'Packaging', value: 'Vacuum Sealed Freshness Jar' },
    ],
  },
  {
    id: 'boyam-green-mango-pickle-400g',
    name: 'বোয়াম টক-ঝাল-মিষ্টি কাঁচা আমের আচার',
    price: 350,
    regularPrice: 400,
    image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    category: 'Pickles',
    brand: 'Boyam',
    isNew: false,
    isLive: true,
    stock: 65,
    description: 'মায়ের হাতের চিরচেনা রেসিপিতে রোদে শুকানো কাঁচা আমের টুকরো ও পাঁচফোড়নের স্বাদে তৈরি জিভে জল আনা টক-মিষ্টি আমের আচার।',
    specs: [
      { key: 'Weight', value: '400g' },
      { key: 'Flavor', value: 'Tangy, Sweet & Spiced' },
      { key: 'Packaging', value: 'Traditional Wide-Mouth Glass Jar' },
    ],
  },
  {
    id: 'boyam-kalojira-honey-500g',
    name: 'পাহাড়ি কালোজিরা ফুলের প্রাকৃতিক মধু',
    price: 850,
    regularPrice: 980,
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    category: 'Honey',
    brand: 'Boyam',
    isNew: true,
    isLive: true,
    stock: 35,
    description: 'কালোজিরা ফুলের প্রাকৃতিক নেকটার থেকে সংগৃহীত গাড় লালচে-বাদামি রঙের বিশেষ ঔষধি গুণসম্পন্ন অপরিশোধিত মধু।',
    specs: [
      { key: 'Weight', value: '500g' },
      { key: 'Flower', value: 'Black Seed (Nigella Sativa) Blossom' },
      { key: 'Packaging', value: 'Glass Jar with Wooden Dipper' },
    ],
  },
];

/**
 * Fetch dedicated products for the Boyam brand sales section.
 * Queries Supabase where brand === 'boyam' (case-insensitive)
 * and falls back to curated artisanal Boyam products if none are found in the DB.
 */
export async function getBoyamProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, rating, category, brand, is_new, is_live, stock, colors, variants, description, specs, isFreeDelivery, customDeliveryCharge')
      .or('is_live.eq.true,is_live.is.null')
      .ilike('brand', 'boyam')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
        image: p.image || '/placeholder.png',
        rating: Number(p.rating) || 5,
        category: p.category || 'Food & Gourmet',
        brand: p.brand || 'Boyam',
        isNew: Boolean(p.is_new),
        isLive: p.is_live !== false,
        stock: p.stock,
        colors: safeParse(p.colors),
        variants: safeParse(p.variants),
        specs: safeParse(p.specs),
        description: p.description,
        isFreeDelivery: Boolean(p.isFreeDelivery),
        customDeliveryCharge: p.customDeliveryCharge,
      })) as Product[];
    }
  } catch (err) {
    console.error('Failed to get Boyam products on server:', err);
  }

  return DEFAULT_BOYAM_PRODUCTS;
}
