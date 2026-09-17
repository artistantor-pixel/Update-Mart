"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, CreditCard } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useEffect, useState } from 'react';

export default function Footer() {
  const footer = useSettingsStore((state) => state.footer);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-gradient-to-b from-[#2d368f] to-[#1e2460] border-t border-white/10 pt-16 pb-8 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
              <Image src="/logo-dark.svg" alt="Update Mart" width={180} height={52} className="w-auto h-12 mx-auto md:mx-0" />
            </Link>
            <p className="text-white/70 text-sm mb-8 max-w-sm leading-relaxed px-4 md:px-0">
              {footer.aboutText}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-white/90 mb-8 w-full justify-center md:justify-start">
              {footer.phone && (
                <a href={`tel:${footer.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all shadow-sm">
                  <Phone size={16} className="text-white" />
                  <span className="font-medium">{footer.phone}</span>
                </a>
              )}
              {footer.email && (
                <a href={`mailto:${footer.email}`} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all shadow-sm">
                  <Mail size={16} className="text-white" />
                  <span className="font-medium">{footer.email}</span>
                </a>
              )}
            </div>
            
            {/* Socials */}
            <div className="flex items-center gap-4 justify-center md:justify-start">
              {footer.facebookUrl && (
                <a href={footer.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#2d368f] hover:scale-110 transition-all shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {footer.twitterUrl && (
                <a href={footer.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#2d368f] hover:scale-110 transition-all shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              )}
              {footer.instagramUrl && (
                <a href={footer.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#2d368f] hover:scale-110 transition-all shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
            </div>
          </div>

          {/* Links & Support Container - Side by side on mobile */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-8 pt-8 md:pt-0 border-t border-white/10 md:border-t-0">
            {/* Links */}
            <div className="text-center md:text-left">
              <h3 className="font-bold text-white mb-5 tracking-wider text-sm uppercase opacity-90">Shop</h3>
              <ul className="space-y-4">
                <li><Link href="/products" className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">All Products</Link></li>
                <li><Link href="/#trending" className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Trending</Link></li>
                <li><Link href="/#categories" className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Categories</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="text-center md:text-left">
              <h3 className="font-bold text-white mb-5 tracking-wider text-sm uppercase opacity-90">Support</h3>
              <ul className="space-y-4">
                <li><Link href="/track-order" className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Track Order</Link></li>
                <li><Link href="#" className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Returns Policy</Link></li>
                <li><Link href="#" className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-1 transition-all">Contact Us</Link></li>
              </ul>
            </div>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-xs text-white/50 font-medium">
            &copy; {new Date().getFullYear()} Update Mart. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="text-xs font-medium text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs font-medium text-white/60 hover:text-white transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
            <CreditCard size={18} className="text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Secure Checkout</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
