"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, CreditCard } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useEffect, useState } from 'react';

export default function Footer() {
  const footer = useSettingsStore((state) => state.footer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-[#2d368f] border-t border-white/10 pt-12 pb-6 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.svg" alt="Update Mart" width={180} height={52} className="w-auto h-10 brightness-0 invert" />
            </Link>
            <p className="text-white/70 text-sm mb-6 max-w-sm leading-relaxed">
              {footer.aboutText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-white/80 mb-6">
              {footer.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-white" />
                  <span>{footer.phone}</span>
                </div>
              )}
              {footer.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-white" />
                  <span>{footer.email}</span>
                </div>
              )}
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {footer.facebookUrl && (
                <a href={footer.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#2d368f] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {footer.twitterUrl && (
                <a href={footer.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#2d368f] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              )}
              {footer.instagramUrl && (
                <a href={footer.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#2d368f] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 tracking-wider text-sm">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm text-white/70 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/#trending" className="text-sm text-white/70 hover:text-white transition-colors">Trending</Link></li>
              <li><Link href="/#categories" className="text-sm text-white/70 hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4 tracking-wider text-sm">Support</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">Returns Policy</Link></li>
              <li><Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} Update Mart. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#" className="text-xs text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-white/60 hover:text-white transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-1.5 text-white/80">
            <CreditCard size={18} className="opacity-75" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">Secure Checkout</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
