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
