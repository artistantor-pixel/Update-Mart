import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface CategoryHighlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface CategoryPageConfig {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  bannerImageUrl: string;
  bannerOverlayOpacity: number; // 0 to 100
  highlights: CategoryHighlight[];
  seoTitle?: string;
  seoDescription?: string;
  showBrandFilter: boolean;
  showPriceFilter: boolean;
  defaultSort?: 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
}

export const DEFAULT_CATEGORY_CONFIGS: Record<string, CategoryPageConfig> = {
  watches: {
    slug: 'watches',
    name: 'Watches',
    tagline: 'PRECISION TIMEKEEPING',
    headline: 'Curated Luxury & Minimalist Watches',
    description:
      'Explore precision-engineered analog chronographs, sapphire-glass automatics, and refined dress timepieces designed for modern distinction.',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=85',
    bannerOverlayOpacity: 65,
    showBrandFilter: true,
    showPriceFilter: true,
    defaultSort: 'featured',
    seoTitle: 'Luxury & Minimalist Watches | Update Mart',
    seoDescription:
      'Shop authentic watches, chronographs, and automatic timepieces with nationwide delivery and official warranty.',
    highlights: [
      {
        id: 'h1',
        icon: 'ShieldCheck',
        title: '100% Authentic',
        description: 'Original movements & verified serial numbers',
      },
      {
        id: 'h2',
        icon: 'Award',
        title: '2-Year Warranty',
        description: 'Official movement & craftsmanship warranty',
      },
      {
        id: 'h3',
        icon: 'Truck',
        title: 'Insured Delivery',
        description: 'Shockproof protective packaging nationwide',
      },
    ],
  },
  electronics: {
    slug: 'electronics',
    name: 'Electronics',
    tagline: 'FLAGSHIP TECH & ACOUSTICS',
    headline: 'Next-Gen Electronics & Audio Gear',
    description:
      'High-fidelity studio audio, noise-cancelling wireless earbuds, smart wearables, and cutting-edge peripherals built for peak performance.',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=85',
    bannerOverlayOpacity: 70,
    showBrandFilter: true,
    showPriceFilter: true,
    defaultSort: 'featured',
    seoTitle: 'Flagship Electronics & Audio | Update Mart',
    seoDescription:
      'Discover high-performance earbuds, smart wearables, and tech gadgets with brand warranty.',
    highlights: [
      {
        id: 'h1',
        icon: 'Zap',
        title: 'Peak Performance',
        description: 'Thoroughly tested flagship hardware specs',
      },
      {
        id: 'h2',
        icon: 'CheckCircle',
        title: 'Replacement Guarantee',
        description: '7-day replacement for any manufacturing issue',
      },
      {
        id: 'h3',
        icon: 'Clock',
        title: 'Express Dispatch',
        description: '24-hour priority packing & swift courier dispatch',
      },
    ],
  },
  accessories: {
    slug: 'accessories',
    name: 'Accessories',
    tagline: 'EVERYDAY CARRY (EDC)',
    headline: 'Minimalist EDC & Lifestyle Essentials',
    description:
      'Thoughtfully crafted genuine leather goods, precision key organizers, and premium everyday carry gear designed to streamline your daily routine.',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85',
    bannerOverlayOpacity: 65,
    showBrandFilter: true,
    showPriceFilter: true,
    defaultSort: 'featured',
    seoTitle: 'Minimalist Accessories & EDC | Update Mart',
    seoDescription:
      'Shop premium everyday carry accessories, leather wallets, and daily essentials.',
    highlights: [
      {
        id: 'h1',
        icon: 'Sparkles',
        title: 'Artisanal Craft',
        description: 'Top-tier materials & precision stitching',
      },
      {
        id: 'h2',
        icon: 'ShieldCheck',
        title: 'Built to Endure',
        description: 'Engineered for rugged daily carry',
      },
      {
        id: 'h3',
        icon: 'RotateCcw',
        title: 'Hassle-Free Returns',
        description: '7-day easy exchange & money-back policy',
      },
    ],
  },
  bags: {
    slug: 'bags',
    name: 'Bags & Travel',
    tagline: 'URBAN COMMUTER & TRAVEL GEAR',
    headline: 'Ergonomic Backpacks & Travel Bags',
    description:
      'Weatherproof rolltop packs, tactical commuter briefcases, and intelligent travel organizers engineered for seamless modern mobility.',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=85',
    bannerOverlayOpacity: 65,
    showBrandFilter: true,
    showPriceFilter: true,
    defaultSort: 'featured',
    seoTitle: 'Backpacks & Travel Gear | Update Mart',
    seoDescription:
      'Shop waterproof backpacks, laptop bags, and travel organizers with ergonomic support.',
    highlights: [
      {
        id: 'h1',
        icon: 'ShieldCheck',
        title: 'Weatherproof Build',
        description: 'Water-resistant coated Cordura & ballistic nylon',
      },
      {
        id: 'h2',
        icon: 'Award',
        title: 'Ergonomic Support',
        description: 'Padded airflow back panels & balanced weight distribution',
      },
      {
        id: 'h3',
        icon: 'Truck',
        title: 'Free Shipping',
        description: 'Complimentary shipping on qualifying orders',
      },
    ],
  },
  'smart-home': {
    slug: 'smart-home',
    name: 'Smart Home',
    tagline: 'INTELLIGENT LIVING',
    headline: 'Ambient Smart Home Automation',
    description:
      'Intelligent ambient lighting, wireless sensors, automated switches, and connected devices designed for effortless everyday comfort.',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=85',
    bannerOverlayOpacity: 70,
    showBrandFilter: true,
    showPriceFilter: true,
    defaultSort: 'featured',
    seoTitle: 'Smart Home Automation & Sensors | Update Mart',
    seoDescription:
      'Upgrade your home with connected smart lighting, wireless sensors, and home automation.',
    highlights: [
      {
        id: 'h1',
        icon: 'Sparkles',
        title: 'Seamless Setup',
        description: 'Intuitive plug-and-play wireless integration',
      },
      {
        id: 'h2',
        icon: 'Zap',
        title: 'Ultra Energy Efficient',
        description: 'Low-power consumption hardware for maximum savings',
      },
      {
        id: 'h3',
        icon: 'CheckCircle',
        title: 'Certified Safe',
        description: 'Surge-protected & safety-certified electronics',
      },
    ],
  },
};

