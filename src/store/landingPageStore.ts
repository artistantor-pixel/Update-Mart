import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedLandingPage {
  id: string;
  productId: string;
  campaignName: string;
  createdAt: string;
}

interface LandingPageStore {
  savedPages: SavedLandingPage[];
  saveLandingPage: (productId: string, campaignName: string) => void;
  deleteLandingPage: (id: string) => void;
}

export const useLandingPageStore = create<LandingPageStore>()(
  persist(
    (set) => ({
      savedPages: [],
      
      saveLandingPage: (productId, campaignName) => {
        set((state) => {
          const newPage: SavedLandingPage = {
            id: `lp_${Date.now()}`,
            productId,
            campaignName,
            createdAt: new Date().toISOString(),
          };
          return { savedPages: [...state.savedPages, newPage] };
        });
      },

      deleteLandingPage: (id) => {
        set((state) => ({
          savedPages: state.savedPages.filter(page => page.id !== id)
        }));
      }
    }),
    {
      name: 'landing-page-storage',
    }
  )
);
