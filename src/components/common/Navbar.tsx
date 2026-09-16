"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Moon, Sun, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItems = useCartStore(state => state.items);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Prevent hydration mismatch by setting count after mount
    setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
  }, [cartItems]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    setIsDark(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass ${isScrolled ? 'py-3 shadow-md' : 'py-5 shadow-sm'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/mobile-logo.svg" alt="UM" width={32} height={32} className="w-8 h-8 dark:brightness-0 dark:invert transition-all" priority />
            </Link>
          </div>

          {/* Logo (Desktop) */}
          <div className="hidden lg:block">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Update Mart" width={240} height={69} className="w-auto h-12 lg:h-14 dark:brightness-0 dark:invert transition-all" priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors">Home</Link>
            <Link href="/products" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors">Shop</Link>
            
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative w-64 xl:w-80">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-100/80 dark:bg-dark-800/80 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>
          </div>

          {/* Mobile Search Bar (Inline) */}
          <div className="flex-1 mx-3 lg:hidden">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-100 dark:bg-dark-800 border-none rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            <button 
              onClick={toggleDarkMode}
              className="text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/cart" className="flex relative text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors group">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          
          
        </div>
      </div>
    </nav>
  );
}
