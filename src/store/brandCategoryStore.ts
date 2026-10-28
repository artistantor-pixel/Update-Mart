import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order?: number;
  item_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Watches',
    slug: 'watches',
    description: 'Luxury and casual analog and digital wristwatches',
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-2',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Cutting-edge gadgets, audio gear, and peripherals',
    image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-3',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Everyday carry essentials and lifestyle accessories',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'cat-4',
    name: 'Bags',
    slug: 'bags',
    description: 'Travel backpacks, minimalist briefcases, and messenger bags',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'cat-5',
    name: 'Smart Home',
    slug: 'smart-home',
    description: 'Automated home lighting, security sensors, and assistants',
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 5,
  },
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'br-1',
    name: 'Nova',
    slug: 'nova',
    description: 'Minimalist lifestyle and tech gear design studio',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    website_url: 'https://mart.updatekeybd.com',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'br-2',
    name: 'Apex',
    slug: 'apex',
    description: 'Precision engineering for high-performance accessories',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80',
    website_url: 'https://mart.updatekeybd.com',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'br-3',
    name: 'Aero',
    slug: 'aero',
    description: 'Ultra-lightweight travel gear and urban backpacks',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    website_url: 'https://mart.updatekeybd.com',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'br-4',
    name: 'Nordic',
    slug: 'nordic',
    description: 'Scandinavian minimalist aesthetics and timepieces',
    logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
    website_url: 'https://mart.updatekeybd.com',
    is_active: true,
    sort_order: 4,
  },
];

interface BrandCategoryStore {
  categories: Category[];
  brands: Brand[];
  isLoadingCategories: boolean;
  isLoadingBrands: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (cat: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleCategoryActive: (id: string) => Promise<void>;

  fetchBrands: () => Promise<void>;
  createBrand: (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<{ success: boolean; error?: string }>;
  deleteBrand: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleBrandActive: (id: string) => Promise<void>;

  resetData: () => void;
}

export const useBrandCategoryStore = create<BrandCategoryStore>()((set, get) => ({
  categories: INITIAL_CATEGORIES,
  brands: INITIAL_BRANDS,
  isLoadingCategories: false,
  isLoadingBrands: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoadingCategories: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        // If table does not exist yet, keep default initial categories
        if (error.code === '42P01') {
          console.warn("Categories table not created yet in Supabase. Using fallback.");
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        set({ categories: data as Category[] });
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      set({ error: err.message || 'Failed to load categories' });
    } finally {
      set({ isLoadingCategories: false });
    }
  },

  createCategory: async (cat) => {
    const tempId = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...cat,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic UI update
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          image_url: cat.image_url || null,
          is_active: cat.is_active ?? true,
          sort_order: cat.sort_order || 0,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === tempId ? (data as Category) : c)),
        }));
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error creating category:", err);
      // Revert optimistic insert on fatal error
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== tempId),
      }));
      return { success: false, error: err.message || 'Failed to create category' };
    }
  },

  updateCategory: async (id, updates) => {
    const previous = get().categories;

    // Optimistic UI update
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
      if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;

      const { error } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error updating category:", err);
      set({ categories: previous });
      return { success: false, error: err.message || 'Failed to update category' };
    }
  },

  deleteCategory: async (id) => {
    const previous = get().categories;

    // Optimistic UI removal
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting category:", err);
      set({ categories: previous });
      return { success: false, error: err.message || 'Failed to delete category' };
    }
  },

  toggleCategoryActive: async (id) => {
    const cat = get().categories.find((c) => c.id === id);
    if (!cat) return;
    await get().updateCategory(id, { is_active: !cat.is_active });
  },

  fetchBrands: async () => {
    set({ isLoadingBrands: true, error: null });
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          console.warn("Brands table not created yet in Supabase. Using fallback.");
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        set({ brands: data as Brand[] });
      }
    } catch (err: any) {
      console.error("Error fetching brands:", err);
      set({ error: err.message || 'Failed to load brands' });
    } finally {
      set({ isLoadingBrands: false });
    }
  },

  createBrand: async (brand) => {
    const tempId = `br-${Date.now()}`;
    const newBrand: Brand = {
      ...brand,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      brands: [...state.brands, newBrand],
    }));

    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([{
          name: brand.name,
          slug: brand.slug,
          description: brand.description || null,
          logo_url: brand.logo_url || null,
          website_url: brand.website_url || null,
          is_active: brand.is_active ?? true,
          sort_order: brand.sort_order || 0,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          brands: state.brands.map((b) => (b.id === tempId ? (data as Brand) : b)),
        }));
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error creating brand:", err);
      set((state) => ({
        brands: state.brands.filter((b) => b.id !== tempId),
      }));
      return { success: false, error: err.message || 'Failed to create brand' };
    }
  },

  updateBrand: async (id, updates) => {
    const previous = get().brands;

    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.logo_url !== undefined) dbUpdates.logo_url = updates.logo_url;
      if (updates.website_url !== undefined) dbUpdates.website_url = updates.website_url;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
      if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;

      const { error } = await supabase
        .from('brands')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error updating brand:", err);
      set({ brands: previous });
      return { success: false, error: err.message || 'Failed to update brand' };
    }
  },

  deleteBrand: async (id) => {
    const previous = get().brands;

    set((state) => ({
      brands: state.brands.filter((b) => b.id !== id),
    }));

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting brand:", err);
      set({ brands: previous });
      return { success: false, error: err.message || 'Failed to delete brand' };
    }
  },

  toggleBrandActive: async (id) => {
    const brand = get().brands.find((b) => b.id === id);
    if (!brand) return;
    await get().updateBrand(id, { is_active: !brand.is_active });
  },

  resetData: () => {
    set({
      categories: INITIAL_CATEGORIES,
      brands: INITIAL_BRANDS,
      isLoadingCategories: false,
      isLoadingBrands: false,
      error: null,
    });
  },
}));

