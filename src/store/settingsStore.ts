import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface TopBarConfig {
  enabled: boolean;
  message: string;
  linkText: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
}

export interface FooterConfig {
  aboutText: string;
  phone: string;
  email: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
}

interface SettingsStore {
  isCODEnabled: boolean;
  codFee: number;
  topBar: TopBarConfig;
  footer: FooterConfig;
  blockedPhones: string[];
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  toggleBlockPhone: (phone: string, block: boolean) => Promise<void>;
  toggleCOD: (enabled: boolean) => Promise<void>;
  setCodFee: (fee: number) => Promise<void>;
  setTopBar: (config: TopBarConfig) => Promise<void>;
  setFooter: (config: FooterConfig) => Promise<void>;
}

const DEFAULT_SETTINGS = {
  isCODEnabled: true,
  codFee: 60,
  topBar: {
    enabled: false,
    message: 'FREE SHIPPING ON ORDERS OVER ৳5000!',
    linkText: 'Shop Now',
    linkUrl: '/products',
    bgColor: '#1e293b', // slate-800
    textColor: '#ffffff',
  },
  footer: {
    aboutText: 'Premium products tailored for your modern lifestyle. Quality and excellence delivered straight to your door.',
    phone: '+1 (555) 123-4567',
    email: 'support@updatemart.com',
    facebookUrl: '#',
    twitterUrl: '#',
    instagramUrl: '#',
  },
  blockedPhones: [],
};

const SETTINGS_ID = 'general_settings';

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('app_settings').select('value').eq('id', SETTINGS_ID).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.value) {
        set({ ...data.value });
      } else {
        await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: DEFAULT_SETTINGS });
        set({ ...DEFAULT_SETTINGS });
      }
    } catch (err) {
      console.error("Error fetching general settings:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCOD: async (enabled) => {
    set({ isCODEnabled: enabled });
    const { isCODEnabled, codFee, topBar, footer, blockedPhones } = get();
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: { isCODEnabled, codFee, topBar, footer, blockedPhones } });
  },

  toggleBlockPhone: async (phone: string, block: boolean) => {
    const currentList = get().blockedPhones || [];
    let newList;
    if (block) {
      newList = Array.from(new Set([...currentList, phone]));
    } else {
      newList = currentList.filter(p => p !== phone);
    }
    set({ blockedPhones: newList });
    const { isCODEnabled, codFee, topBar, footer } = get();
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: { isCODEnabled, codFee, topBar, footer, blockedPhones: newList } });
  },

  setCodFee: async (fee) => {
    set({ codFee: fee });
    const { isCODEnabled, codFee, topBar, footer, blockedPhones } = get();
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: { isCODEnabled, codFee, topBar, footer, blockedPhones } });
  },

  setTopBar: async (config) => {
    set({ topBar: config });
    const { isCODEnabled, codFee, topBar, footer, blockedPhones } = get();
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: { isCODEnabled, codFee, topBar, footer, blockedPhones } });
  },

  setFooter: async (config) => {
    set({ footer: config });
    const { isCODEnabled, codFee, topBar, footer, blockedPhones } = get();
    await supabase.from('app_settings').upsert({ id: SETTINGS_ID, value: { isCODEnabled, codFee, topBar, footer, blockedPhones } });
  },
}));
