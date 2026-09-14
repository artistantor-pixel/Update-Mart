import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FloatingCard {
  id: string;
  icon: string; // lucide icon name
  title: string;
  subtitle: string;
}

export interface HeroContent {
  badgeText: string;
  headlineLine1: string;
  headlineLine2: string;
  subtext: string;
  button1Label: string;
  button1Link: string;
  button2Label: string;
  heroImageUrl: string;
  floatingCards: FloatingCard[];
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
  };
}

interface HomepageStore {
  content: HomepageContent;
  updateHero: (hero: Partial<HeroContent>) => void;
  updateFeature: (id: string, updates: Partial<FeatureItem>) => void;
  addTestimonial: (t: Testimonial) => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  removeTestimonial: (id: string) => void;
  updateNewsletter: (n: Partial<NewsletterContent>) => void;
  updateVisibility: (section: keyof HomepageContent['visibility'], isVisible: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_CONTENT: HomepageContent = {
  hero: {
    badgeText: 'Just Released',
    headlineLine1: 'Future',
    headlineLine2: 'Forward.',
    subtext: 'Experience the perfect blend of minimalist design and cutting-edge technology. The Obsidian Chronograph is built for tomorrow.',
    button1Label: 'Buy Now — ৳29,990',
    button1Link: '/product/watch-combo-01',
    button2Label: 'Watch Video',
    heroImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    floatingCards: [
      { id: 'fc1', icon: 'Shield', title: 'Titanium', subtitle: 'Aerospace Grade' },
      { id: 'fc2', icon: 'Battery', title: '14 Days', subtitle: 'Battery Life' },
      { id: 'fc3', icon: 'Zap', title: 'Fast Charging Supported', subtitle: '' },
    ],
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
  }
};

export const useHomepageStore = create<HomepageStore>()(
  persist(
    (set) => ({
      content: DEFAULT_CONTENT,

      updateHero: (hero) => set((state) => ({
        content: { ...state.content, hero: { ...state.content.hero, ...hero } }
      })),

      updateFeature: (id, updates) => set((state) => ({
        content: {
          ...state.content,
          features: state.content.features.map(f => f.id === id ? { ...f, ...updates } : f),
        }
      })),

      addTestimonial: (t) => set((state) => ({
        content: { ...state.content, testimonials: [...state.content.testimonials, t] }
      })),

      updateTestimonial: (id, updates) => set((state) => ({
        content: {
          ...state.content,
          testimonials: state.content.testimonials.map(t => t.id === id ? { ...t, ...updates } : t),
        }
      })),

      removeTestimonial: (id) => set((state) => ({
        content: {
          ...state.content,
          testimonials: state.content.testimonials.filter(t => t.id !== id),
        }
      })),

      updateNewsletter: (n) => set((state) => ({
        content: { ...state.content, newsletter: { ...state.content.newsletter, ...n } }
      })),

      updateVisibility: (section, isVisible) => set((state) => ({
        content: { ...state.content, visibility: { ...state.content.visibility, [section]: isVisible } }
      })),

      resetToDefaults: () => set({ content: DEFAULT_CONTENT }),
    }),
    { name: 'updatemart-homepage-storage' }
  )
);
