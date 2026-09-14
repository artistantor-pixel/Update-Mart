import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Format: productId-variant
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const id = `${item.productId}-${item.variant}`;
        const existingItem = state.items.find(i => i.id === id);
        
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.id === id 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        }
        
        return {
          items: [...state.items, { ...item, id }]
        };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'updatemart-cart-storage',
    }
  )
);
