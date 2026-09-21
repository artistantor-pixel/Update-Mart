'use client';

import { usePathname } from 'next/navigation';

export default function GtmNoscript() {
  const pathname = usePathname();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const serverUrl = process.env.NEXT_PUBLIC_GTM_SERVER_URL || 'https://www.googletagmanager.com';

  if (!gtmId || pathname.startsWith('/admin')) return null;

  return (
    <noscript>
      <iframe
        src={`${serverUrl}/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      ></iframe>
    </noscript>
  );
}
