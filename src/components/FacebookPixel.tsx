'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Initial PageView is handled in <head> by layout.tsx
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Track PageView on client-side route navigation
    if (typeof window !== 'undefined' && (window as any).fbq) {
      if (!pathname?.startsWith('/admin')) {
        (window as any).fbq('track', 'PageView');
      }
    }
  }, [pathname, searchParams]);

  return null;
}


