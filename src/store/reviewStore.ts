import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  name: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface NewReview {
  product_id: string;
  product_name: string;
  name: string;
  rating: number;
  content: string;
}

interface ReviewStore {
  reviews: Review[];
  allReviews: Review[]; // for homepage testimonials
  isLoading: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  fetchReviewsForProduct: (productId: string) => Promise<void>;
  fetchAllReviews: () => Promise<void>;
  submitReview: (review: NewReview) => Promise<boolean>;
  resetSubmitState: () => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
  reviews: [],
  allReviews: [],
  isLoading: false,
  isSubmitting: false,
  submitSuccess: false,

  fetchReviewsForProduct: async (productId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ reviews: data || [] });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllReviews: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      set({ allReviews: data || [] });
    } catch (err) {
      console.error('Error fetching all reviews:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  submitReview: async (review: NewReview) => {
    set({ isSubmitting: true, submitSuccess: false });
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([review]);

      if (error) throw error;
      set({ submitSuccess: true });
      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  resetSubmitState: () => {
    set({ submitSuccess: false });
  },
}));
