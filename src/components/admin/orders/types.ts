export type OrderStatus = 'New' | 'On Hold' | 'Reject Order' | 'Processing' | 'Assigned Courier' | 'Hand to Courier' | 'Shipped' | 'Payment (SF)' | 'Return' | 'Attention' | 'Delivered' | 'Printed Invoices';

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  address: string;
  district?: string;
  thana?: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  discountAmount?: number;
  promoCode?: string;
  deliveryCharge?: number;
  advancePayment?: number;
  paymentMethod: 'COD' | 'Paid';
  paymentStatus: 'Pending' | 'Verified' | 'Failed';
  assignedCourierId?: string;
  createdAt: string;
  orderNote?: string;
  timeline: OrderTimelineEvent[];
  isAccountedFor?: boolean;
}

export const initialMockOrders: Record<OrderStatus, Order[]> = {
  'New': [
    {
      id: 'ORD-18177858-578',
      customerName: 'Meraj',
      customerEmail: 'meraj@example.com',
      customerPhone: '01700000001',
      customerAvatar: 'ME',
      address: 'Puran Dhaka, Armanitola Ahmed bawany school er samne, Bangshal, Dhaka',
      status: 'New',
      items: [
        { id: 'p1', name: '145 Pcs Unicorn Kids Art Set Pink', variant: 'Kids Art Set 145 pcs-Pink', quantity: 1, price: 1020 }
      ],
      total: 1110,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      createdAt: new Date('2026-09-13T22:48:00Z').toISOString(),
      timeline: [
        { id: 't1', status: 'New', timestamp: new Date('2026-09-13T22:48:00Z').toISOString(), note: 'Order placed (guest)' }
      ]
    },
    {
      id: 'ORD-17766985-686',
      customerName: 'Rafija Nasrin',
      customerEmail: 'rafija@example.com',
      customerPhone: '01700000002',
      customerAvatar: 'RN',
      address: 'Dhanmondi, Dhaka',
      status: 'New',
      items: [
        { id: 'p2', name: 'Waterproof Smart Watch', variant: 'Black', quantity: 1, price: 1160 }
      ],
      total: 1160,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      createdAt: new Date('2026-09-13T20:30:00Z').toISOString(),
      timeline: [
        { id: 't2', status: 'New', timestamp: new Date('2026-09-13T20:30:00Z').toISOString(), note: 'Order placed (guest)' }
      ]
    }
  ],
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
