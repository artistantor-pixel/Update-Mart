import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface FloatingCard {
  id: string;
  icon: string; // lucide icon name
  title: string;
  subtitle: string;
}

export interface BannerSlide {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

export interface HeroContent {
  banners?: BannerSlide[];
  autoSlideInterval?: number; // in seconds
  showArrows?: boolean;
  showDots?: boolean;
  // Legacy fields
  badgeText?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  subtext?: string;
  button1Label?: string;
  button1Link?: string;
  button2Label?: string;
  heroImageUrl?: string;
  floatingCards?: FloatingCard[];
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface NewsletterContent {
  headline: string;
  subtext: string;
  buttonLabel: string;
  placeholder: string;
}

export interface HomepageContent {
  hero: HeroContent;
  features: FeatureItem[];
  testimonials: Testimonial[];
  newsletter: NewsletterContent;
  visibility: {
    hero: boolean;
    features: boolean;
    category: boolean;
    trending: boolean;
    testimonials: boolean;
    newsletter: boolean;
    productTrustBadges?: boolean;
  };
}

export const DEFAULT_BANNERS: BannerSlide[] = [
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
];

interface HomepageStore {
  content: HomepageContent;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateHero: (hero: Partial<HeroContent>) => Promise<void>;
  addBanner: (banner: Omit<BannerSlide, 'id'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<BannerSlide>) => Promise<void>;
  removeBanner: (id: string) => Promise<void>;
  reorderBanners: (banners: BannerSlide[]) => Promise<void>;
  updateFeature: (id: string, updates: Partial<FeatureItem>) => Promise<void>;
  addTestimonial: (t: Testimonial) => Promise<void>;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<void>;
  removeTestimonial: (id: string) => Promise<void>;
  updateNewsletter: (n: Partial<NewsletterContent>) => Promise<void>;
  updateVisibility: (section: keyof HomepageContent['visibility'], isVisible: boolean) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const DEFAULT_CONTENT: HomepageContent = {
  hero: {
    banners: DEFAULT_BANNERS,
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
  }
};

const SETTINGS_ID = 'homepage_settings';

export const useHomepageStore = create<HomepageStore>()((set, get) => ({
  content: DEFAULT_CONTENT,
  isLoading: true,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('app_settings').select('value').eq('id', SETTINGS_ID).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
      
      if (data && data.value) {
        const fetchedContent = data.value as HomepageContent;
        // Ensure hero.banners is populated
        if (!fetchedContent.hero?.banners || fetchedContent.hero.banners.length === 0) {
          fetchedContent.hero = {
            ...fetchedContent.hero,
            banners: DEFAULT_BANNERS,
            autoSlideInterval: fetchedContent.hero?.autoSlideInterval || 5,
            showArrows: fetchedContent.hero?.showArrows ?? true,
            showDots: fetchedContent.hero?.showDots ?? true,
          };
        }
        set({ content: fetchedContent });
      } else {
        // If no row exists, upsert default
        await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: DEFAULT_CONTENT });
        set({ content: DEFAULT_CONTENT });
      }
    } catch (err) {
      console.error("Error fetching homepage settings:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateHero: async (hero) => {
    const newContent = { ...get().content, hero: { ...get().content.hero, ...hero } };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  addBanner: async (banner) => {
    const currentBanners = get().content.hero?.banners || [];
    const newSlide: BannerSlide = {
      ...banner,
      id: `banner-${Date.now()}`,
      order: currentBanners.length + 1,
    };
    const newBanners = [...currentBanners, newSlide];
    await get().updateHero({ banners: newBanners });
  },

  updateBanner: async (id, updates) => {
    const currentBanners = get().content.hero?.banners || [];
    const newBanners = currentBanners.map(b => b.id === id ? { ...b, ...updates } : b);
    await get().updateHero({ banners: newBanners });
  },

  removeBanner: async (id) => {
    const currentBanners = get().content.hero?.banners || [];
    const newBanners = currentBanners.filter(b => b.id !== id);
    await get().updateHero({ banners: newBanners });
  },

  reorderBanners: async (banners) => {
    await get().updateHero({ banners });
  },

  updateFeature: async (id, updates) => {
    const newContent = {
      ...get().content,
      features: get().content.features.map(f => f.id === id ? { ...f, ...updates } : f),
    };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  addTestimonial: async (t) => {
    const newContent = { ...get().content, testimonials: [...get().content.testimonials, t] };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  updateTestimonial: async (id, updates) => {
    const newContent = {
      ...get().content,
      testimonials: get().content.testimonials.map(t => t.id === id ? { ...t, ...updates } : t),
    };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  removeTestimonial: async (id) => {
    const newContent = {
      ...get().content,
      testimonials: get().content.testimonials.filter(t => t.id !== id),
    };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  updateNewsletter: async (n) => {
    const newContent = { ...get().content, newsletter: { ...get().content.newsletter, ...n } };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  updateVisibility: async (section, isVisible) => {
    const newContent = { ...get().content, visibility: { ...get().content.visibility, [section]: isVisible } };
    set({ content: newContent });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: newContent });
  },

  resetToDefaults: async () => {
    set({ content: DEFAULT_CONTENT });
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: DEFAULT_CONTENT });
  },
}));
