import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductColor {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface ProductVariant {
  name: string;   // Color | Size | Material
  value: string;
  price: string;
  stock: string;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;       // effective price (sale price if set)
  image: string;       // primary/thumbnail image
  rating: number;
  category: string;
  brand: string;
  isNew?: boolean;

  // Extended fields
  images?: string[];           // gallery images (first = main)
  buyingPrice?: number;        // wholesale/acquisition cost
  salePrice?: number;          // discounted price
  regularPrice?: number;       // original price before discount
  stock?: number;
  colors?: ProductColor[];
  variants?: ProductVariant[];
  description?: string;
  specs?: ProductSpec[];
  warranty?: string;
  deliveryType?: string;
  metaTitle?: string;
  metaDesc?: string;
  isLive?: boolean;
  videoUrl?: string;
  tags?: string[];
  
  // Variant Mapping
  primaryColor?: { name: string; hex: string };
  variantGroupId?: string;
}

const INITIAL_PRODUCTS: Product[] = [
  // Watches
  { id: 'p1', name: 'Obsidian Chronograph', price: 299.99, regularPrice: 399.99, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.8, category: 'Watches', brand: 'Obsidian', isNew: true, colors: [{name: 'Obsidian Black', hex: '#1e293b'}, {name: 'Silver', hex: '#e2e8f0'}], warranty: '2 Year Warranty', deliveryType: 'Standard Delivery', isLive: true },
  { id: 'watch-combo-01', name: 'Minimalist Titanium Timepiece', price: 189.50, regularPrice: 252.04, image: 'https://images.unsplash.com/photo-1508656946663-cb417106dbbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.5, category: 'Watches', brand: 'Nova', isNew: false, colors: [{name: 'Obsidian Black', hex: '#1e293b'}, {name: 'Titanium Silver', hex: '#e2e8f0'}, {name: 'Rose Gold', hex: '#b76e79'}], warranty: '2 Year Warranty', deliveryType: 'Standard Delivery', isLive: true, description: 'The Obsidian Chronograph brings together high-grade titanium construction with precision movement. Designed for the modern professional who demands both aesthetics and functionality.', specs: [{key: 'Case Diameter', value: '42mm'}, {key: 'Crystal', value: 'Sapphire Crystal Glass'}, {key: 'Water Resistance', value: '50m'}, {key: 'Movement', value: 'Automatic'}] },
  { id: 'p3', name: 'Luna Smartwatch Series 4', price: 249.99, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.7, category: 'Watches', brand: 'Luna', isNew: true, warranty: '1 Year Warranty', isLive: true },
  { id: 'p4', name: 'Vintage Leather Automatic', price: 345.00, image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.9, category: 'Watches', brand: 'Craft', isNew: false, warranty: '2 Year Warranty', isLive: true },

  // Electronics
  { id: 'p5', name: 'Aero Noise-Cancelling Earbuds', price: 149.00, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.9, category: 'Electronics', brand: 'Aero', isNew: true, isLive: true },
  { id: 'p6', name: 'Wireless Charging Stand', price: 35.50, image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.3, category: 'Electronics', brand: 'Aero', isNew: false, isLive: true },
  { id: 'p7', name: 'Nova Pro Studio Headphones', price: 199.99, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.6, category: 'Electronics', brand: 'Nova', isNew: true, isLive: true },
  { id: 'p8', name: 'Portable Power Bank 20k', price: 59.00, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.5, category: 'Electronics', brand: 'Vanguard', isNew: false, isLive: true },

  // Bags
  { id: 'p9', name: 'Urban Tech Commuter Backpack', price: 89.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.6, category: 'Bags', brand: 'Vanguard', isNew: false, isLive: true },
  { id: 'p10', name: 'Classic Canvas Messenger', price: 65.00, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.4, category: 'Bags', brand: 'Craft', isNew: false, isLive: true },
  { id: 'p11', name: 'Minimalist Laptop Sleeve', price: 29.99, image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.2, category: 'Bags', brand: 'Obsidian', isNew: true, isLive: true },
  { id: 'p12', name: 'Weekend Duffel Bag', price: 110.00, image: 'https://images.unsplash.com/photo-1550801642-12711bbdf958?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.7, category: 'Bags', brand: 'Vanguard', isNew: false, isLive: true },

  // Accessories
  { id: 'p13', name: 'Premium Leather Wallet', price: 45.00, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.4, category: 'Accessories', brand: 'Craft', isNew: false, isLive: true },
  { id: 'p14', name: 'Polarized Aviator Sunglasses', price: 120.00, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.8, category: 'Accessories', brand: 'Nova', isNew: true, isLive: true },
  { id: 'p15', name: 'Titanium Key Organizer', price: 24.50, image: 'https://images.unsplash.com/photo-1582136066708-4122dcc9a334?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.5, category: 'Accessories', brand: 'Obsidian', isNew: false, isLive: true },
  { id: 'p16', name: 'Braided Charging Cable Set', price: 18.00, image: 'https://images.unsplash.com/photo-1605380536761-00271507df0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.1, category: 'Accessories', brand: 'Aero', isNew: false, isLive: true },

  // Smart Home
  { id: 'p17', name: 'Luna Smart Speaker', price: 129.99, image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.6, category: 'Smart Home', brand: 'Luna', isNew: true, isLive: true },
  { id: 'p18', name: 'Wifi Security Camera', price: 89.00, image: 'https://images.unsplash.com/photo-1557322984-7a62e402e783?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.3, category: 'Smart Home', brand: 'Vanguard', isNew: false, isLive: true },
  { id: 'p19', name: 'Smart LED Bulb Pack (4)', price: 49.99, image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.7, category: 'Smart Home', brand: 'Luna', isNew: false, isLive: true },
  { id: 'p20', name: 'Smart Thermostat Dial', price: 199.00, image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', rating: 4.8, category: 'Smart Home', brand: 'Nova', isNew: true, isLive: true },
];

import { supabase } from '@/lib/supabase';

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setVariantGroup: (productIds: string[], groupId: string) => void;
  removeVariantGroup: (productId: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      isLoading: false,

      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            // Map db snake_case to camelCase where needed
            const formattedProducts = data.map(p => ({
              ...p,
              regularPrice: p.regular_price,
              isNew: p.is_new,
              deliveryType: p.delivery_type,
              isLive: p.is_live
            })) as Product[];
            set({ products: formattedProducts });
          }
        } catch (error) {
          console.error('Error fetching products from Supabase:', error);
          // Fallback to local data if Supabase fails (e.g. not configured yet)
        } finally {
          set({ isLoading: false });
        }
      },

      addProduct: async (product) => {
        // Optimistic update
        set((state) => ({ products: [product, ...state.products] }));
        
        try {
          const dbProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            regular_price: product.regularPrice,
            image: product.image,
            rating: product.rating,
            category: product.category,
            brand: product.brand,
            is_new: product.isNew,
            description: product.description,
            warranty: product.warranty,
            delivery_type: product.deliveryType,
            is_live: product.isLive,
            stock: product.stock,
            colors: product.colors,
            variants: product.variants,
            specs: product.specs,
            images: product.images,
            tags: product.tags
          };
          
          const { error } = await supabase.from('products').insert([dbProduct]);
          if (error) throw error;
        } catch (error) {
          console.error('Error adding product to Supabase:', error);
          // In a real app, you might want to rollback the optimistic update here
        }
      },

      updateProduct: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
        }));

        try {
          const dbUpdates: any = { ...updates };
          if (updates.regularPrice !== undefined) dbUpdates.regular_price = updates.regularPrice;
          if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
          if (updates.deliveryType !== undefined) dbUpdates.delivery_type = updates.deliveryType;
          if (updates.isLive !== undefined) dbUpdates.is_live = updates.isLive;
          
          // Remove camelCase keys from db updates
          delete dbUpdates.regularPrice;
          delete dbUpdates.isNew;
          delete dbUpdates.deliveryType;
          delete dbUpdates.isLive;
          delete dbUpdates.id;

          const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
          if (error) throw error;
        } catch (error) {
          console.error('Error updating product in Supabase:', error);
        }
      },

      deleteProduct: async (id) => {
        // Optimistic update
        set((state) => ({
          products: state.products.filter(p => p.id !== id)
        }));

        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
        } catch (error) {
          console.error('Error deleting product from Supabase:', error);
        }
      },

      setVariantGroup: (productIds, groupId) => set((state) => ({
        products: state.products.map(p => 
          productIds.includes(p.id) ? { ...p, variantGroupId: groupId } : p
        )
      })),

      removeVariantGroup: (productId) => set((state) => ({
        products: state.products.map(p => 
          p.id === productId ? { ...p, variantGroupId: undefined } : p
        )
      }))
    }),
    {
      name: 'updatemart-products-storage',
    }
  )
);
