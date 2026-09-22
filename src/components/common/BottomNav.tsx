"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Search, ShoppingCart, Headset } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore(state => state.items);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Prevent hydration mismatch by setting count after mount
    setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
  }, [cartItems]);

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Shop', icon: ShoppingBag, href: '/products' },
    { label: 'Cart', icon: ShoppingCart, href: '/cart', badge: cartCount },
    { label: 'Support', icon: Headset, href: '/support' },
  ];


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-2 pointer-events-none">
      <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl p-2 flex justify-between items-center pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive ? 'text-primary-500' : 'text-slate-500 dark:text-slate-400 hover:text-primary-400'}`}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <span className="absolute inset-0 bg-primary-50 dark:bg-primary-500/10 rounded-2xl -z-10 animate-fade-in" />
              )}
              
              <div className="relative">
                <Icon size={isActive ? 24 : 22} className={`transition-all duration-300 ${isActive ? 'mb-1' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-dark-800 shadow-sm animate-bounce-short">
                    {item.badge}
                  </span>
                )}
              </div>
              
              {/* Label only shows when active for a cleaner look */}
              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
