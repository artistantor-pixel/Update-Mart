import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  isLoading: boolean;
  fetchCouriers: () => Promise<void>;
  toggleCourierStatus: (id: string) => Promise<void>;
  updateCourierDetails: (id: string, details: Partial<CourierIntegration>) => Promise<void>;
}

export const useCourierStore = create<CourierStore>()((set, get) => ({
  couriers: [],
  isLoading: false,

  fetchCouriers: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('courier_settings').select('*').order('id');
      if (error) throw error;

      if (data) {
        const mappedCouriers = data.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          apiKey: c.api_key || '',
          secretKey: c.secret_key || '',
          deliveryChargeInsideDhaka: c.delivery_charge_inside_dhaka || 60,
          deliveryChargeOutsideDhaka: c.delivery_charge_outside_dhaka || 120
        }));
        set({ couriers: mappedCouriers });
      }
    } catch (err) {
      console.error("Error fetching couriers from Supabase:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCourierStatus: async (id: string) => {
    const courier = get().couriers.find(c => c.id === id);
    if (!courier) return;

    // Optimistic UI update
    set((state) => ({
      couriers: state.couriers.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    }));

    try {
      const { error } = await supabase
        .from('courier_settings')
        .update({ is_active: !courier.isActive })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Error toggling courier status in Supabase:", err);
      // Revert if error
      set((state) => ({
        couriers: state.couriers.map(c => c.id === id ? { ...c, isActive: courier.isActive } : c)
      }));
    }
  },

  updateCourierDetails: async (id: string, details: Partial<CourierIntegration>) => {
    // Optimistic update
    set((state) => ({
      couriers: state.couriers.map(c => c.id === id ? { ...c, ...details } : c)
    }));

    try {
      const dbUpdates: any = {};
      if (details.apiKey !== undefined) dbUpdates.api_key = details.apiKey;
      if (details.secretKey !== undefined) dbUpdates.secret_key = details.secretKey;
      if (details.deliveryChargeInsideDhaka !== undefined) dbUpdates.delivery_charge_inside_dhaka = details.deliveryChargeInsideDhaka;
      if (details.deliveryChargeOutsideDhaka !== undefined) dbUpdates.delivery_charge_outside_dhaka = details.deliveryChargeOutsideDhaka;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('courier_settings')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Error updating courier details in Supabase:", err);
    }
  }
}));