/**
 * Generate a smart default config for any dynamic or user-created category
 */
export function generateDefaultCategoryConfig(slug: string, name?: string): CategoryPageConfig {
  const cleanName = name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  return {
    slug,
    name: cleanName,
    tagline: 'CURATED COLLECTION',
    headline: `${cleanName} Collection`,
    description: `Discover our handpicked selection of top-tier ${cleanName.toLowerCase()} crafted for durability, modern aesthetics, and exceptional value.`,
    bannerImageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85',
    bannerOverlayOpacity: 65,
    showBrandFilter: true,
    showPriceFilter: true,
    defaultSort: 'featured',
    seoTitle: `${cleanName} | Update Mart`,
    seoDescription: `Shop the best curated ${cleanName.toLowerCase()} with fast nationwide delivery and verified buyer guarantee.`,
    highlights: [
      {
        id: 'h1',
        icon: 'ShieldCheck',
        title: '100% Genuine',
        description: 'Authentic items sourced directly from verified brands',
      },
      {
        id: 'h2',
        icon: 'Truck',
        title: 'Fast Nationwide Delivery',
        description: 'Safe packaging & express dispatch to your doorstep',
      },
      {
        id: 'h3',
        icon: 'RotateCcw',
        title: 'Easy 7-Day Returns',
        description: 'Smooth return & exchange policy on all purchases',
      },
    ],
  };
}

const SETTINGS_KEY = 'category_page_settings';

interface CategoryPageStore {
  configs: Record<string, CategoryPageConfig>;
  isLoading: boolean;
  isSaving: boolean;
  fetchConfigs: () => Promise<void>;
  getConfig: (slug: string, categoryName?: string) => CategoryPageConfig;
  saveCategoryConfig: (slug: string, config: CategoryPageConfig) => Promise<boolean>;
  resetCategoryConfig: (slug: string, categoryName?: string) => Promise<boolean>;
}

export const useCategoryPageStore = create<CategoryPageStore>()((set, get) => ({
  configs: DEFAULT_CATEGORY_CONFIGS,
  isLoading: false,
  isSaving: false,

  fetchConfigs: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('id', SETTINGS_KEY)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching category page settings:', error);
      }

      if (data && data.value) {
        const stored = data.value as Record<string, CategoryPageConfig>;
        // Merge stored with defaults to ensure all fields exist
        const merged = { ...DEFAULT_CATEGORY_CONFIGS, ...stored };
        set({ configs: merged });
      }
    } catch (err) {
      console.error('Failed to load category page settings:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  getConfig: (slug: string, categoryName?: string) => {
    const normalizedSlug = slug.toLowerCase().trim();
    const existing = get().configs[normalizedSlug];
    if (existing) return existing;
    return generateDefaultCategoryConfig(normalizedSlug, categoryName);
  },

  saveCategoryConfig: async (slug: string, config: CategoryPageConfig) => {
    set({ isSaving: true });
    try {
      const normalizedSlug = slug.toLowerCase().trim();
      const updatedConfigs = {
        ...get().configs,
        [normalizedSlug]: {
          ...config,
          slug: normalizedSlug,
        },
      };

      set({ configs: updatedConfigs });

      const { error } = await supabase.from('app_settings').upsert({
        id: SETTINGS_KEY,
        value: updatedConfigs,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to save category config:', err);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  resetCategoryConfig: async (slug: string, categoryName?: string) => {
    set({ isSaving: true });
    try {
      const normalizedSlug = slug.toLowerCase().trim();
      const defaultConfig =
        DEFAULT_CATEGORY_CONFIGS[normalizedSlug] ||
        generateDefaultCategoryConfig(normalizedSlug, categoryName);

      const updatedConfigs = {
        ...get().configs,
        [normalizedSlug]: defaultConfig,
      };

      set({ configs: updatedConfigs });

      const { error } = await supabase.from('app_settings').upsert({
        id: SETTINGS_KEY,
        value: updatedConfigs,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to reset category config:', err);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },
}));
