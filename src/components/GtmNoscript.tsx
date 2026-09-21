'use client';

export default function GtmNoscript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const serverUrl = process.env.NEXT_PUBLIC_GTM_SERVER_URL || 'https://www.googletagmanager.com';

  if (!gtmId) return null;

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
