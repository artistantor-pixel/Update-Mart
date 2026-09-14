"use client";

import { useState } from 'react';
import { Download, Upload, Plus, Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useAccountingStore } from '@/store/accountingStore';
import { useProductStore } from '@/store/productStore';
import { OrderStatus } from './types';
import OrderTableRow from './OrderTableRow';
import EditOrderModal from './EditOrderModal';
import NewOrderModal from './NewOrderModal';
import { Order } from './types';

export default function OrderManagement() {
  const { columns, bulkUpdateStatus, updateOrder, addOrder } = useOrderStore();
  const { addTransaction, accounts } = useAccountingStore();
  const { products } = useProductStore();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  
  const allOrders = Object.values(columns).flat();
  const displayedOrders = activeTab === 'All Orders' ? allOrders : columns[activeTab as OrderStatus] || [];

  const tabsData = [
    { name: 'All Orders', count: allOrders.length },
    { name: 'New', count: columns['New']?.length || 0 },
    { name: 'On Hold', count: columns['On Hold']?.length || 0 },
    { name: 'Processing', count: columns['Processing']?.length || 0 },
    { name: 'Assigned Courier', count: columns['Assigned Courier']?.length || 0 },
    { name: 'Shipped', count: columns['Shipped']?.length || 0 },
    { name: 'Delivered', count: columns['Delivered']?.length || 0 },
    { name: 'Reject Order', count: columns['Reject Order']?.length || 0 },
  ];

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    if (newStatus === 'Delivered') {
      const order = allOrders.find(o => o.id === id);
      if (order && !order.isAccountedFor) {
        const cashAcc = accounts.find(a => a.type === 'cash') || accounts[0];
        
        // 1. Record Income (Sale)
        addTransaction({
          type: 'income',
          amount: order.total,
          category: 'Sales',
          accountId: cashAcc?.id,
          reference: `Order ${order.id}`
        });

        // 2. Record Expense (COGS)
        let totalCOGS = 0;
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.id);
          if (product && product.buyingPrice) {
            totalCOGS += (product.buyingPrice * item.quantity);
          }
        });

        if (totalCOGS > 0) {
          addTransaction({
            type: 'expense',
            amount: totalCOGS,
            category: 'Cost of Goods Sold (COGS)',
            accountId: cashAcc?.id,
            reference: `COGS for ${order.id}`
          });
        }

        // Mark as accounted
        updateOrder(id, { isAccountedFor: true });
      }
    }
    bulkUpdateStatus(new Set([id]), newStatus);
  };

  const handleSaveEdit = (id: string, updates: Partial<Order>) => {
    updateOrder(id, updates);
  };

  const handleSelectOrder = (id: string, selected: boolean) => {
    const newSet = new Set(selectedOrders);
    if (selected) newSet.add(id);
    else newSet.delete(id);
    setSelectedOrders(newSet);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(new Set(displayedOrders.map(o => o.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track customer orders efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm shadow-sm">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col flex-1 overflow-hidden shadow-sm">
        
        {/* Simple Tabs */}
        <div className="border-b border-slate-200 dark:border-white/5 px-2 overflow-x-auto custom-scrollbar">
          <div className="flex w-max min-w-full">
            {tabsData.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-5 py-4 border-b-2 font-medium transition-colors whitespace-nowrap text-sm ${
                  activeTab === tab.name 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                {tab.name}
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.name ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Clean Filter Bar */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-dark-800/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by order ID, customer name, or email..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm w-full sm:w-auto justify-center">
              <Filter size={16} /> Status: All <ChevronDown size={14} className="ml-1 opacity-50" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm w-full sm:w-auto justify-center">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions (Appears only when items selected) */}
        {selectedOrders.size > 0 && (
          <div className="bg-primary-50 dark:bg-primary-900/20 px-6 py-3 flex items-center justify-between border-b border-primary-100 dark:border-primary-900/30">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-400">{selectedOrders.size} order(s) selected</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white border border-primary-200 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">Update Status</button>
              <button className="px-3 py-1.5 bg-white border border-primary-200 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">Print Slips</button>
            </div>
          </div>
        )}

        {/* Spacious Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-dark-800 sticky top-0 z-10">
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 pl-6 pr-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={displayedOrders.length > 0 && selectedOrders.size === displayedOrders.length}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Order Details</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.length > 0 ? (
                displayedOrders.map(order => (
                  <OrderTableRow 
                    key={order.id} 
                    order={order} 
                    isSelected={selectedOrders.has(order.id)}
                    onSelect={handleSelectOrder}
                    onStatusChange={handleStatusChange}
                    onEdit={(orderToEdit) => setEditingOrder(orderToEdit)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
                        <Search size={24} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No orders found</h3>
                      <p className="text-slate-500 max-w-sm">There are no orders matching your current filters in this category.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit Order Modal */}
      <EditOrderModal 
        order={editingOrder} 
        isOpen={!!editingOrder} 
        onClose={() => setEditingOrder(null)} 
        onSave={handleSaveEdit} 
      />

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSave={(order) => addOrder(order)}
      />
    </div>
  );
}
