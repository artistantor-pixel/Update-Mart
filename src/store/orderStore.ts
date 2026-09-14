import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus, initialMockOrders } from '@/components/admin/orders/types';
import { supabase } from '@/lib/supabase';

interface OrderStore {
  columns: Record<OrderStatus, Order[]>;
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateColumns: (newColumns: Record<OrderStatus, Order[]>) => void;
  bulkUpdateStatus: (orderIds: Set<string>, newStatus: OrderStatus) => Promise<void>;
  updateOrderNote: (orderId: string, note: string) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      columns: initialMockOrders,
      isLoading: false,

      fetchOrders: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.from('orders').select('*');
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Group by status
            const newColumns = { ...initialMockOrders };
            data.forEach((dbOrder) => {
              const o: Order = {
                id: dbOrder.id,
                customerName: dbOrder.customer_name,
                customerEmail: dbOrder.customer_email,
                customerPhone: dbOrder.customer_phone,
                customerAvatar: dbOrder.customer_avatar,
                address: dbOrder.address,
                district: dbOrder.district,
                thana: dbOrder.thana,
                status: dbOrder.status as OrderStatus,
                total: dbOrder.total,
                discountAmount: dbOrder.discount_amount,
                promoCode: dbOrder.promo_code,
                deliveryCharge: dbOrder.delivery_charge,
                advancePayment: dbOrder.advance_payment,
                paymentMethod: dbOrder.payment_method,
                paymentStatus: dbOrder.payment_status,
                assignedCourierId: dbOrder.assigned_courier_id,
                orderNote: dbOrder.order_note,
                isAccountedFor: dbOrder.is_accounted_for,
                createdAt: dbOrder.created_at,
                items: [], // Would fetch from order_items in a real app, keeping simple for now
                timeline: [] // Would fetch from order_timelines
              };
              
              if (newColumns[o.status]) {
                newColumns[o.status].push(o);
              }
            });
            set({ columns: newColumns });
          }
        } catch (err) {
          console.error("Error fetching orders from Supabase:", err);
        } finally {
          set({ isLoading: false });
        }
      },
      
      addOrder: async (order) => {
        // Optimistic UI update
        set((state) => {
          const newColumns = { ...state.columns };
          newColumns['New'] = [order, ...newColumns['New']];
          return { columns: newColumns };
        });

        try {
          const dbOrder = {
            id: order.id,
            customer_name: order.customerName,
            customer_email: order.customerEmail,
            customer_phone: order.customerPhone,
            customer_avatar: order.customerAvatar,
            address: order.address,
            district: order.district,
            thana: order.thana,
            status: order.status,
            total: order.total,
            discount_amount: order.discountAmount || 0,
            promo_code: order.promoCode,
            delivery_charge: order.deliveryCharge || 0,
            advance_payment: order.advancePayment || 0,
            payment_method: order.paymentMethod,
            payment_status: order.paymentStatus,
            created_at: order.createdAt
          };
          const { error } = await supabase.from('orders').insert([dbOrder]);
          if (error) throw error;
        } catch (err) {
          console.error("Error inserting order to Supabase:", err);
        }
      },
      
      updateColumns: (newColumns) => set({ columns: newColumns }),
      
      bulkUpdateStatus: async (orderIds, newStatus) => {
        set((state) => {
          const newColumns = { ...state.columns };
          const movedOrders: Order[] = [];
          
          (Object.keys(newColumns) as OrderStatus[]).forEach(col => {
            newColumns[col] = newColumns[col].filter(order => {
              if (orderIds.has(order.id)) {
                movedOrders.push(order);
                return false;
              }
              return true;
            });
          });

          movedOrders.forEach(order => {
            order.status = newStatus;
            order.timeline = [
              { id: `t-${Date.now()}-${Math.random()}`, status: newStatus, timestamp: new Date().toISOString(), note: `Bulk updated to ${newStatus}` },
              ...order.timeline
            ];
            if (!newColumns[newStatus]) newColumns[newStatus] = [];
            newColumns[newStatus].push(order);
          });

          return { columns: newColumns };
        });

        try {
          const { error } = await supabase.from('orders').update({ status: newStatus }).in('id', Array.from(orderIds));
          if (error) throw error;
        } catch (err) {
          console.error("Error bulk updating status:", err);
        }
      },
      
      updateOrderNote: async (orderId, note) => {
        set((state) => {
          const newColumns = { ...state.columns };
          (Object.keys(newColumns) as OrderStatus[]).forEach(col => {
            newColumns[col] = newColumns[col].map(order => {
              if (order.id === orderId) {
                return { ...order, orderNote: note };
              }
              return order;
            });
          });
          return { columns: newColumns };
        });

        try {
          const { error } = await supabase.from('orders').update({ order_note: note }).eq('id', orderId);
          if (error) throw error;
        } catch (err) {
          console.error("Error updating order note:", err);
        }
      },
      
      updateOrder: async (orderId, updates) => {
        set((state) => {
          const newColumns = { ...state.columns };
          (Object.keys(newColumns) as OrderStatus[]).forEach(col => {
            newColumns[col] = newColumns[col].map(order => {
              if (order.id === orderId) {
                const updatedOrder = { ...order, ...updates };
                if (updates.items) {
                  const subtotal = updates.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const shipping = subtotal > 0 ? 15.00 : 0;
                  const codFee = order.paymentMethod === 'COD' ? 5.00 : 0; 
                  updatedOrder.total = subtotal + shipping + codFee;
                }
                updatedOrder.timeline = [
                  { id: `t-${Date.now()}`, status: order.status, timestamp: new Date().toISOString(), note: 'Order details updated by admin' },
                  ...order.timeline
                ];
                return updatedOrder;
              }
              return order;
            });
          });
          return { columns: newColumns };
        });
      }
    }),
    {
      name: 'updatemart-orders-storage',
    }
  )
);
