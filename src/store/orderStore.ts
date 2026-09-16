import { create } from 'zustand';
import { Order, OrderStatus } from '@/components/admin/orders/types';
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

const emptyOrders: Record<OrderStatus, Order[]> = {
  'New': [],
  'On Hold': [],
  'Reject Order': [],
  'Processing': [],
  'Assigned Courier': [],
  'Hand to Courier': [],
  'Shipped': [],
  'Payment (SF)': [],
  'Return': [],
  'Attention': [],
  'Delivered': [],
  'Printed Invoices': []
};

export const useOrderStore = create<OrderStore>()((set, get) => ({
  columns: emptyOrders,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      
      if (data) {
        // Group by status
        const newColumns = { ...emptyOrders };
        // Create new empty arrays instead of mutating
        (Object.keys(newColumns) as OrderStatus[]).forEach(k => {
           newColumns[k] = [];
        });

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
            promoCode: dbOrder.promoCode,
            deliveryCharge: dbOrder.delivery_charge,
            advancePayment: dbOrder.advance_payment,
            paymentMethod: dbOrder.payment_method,
            paymentStatus: dbOrder.payment_status,
            assignedCourierId: dbOrder.assigned_courier_id,
            orderNote: dbOrder.order_note,
            isAccountedFor: dbOrder.is_accounted_for,
            createdAt: dbOrder.created_at,
            items: dbOrder.items || [], 
            timeline: dbOrder.timeline || [],
            consignmentId: dbOrder.consignment_id,
            courierStatus: dbOrder.courier_status
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
        created_at: order.createdAt,
        items: order.items,
        timeline: order.timeline,
        order_note: order.orderNote
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

    try {
      const dbUpdates: any = {};
      if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.items !== undefined) dbUpdates.items = updates.items;
      if (updates.timeline !== undefined) dbUpdates.timeline = updates.timeline;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.district !== undefined) dbUpdates.district = updates.district;
      if (updates.thana !== undefined) dbUpdates.thana = updates.thana;
      if (updates.customerPhone !== undefined) dbUpdates.customer_phone = updates.customerPhone;
      if (updates.total !== undefined) dbUpdates.total = updates.total;
      if (updates.deliveryCharge !== undefined) dbUpdates.delivery_charge = updates.deliveryCharge;
      if (updates.advancePayment !== undefined) dbUpdates.advance_payment = updates.advancePayment;
      if (updates.discountAmount !== undefined) dbUpdates.discount_amount = updates.discountAmount;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from('orders').update(dbUpdates).eq('id', orderId);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Error updating order in Supabase:", err);
    }
  }
}));
