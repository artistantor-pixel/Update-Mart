import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CourierIntegration {
  id: string;
  name: string;
  isActive: boolean;
  apiKey: string;
  secretKey: string;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
}

interface CourierStore {
  couriers: CourierIntegration[];
  toggleCourierStatus: (id: string) => void;
  updateCourierDetails: (id: string, details: Partial<CourierIntegration>) => void;
}

const INITIAL_COURIERS: CourierIntegration[] = [
  {
    id: 'c1',
    name: 'Steadfast',
    isActive: false,
    apiKey: '',
    secretKey: '',
    deliveryChargeInsideDhaka: 60,
    deliveryChargeOutsideDhaka: 120,
  },
  {
    id: 'c2',
    name: 'Pathao',
    isActive: false,
    apiKey: '',
    secretKey: '',
    deliveryChargeInsideDhaka: 65,
    deliveryChargeOutsideDhaka: 130,
  },
  {
    id: 'c3',
    name: 'RedX',
    isActive: false,
    apiKey: '',
    secretKey: '',
    deliveryChargeInsideDhaka: 60,
    deliveryChargeOutsideDhaka: 110,
  },
  {
    id: 'c4',
    name: 'Paperfly',
    isActive: false,
    apiKey: '',
    secretKey: '',
    deliveryChargeInsideDhaka: 70,
    deliveryChargeOutsideDhaka: 130,
  },
  {
    id: 'c5',
    name: 'eCourier',
    isActive: false,
    apiKey: '',
    secretKey: '',
    deliveryChargeInsideDhaka: 60,
    deliveryChargeOutsideDhaka: 120,
  }
];

export const useCourierStore = create<CourierStore>()(
  persist(
    (set) => ({
      couriers: INITIAL_COURIERS,
      toggleCourierStatus: (id: string) => set((state) => ({
        couriers: state.couriers.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
      })),
      updateCourierDetails: (id: string, details: Partial<CourierIntegration>) => set((state) => ({
        couriers: state.couriers.map(c => c.id === id ? { ...c, ...details } : c)
      }))
    }),
    {
      name: 'updatemart-couriers-storage',
    }
  )
);
