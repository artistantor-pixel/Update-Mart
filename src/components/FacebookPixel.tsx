'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import * as fpixel from '@/lib/fpixel';

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) {
      return;
    }

    const search = searchParams?.toString();
    const currentUrl = search ? `${pathname}?${search}` : pathname;

    // Prevent duplicate firing on same URL
    if (lastTrackedUrl.current === currentUrl) {
      return;
    }
    lastTrackedUrl.current = currentUrl;

    // Track PageView on both Pixel & Conversions API with matching eventID
    const fullHref = typeof window !== 'undefined' ? window.location.href : currentUrl;
    fpixel.pageview(fullHref);
  }, [pathname, searchParams]);

  return null;
}


