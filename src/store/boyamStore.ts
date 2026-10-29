import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface BoyamCategoryItem {
  id: string;
  label: string;
  labelEn: string;
}

export interface BoyamTrustItem {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  desc: string;
}

export interface BoyamHeroSettings {
  brandNameBn: string;
  brandNameEn: string;
  badgeText: string;
  tagline: string;
  subTagline: string;
  bannerImageUrl?: string;
}

export interface BoyamSeoSettings {
  metaTitle: string;
  metaDescription: string;
}

export interface BoyamPageSettings {
  hero: BoyamHeroSettings;
  categories: BoyamCategoryItem[];
  trustItems: BoyamTrustItem[];
  seo: BoyamSeoSettings;
}

export const DEFAULT_BOYAM_SETTINGS: BoyamPageSettings = {
  hero: {
    brandNameBn: 'বোয়াম',
    brandNameEn: 'Boyam',
    badgeText: 'ঐতিহ্যবাহী স্বাদ · Artisanal Heritage',
    tagline: 'মায়ের হাতের চিরচেনা রেসিপি, প্রকৃতির শুদ্ধতা, আর বাংলার ঐতিহ্যবাহী স্বাদ — এক বোয়ামে সব কিছু।',
    subTagline: '১০০% ঘরে তৈরি · কোনো প্রিজারভেটিভ নেই · ছোট ব্যাচে ধীরে রান্না',
    bannerImageUrl: '',
  },
  categories: [
    { id: 'all', label: 'সকল পণ্য', labelEn: 'All' },
    { id: 'Pickles', label: 'আচার', labelEn: 'Pickles' },
    { id: 'Honey', label: 'মধু', labelEn: 'Honey' },
    { id: 'Ghee', label: 'ঘি', labelEn: 'Ghee' },
    { id: 'Oils', label: 'তেল', labelEn: 'Oils' },
    { id: 'Snacks', label: 'নাস্তা', labelEn: 'Snacks' },
  ],
  trustItems: [
    {
      id: 't-1',
      icon: 'ShieldCheck',
      title: '১০০% ঘরে তৈরি',
      titleEn: 'Homemade',
      desc: 'প্রতিটি পণ্য ঘরোয়া পরিবেশে পরিচ্ছন্নভাবে প্রস্তুত — কারখানায় নয়।',
    },
    {
      id: 't-2',
      icon: 'Leaf',
      title: 'সম্পূর্ণ প্রাকৃতিক',
      titleEn: 'Organic',
      desc: 'সরাসরি কৃষকের কাছ থেকে সংগৃহীত খাঁটি উপাদান ও কাঠের ঘানির সরিষার তেল।',
    },
    {
      id: 't-3',
      icon: 'FlaskConical',
      title: 'প্রিজারভেটিভ মুক্ত',
      titleEn: 'Preservative-Free',
      desc: 'কোনো কৃত্রিম রঙ, ক্ষতিকর রাসায়নিক বা প্রিজারভেটিভ ব্যবহার করা হয় না।',
    },
    {
      id: 't-4',
      icon: 'HeartHandshake',
      title: 'ছোট ব্যাচে রান্না',
      titleEn: 'Small-Batch',
      desc: 'মানের সাথে আপোষহীন — প্রতিটি বোয়াম পরম যত্ন ও ভালোবাসায় প্রস্তুত।',
    },
  ],
  seo: {
    metaTitle: 'বোয়াম (Boyam) — ঐতিহ্যবাহী ঘরে তৈরি খাঁটি খাবার | Update Mart',
    metaDescription:
      'সুন্দরবনের খাঁটি মধু, কাঠের ঘানির সরিষার তেলে তৈরি আচার, বিলোনা গাওয়া ঘি, হাতে তৈরি নিমকি — প্রিজারভেটিভ মুক্ত ১০০% ঘরে তৈরি বোয়াম পণ্যসমূহ।',
  },
};

const SETTINGS_ID = 'boyam_page_settings';

interface BoyamStore {
  settings: BoyamPageSettings;
  isLoading: boolean;
  isSaving: boolean;
  fetchSettings: () => Promise<void>;
  saveSettings: (newSettings: BoyamPageSettings) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
}

export const useBoyamStore = create<BoyamStore>((set, get) => ({
  settings: DEFAULT_BOYAM_SETTINGS,
  isLoading: false,
  isSaving: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('id', SETTINGS_ID)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching boyam settings:', error);
      }

      if (data && data.value) {
        set({ settings: { ...DEFAULT_BOYAM_SETTINGS, ...data.value } });
      } else {
        // Upsert default
        await supabase
          .from('app_settings')
          .upsert({ id: SETTINGS_ID, value: DEFAULT_BOYAM_SETTINGS });
        set({ settings: DEFAULT_BOYAM_SETTINGS });
      }
    } catch (err) {
      console.error('Failed to load boyam settings:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveSettings: async (newSettings: BoyamPageSettings) => {
    set({ isSaving: true });
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: SETTINGS_ID, value: newSettings });

      if (error) throw error;
      set({ settings: newSettings });
      return true;
    } catch (err) {
      console.error('Failed to save boyam settings:', err);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  resetToDefaults: async () => {
    set({ isSaving: true });
    try {
      await supabase
        .from('app_settings')
        .upsert({ id: SETTINGS_ID, value: DEFAULT_BOYAM_SETTINGS });
      set({ settings: DEFAULT_BOYAM_SETTINGS });
    } finally {
      set({ isSaving: false });
    }
  },
}));

