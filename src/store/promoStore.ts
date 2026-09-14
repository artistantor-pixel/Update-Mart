import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PromoCode {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minOrderAmount: number;
  isActive: boolean;
}

interface PromoStore {
  promos: PromoCode[];
  addPromo: (promo: PromoCode) => void;
  updatePromo: (id: string, updates: Partial<PromoCode>) => void;
  deletePromo: (id: string) => void;
  validatePromo: (code: string, cartTotal: number) => { isValid: boolean; discountAmount: number; error?: string; appliedPromo?: PromoCode };
}

const initialPromos: PromoCode[] = [
  {
    id: 'p-1',
    code: 'WELCOME500',
    type: 'fixed',
    value: 500,
    minOrderAmount: 2000,
    isActive: true,
  },
  {
    id: 'p-2',
    code: 'EID25',
    type: 'percentage',
    value: 25,
    minOrderAmount: 5000,
    isActive: true,
  }
];

export const usePromoStore = create<PromoStore>()(
  persist(
    (set, get) => ({
      promos: initialPromos,
      
      addPromo: (promo) => set((state) => ({ promos: [...state.promos, promo] })),
      
      updatePromo: (id, updates) => set((state) => ({
        promos: state.promos.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      
      deletePromo: (id) => set((state) => ({
        promos: state.promos.filter(p => p.id !== id)
      })),
      
      validatePromo: (code, cartTotal) => {
        const promo = get().promos.find(p => p.code.toUpperCase() === code.toUpperCase());
        
        if (!promo) {
          return { isValid: false, discountAmount: 0, error: 'Invalid promo code' };
        }
        
        if (!promo.isActive) {
          return { isValid: false, discountAmount: 0, error: 'This promo code is no longer active' };
        }
        
        if (cartTotal < promo.minOrderAmount) {
          return { isValid: false, discountAmount: 0, error: `Minimum order amount must be ৳${promo.minOrderAmount}` };
        }
        
        let discountAmount = 0;
        if (promo.type === 'fixed') {
          discountAmount = promo.value;
        } else if (promo.type === 'percentage') {
          discountAmount = (cartTotal * promo.value) / 100;
        }
        
        // Prevent discount from being greater than the cart total
        discountAmount = Math.min(discountAmount, cartTotal);
        
        return { isValid: true, discountAmount, appliedPromo: promo };
      }
    }),
    {
      name: 'updatemart-promo-storage',
    }
  )
);
