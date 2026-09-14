import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  toggleCOD: (enabled: boolean) => void;
  setCodFee: (fee: number) => void;
  setTopBar: (config: TopBarConfig) => void;
  setFooter: (config: FooterConfig) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      isCODEnabled: true,
      codFee: 60,
      topBar: {
        enabled: true,
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
      toggleCOD: (enabled) => set({ isCODEnabled: enabled }),
      setCodFee: (fee) => set({ codFee: fee }),
      setTopBar: (config) => set({ topBar: config }),
      setFooter: (config) => set({ footer: config }),
    }),
    {
      name: 'updatemart-settings-storage',
    }
  )
);
