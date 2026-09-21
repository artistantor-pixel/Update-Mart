"use client";

import { useState, useMemo } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { Search, Filter, Star, TrendingUp, Users as UsersIcon, MapPin, Mail, Phone, Package, Calendar, Award, ChevronDown, ShieldAlert, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settingsStore';

interface CustomerData {
  phone: string;
  name: string;
  email: string;
  address: string;
  district: string;
  thana: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  purchasedCategories: Set<string>;
  purchasedVariants: Set<string>;
  avatar: string;
}

export default function CustomerManagement() {
  const { columns } = useOrderStore();
  const { products } = useProductStore();
  const { blockedPhones, toggleBlockPhone } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVariant, setSelectedVariant] = useState<string>('All');

  // Compute Customer Data from Orders
  const { customersList, uniqueCategories, uniqueVariants, metrics } = useMemo(() => {
    const allOrders = Object.values(columns).flat();
    const customersMap = new Map<string, CustomerData>();
    const categories = new Set<string>();
    const variants = new Set<string>();

    let totalRevenue = 0;

    allOrders.forEach(order => {
      // Exclude generic fake orders if any, or cancelled ones (optional)
      if (order.status === 'Reject Order' || order.status === 'Return') return;

      const phone = order.customerPhone || 'Unknown';
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          phone,
          name: order.customerName || 'Unknown',
          email: order.customerEmail || '',
          address: order.address || '',
          district: order.district || '',
          thana: order.thana || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: new Date(order.createdAt),
          purchasedCategories: new Set(),
          purchasedVariants: new Set(),
          avatar: order.customerAvatar || order.customerName?.charAt(0).toUpperCase() || 'U'
        });
      }
      
      const customer = customersMap.get(phone)!;
      customer.totalOrders += 1;
      customer.totalSpent += order.total;
      totalRevenue += order.total;
      
      const orderDate = new Date(order.createdAt);
      if (orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = orderDate;
        customer.name = order.customerName; // update to latest info
        customer.address = order.address;
        customer.district = order.district || '';
        customer.thana = order.thana || '';
      }
      
      order.items.forEach(item => {
        // Find product to get category
        const product = products.find(p => p.id === item.id || p.name === item.name);
        if (product && product.category) {
          customer.purchasedCategories.add(product.category);
          categories.add(product.category);
        }
        if (item.variant && item.variant !== 'Standard') {
          customer.purchasedVariants.add(item.variant);
          variants.add(item.variant);
        }
      });
    });

    const customersArray = Array.from(customersMap.values());
    const repeatCustomersCount = customersArray.filter(c => c.totalOrders > 1).length;

    // Sort by total spent descending
    customersArray.sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      customersList: customersArray,
      uniqueCategories: Array.from(categories).sort(),
      uniqueVariants: Array.from(variants).sort(),
      metrics: {
        totalCustomers: customersArray.length,
        repeatCustomers: repeatCustomersCount,
        repeatPercentage: customersArray.length > 0 ? Math.round((repeatCustomersCount / customersArray.length) * 100) : 0,
        topSpender: customersArray[0] || null
      }
    };
  }, [columns, products]);

  // Filter Logic
  const filteredCustomers = useMemo(() => {
    return customersList.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = selectedCategory === 'All' || customer.purchasedCategories.has(selectedCategory);
      const matchesVariant = selectedVariant === 'All' || customer.purchasedVariants.has(selectedVariant);

      return matchesSearch && matchesCategory && matchesVariant;
    });
  }, [customersList, searchQuery, selectedCategory, selectedVariant]);

  const topCustomers = customersList.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Customer Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <UsersIcon size={64} className="text-primary-500" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Customers</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{metrics.totalCustomers}</h3>
              <p className="text-xs font-medium text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> Growing steadily
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <Star size={64} className="text-amber-500" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Repeat Customers</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-end gap-2">
                {metrics.repeatCustomers}
                <span className="text-sm font-medium text-amber-500 mb-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">{metrics.repeatPercentage}%</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-2">Loyalty rate</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-6 rounded-3xl shadow-xl shadow-primary-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10 text-white">
              <p className="text-sm font-medium text-white/80 mb-1">Top Spender</p>
              {metrics.topSpender ? (
                <>
                  <h3 className="text-2xl font-black mb-1 truncate">{metrics.topSpender.name}</h3>
                  <p className="text-xl font-bold text-white/90">৳ {metrics.topSpender.totalSpent.toLocaleString()}</p>
                  <p className="text-xs font-medium text-white/70 mt-2 flex items-center gap-1">
                    <Award size={14} /> VIP Customer
                  </p>
                </>
              ) : (
                <p className="text-lg">No data yet</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Top 3 Leaderboard */}
      {topCustomers.length > 0 && (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-amber-500" size={24} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top 3 Loyal Customers</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topCustomers.map((customer, idx) => (
              <div key={customer.phone} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-900/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}></div>
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shadow-inner">
                  {customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{customer.name}</h4>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">৳ {customer.totalSpent.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center">
                    #{idx + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table & Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        
        {/* Filters Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-dark-900/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">Customer Directory</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative group flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-medium text-slate-700 dark:text-slate-300 w-full sm:w-40"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              {/* Variant/Color Filter */}
              <div className="relative">
                <select 
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="appearance-none bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-medium text-slate-700 dark:text-slate-300 w-full sm:w-40"
                >
                  <option value="All">All Colors/Vars</option>
                  {uniqueVariants.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Contact & Location</th>
                <th className="py-4 px-6">Preferences</th>
                <th className="py-4 px-6 text-center">Orders</th>
                <th className="py-4 px-6 text-right">Total Spent</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <UsersIcon size={48} className="text-slate-300 dark:text-slate-700" />
                      <p className="font-medium text-lg">No customers found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const isBlocked = (blockedPhones || []).includes(customer.phone);
                  return (
                  <tr key={customer.phone} className={`hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group ${isBlocked ? 'opacity-50 grayscale' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isBlocked ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
                          {customer.avatar}
                        </div>
                        <div>
                          <p className={`font-bold ${isBlocked ? 'text-red-500 line-through' : 'text-slate-900 dark:text-white'}`}>{customer.name} {isBlocked && '(Blocked)'}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} /> Last order: {customer.lastOrderDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <Mail size={12} className="text-slate-400" /> {customer.email}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 flex items-start gap-2 max-w-[200px] truncate">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0 mt-0.5" /> 
                          {customer.district ? `${customer.thana ? customer.thana + ', ' : ''}${customer.district}` : 'No specific location'}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Array.from(customer.purchasedCategories).slice(0, 3).map(cat => (
                          <span key={cat} className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                            {cat}
                          </span>
                        ))}
                        {customer.purchasedCategories.size > 3 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            +{customer.purchasedCategories.size - 3}
                          </span>
                        )}
                        {/* Show one variant as example if they buy specific colors */}
                        {Array.from(customer.purchasedVariants).slice(0, 1).map(v => (
                          <span key={v} className="px-2 py-0.5 rounded text-[10px] font-medium bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20">
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center bg-slate-100 dark:bg-dark-700 w-8 h-8 rounded-full font-bold text-slate-700 dark:text-slate-300">
                        {customer.totalOrders}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <p className="font-bold text-slate-900 dark:text-white">৳ {customer.totalSpent.toLocaleString()}</p>
                      {customer.totalOrders > 1 && !isBlocked && (
                        <p className="text-xs text-green-500 font-medium mt-0.5">Repeat V.I.P</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      {isBlocked ? (
                        <button 
                          onClick={() => {
                            if(confirm(`Are you sure you want to unblock ${customer.name}?`)) {
                              toggleBlockPhone(customer.phone, false);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center w-full"
                          title="Unblock Customer"
                        >
                          <ShieldCheck size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if(confirm(`Are you sure you want to block ${customer.name}? They will not be able to place new orders.`)) {
                              toggleBlockPhone(customer.phone, true);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center w-full"
                          title="Block Customer"
                        >
                          <ShieldAlert size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
