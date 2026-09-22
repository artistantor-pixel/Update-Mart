"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, TrendingUp, DollarSign, Package, Plus, Edit2, Trash2, Truck, Layout, Activity, Layers, Wallet, Ticket, Shield, MessageSquare } from 'lucide-react';
import AddProductForm from '@/components/admin/AddProductForm';
import OrderManagement from '@/components/admin/orders/OrderManagement';
import HomepageEditor from '@/components/admin/homepage/HomepageEditor';
import CourierManagement from '@/components/admin/couriers/CourierManagement';
import LandingPageManager from '@/components/admin/marketing/LandingPageManager';
import VariantMapManager from '@/components/admin/variants/VariantMapManager';
import AccountingManager from '@/components/admin/accounting/AccountingManager';
import PromoManager from '@/components/admin/promotions/PromoManager';
import UserManager from '@/components/admin/users/UserManager';
import CustomerManagement from '@/components/admin/customers/CustomerManagement';
import SupportManagement from '@/components/admin/support/SupportManagement';
import DashboardOverview from '@/components/admin/dashboard/DashboardOverview';
import MetaAdsDashboard from '@/components/admin/marketing/MetaAdsDashboard';
import Login from '@/components/admin/auth/Login';
import { useOrderStore } from '@/store/orderStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useProductStore } from '@/store/productStore';
import { useUserStore } from '@/store/userStore';
import { useCourierStore } from '@/store/courierStore';
import { useSession, signOut } from 'next-auth/react';
import { setSupabaseToken } from '@/lib/supabase';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const authorizedUsers = useUserStore((state) => state.authorizedUsers);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'variants' | 'customers' | 'support' | 'settings' | 'couriers' | 'homepage' | 'marketing' | 'meta-ads' | 'accounting' | 'promotions' | 'users'>('overview');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<import('@/store/productStore').Product | null>(null);
  const { isCODEnabled, toggleCOD, codFee, setCodFee, topBar, setTopBar, footer, setFooter, fetchSettings } = useSettingsStore();
  const fetchCouriers = useCourierStore((state) => state.fetchCouriers);

  useEffect(() => {
    if ((session as any)?.supabaseToken) {
      setSupabaseToken((session as any).supabaseToken);
      fetchSettings();
      fetchProducts();
      fetchOrders();
      fetchCouriers();
    } else if (status === 'unauthenticated') {
      setSupabaseToken(null);
    }
  }, [session, status, fetchSettings, fetchProducts, fetchOrders, fetchCouriers]);

  const handleDeleteProduct = (id: string, name: string) => {
    // Bypassing window.confirm in case it's suppressed by the browser
    deleteProduct(id);
  };

  useEffect(() => {
    document.title = 'Admin Dashboard | Update Mart';
  }, []);

  const getRole = () => {
    if (!session?.user?.email) return null;

    // Use role from Supabase session if available
    const sessionRole = (session.user as any).role;
    if (sessionRole) return sessionRole;

    // Fallback to local authorized list
    const userEmail = session.user.email.toLowerCase();
    const foundUser = authorizedUsers.find(u => u.email === userEmail);
    return foundUser ? foundUser.role : null;
  };

  const hasAccess = (tab: string) => {
    const role = getRole();
    if (!role) return false;

    if (role === 'Super Admin') return true;

    if (role === 'Manager') {
      return ['overview', 'orders', 'products', 'variants', 'customers', 'support', 'couriers', 'meta-ads'].includes(tab);
    }

    if (role === 'Editor') {
      return ['homepage', 'marketing', 'promotions', 'products', 'meta-ads'].includes(tab);
    }

    if (role === 'Accountant') {
      return ['overview', 'orders', 'accounting'].includes(tab);
    }

    return false;
  };

  useEffect(() => {
    // If user's role doesn't have access to current tab, redirect to their default
    const role = getRole();
    if (role && !hasAccess(activeTab)) {
      if (role === 'Editor') setActiveTab('homepage');
      else setActiveTab('overview');
    }
  }, [session, authorizedUsers, activeTab]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <Login />;
  }

  // Handle case where user is logged in but their email is not mapped to an admin role
  const role = getRole();
  if (session.user && !role) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/5 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Your account ({session.user.email}) is not authorized to access the admin dashboard.</p>
          <button
            onClick={() => signOut()}
            className="w-full bg-slate-900 dark:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            Sign out and try another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex text-slate-900 dark:text-white transition-colors">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-white/5 flex flex-col transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="Update Mart" width={240} height={69} className="w-auto h-12 dark:brightness-0 dark:invert transition-all" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {hasAccess('overview') && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <LayoutDashboard size={20} /> Overview
            </button>
          )}
          {hasAccess('products') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <ShoppingBag size={20} /> Products
            </button>
          )}
          {hasAccess('variants') && (
            <button
              onClick={() => setActiveTab('variants')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'variants' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Layers size={20} /> Variant Maps
            </button>
          )}
          {hasAccess('homepage') && (
            <button
              onClick={() => setActiveTab('homepage')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'homepage' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Layout size={20} /> Homepage
            </button>
          )}
          {hasAccess('orders') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Package size={20} /> Orders
            </button>
          )}
          {hasAccess('couriers') && (
            <button
              onClick={() => setActiveTab('couriers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'couriers' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Truck size={20} /> Couriers
            </button>
          )}
          {hasAccess('accounting') && (
            <button
              onClick={() => setActiveTab('accounting')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'accounting' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Wallet size={20} /> Accounting
            </button>
          )}
          {hasAccess('customers') && (
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'customers' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Users size={20} /> Customers
            </button>
          )}
          {hasAccess('customers') && (
            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'support' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <MessageSquare size={20} /> Support Tickets
            </button>
          )}
          {hasAccess('marketing') && (
            <button
              onClick={() => setActiveTab('marketing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'marketing' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-800 hover:text-primary-500 dark:hover:text-primary-400'}`}
            >
              <Activity size={20} className={activeTab === 'marketing' ? 'text-white' : 'text-slate-400'} /> Marketing
            </button>
          )}
          {hasAccess('meta-ads') && (
            <button
              onClick={() => setActiveTab('meta-ads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'meta-ads' ? 'bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/20 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${activeTab === 'meta-ads' ? 'text-white' : 'text-slate-400'}`}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Meta Ads
            </button>
          )}
          {hasAccess('promotions') && (
            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'promotions' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Ticket size={20} /> Promotions
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
          {hasAccess('users') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Shield size={20} /> Users & Roles
            </button>
          )}
          {hasAccess('settings') && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Settings size={20} /> Settings
            </button>
          )}
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut size={20} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{session.user.name}</p>
              <p className="text-xs text-slate-500">{role}</p>
            </div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary-200 dark:border-primary-800 shadow-sm">
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <DashboardOverview />
        )}

        {activeTab === 'products' && !isAddingProduct && !editingProduct && (
          <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-center">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left">Products Catalog</h2>
                <p className="text-sm text-slate-500 text-left mt-1">Manage your store's inventory and listings.</p>
              </div>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <Plus size={18} /> Add New Product
              </button>
            </div>

            <div className="overflow-x-auto text-left">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <th className="pb-4 font-medium">Product</th>
                    <th className="pb-4 font-medium">Category</th>
                    <th className="pb-4 font-medium">Price</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                      <td className="py-4 flex items-center gap-4">
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                          <Image src={product.image} alt={product.name} className="object-cover" fill={true} style={{ objectFit: "cover" }} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-700 text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-900 dark:text-white text-sm">
                        ৳{product.price.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProduct(product.id, product.name);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && isAddingProduct && (
          <AddProductForm onCancel={() => setIsAddingProduct(false)} />
        )}

        {activeTab === 'products' && editingProduct && (
          <AddProductForm onCancel={() => setEditingProduct(null)} editProduct={editingProduct} />
        )}

        {activeTab === 'variants' && (
          <VariantMapManager />
        )}

        {activeTab === 'orders' && (
          <OrderManagement />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-left max-w-3xl mx-auto mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-white/5 pb-4">Store Settings</h2>

            <div className="space-y-10">
              {/* Payment Settings */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><DollarSign size={20} className="text-primary-500" /> Payment Settings</h3>
                <div className="space-y-6 bg-slate-50 dark:bg-dark-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Cash on Delivery (COD)</p>
                      <p className="text-sm text-slate-500">Allow customers to pay upon receiving the product.</p>
                    </div>
                    <button
                      onClick={() => toggleCOD(!isCODEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isCODEnabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isCODEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {isCODEnabled && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">COD Additional Fee (৳)</label>
                      <input
                        type="number"
                        value={codFee}
                        onChange={(e) => setCodFee(Number(e.target.value))}
                        className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Top Bar Settings */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Layout size={20} className="text-primary-500" /> Top Announcement Bar</h3>
                <div className="space-y-4 bg-slate-50 dark:bg-dark-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Enable Top Bar</p>
                      <p className="text-sm text-slate-500">Show a notification bar above the navigation menu.</p>
                    </div>
                    <button
                      onClick={() => setTopBar({ ...topBar, enabled: !topBar.enabled })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${topBar?.enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${topBar?.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {topBar?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                        <input
                          type="text"
                          value={topBar.message}
                          onChange={(e) => setTopBar({ ...topBar, message: e.target.value })}
                          className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          placeholder="e.g. FREE SHIPPING ON ORDERS OVER ৳5000!"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Link Text (Optional)</label>
                          <input
                            type="text"
                            value={topBar.linkText}
                            onChange={(e) => setTopBar({ ...topBar, linkText: e.target.value })}
                            className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                            placeholder="e.g. Shop Now"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Link URL</label>
                          <input
                            type="text"
                            value={topBar.linkUrl}
                            onChange={(e) => setTopBar({ ...topBar, linkUrl: e.target.value })}
                            className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                            placeholder="e.g. /products"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={topBar.bgColor}
                              onChange={(e) => setTopBar({ ...topBar, bgColor: e.target.value })}
                              className="h-12 w-16 p-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={topBar.bgColor}
                              onChange={(e) => setTopBar({ ...topBar, bgColor: e.target.value })}
                              className="flex-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Text Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={topBar.textColor}
                              onChange={(e) => setTopBar({ ...topBar, textColor: e.target.value })}
                              className="h-12 w-16 p-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={topBar.textColor}
                              onChange={(e) => setTopBar({ ...topBar, textColor: e.target.value })}
                              className="flex-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Footer Settings */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Layout size={20} className="text-primary-500" /> Footer Details</h3>
                <div className="space-y-4 bg-slate-50 dark:bg-dark-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">About Text</label>
                    <textarea
                      value={footer?.aboutText || ''}
                      onChange={(e) => setFooter({ ...footer, aboutText: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none h-24"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={footer?.phone || ''}
                        onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                        className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={footer?.email || ''}
                        onChange={(e) => setFooter({ ...footer, email: e.target.value })}
                        className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Facebook URL</label>
                      <input
                        type="text"
                        value={footer?.facebookUrl || ''}
                        onChange={(e) => setFooter({ ...footer, facebookUrl: e.target.value })}
                        className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Instagram URL</label>
                      <input
                        type="text"
                        value={footer?.instagramUrl || ''}
                        onChange={(e) => setFooter({ ...footer, instagramUrl: e.target.value })}
                        className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

        {activeTab === 'couriers' && (
          <CourierManagement />
        )}

        {activeTab === 'accounting' && (
          <AccountingManager />
        )}

        {activeTab === 'homepage' && (
          <HomepageEditor />
        )}

        {activeTab === 'marketing' && (
          <LandingPageManager />
        )}

        {activeTab === 'meta-ads' && (
          <MetaAdsDashboard />
        )}

        {activeTab === 'promotions' && (
          <PromoManager />
        )}

        {activeTab === 'users' && (
          <UserManager />
        )}

        {activeTab === 'customers' && (
          <CustomerManagement />
        )}

        {activeTab === 'support' && (
          <SupportManagement />
        )}

        {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'variants' && activeTab !== 'orders' && activeTab !== 'settings' && activeTab !== 'couriers' && activeTab !== 'homepage' && activeTab !== 'marketing' && activeTab !== 'meta-ads' && activeTab !== 'accounting' && activeTab !== 'promotions' && activeTab !== 'users' && activeTab !== 'customers' && activeTab !== 'support' && (
          <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-center">
            <h2 className="text-xl font-medium mb-2">{activeTab} Module</h2>
            <p className="text-slate-500 dark:text-slate-400">This module is under construction and will be scalable for future feature additions.</p>
          </div>
        )}

      </main>
    </div>
  );
}

