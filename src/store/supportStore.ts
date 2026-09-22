import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface SupportTicket {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_id?: string;
  subject: string;
  message: string;
  status: 'Open' | 'Resolved';
  created_at: string;
}

interface SupportStore {
  tickets: SupportTicket[];
  isLoading: boolean;
  fetchTickets: () => Promise<void>;
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateTicketStatus: (id: string, status: 'Open' | 'Resolved') => Promise<void>;
}

export const useSupportStore = create<SupportStore>((set, get) => ({
  tickets: [],
  isLoading: false,

  fetchTickets: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist yet, just fail silently or log
        if (error.code !== '42P01') {
           console.error('Error fetching tickets:', error);
        }
        return;
      }

      if (data) {
        set({ tickets: data });
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  createTicket: async (ticket) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{ ...ticket, status: 'Open' }])
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        return { success: false, error: error.message };
      }

      set((state) => ({ tickets: [data, ...state.tickets] }));
      return { success: true };
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      return { success: false, error: err.message };
    }
  },

  updateTicketStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating ticket status:', error);
        return;
      }

      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? { ...t, status } : t))
      }));
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  }
}));
