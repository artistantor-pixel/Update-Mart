"use client";

import Link from 'next/link';
import { useSettingsStore } from '@/store/settingsStore';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const topBar = useSettingsStore((state) => state.topBar);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !topBar?.enabled) {
    return null;
  }

  return (
    <div 
      className="w-full text-center py-2 text-sm font-medium px-4" 
      style={{ backgroundColor: topBar.bgColor, color: topBar.textColor }}
    >
      <span className="opacity-90">{topBar.message}</span>
      {topBar.linkText && topBar.linkUrl && (
        <Link 
          href={topBar.linkUrl} 
          className="ml-3 underline underline-offset-2 opacity-100 font-bold hover:opacity-80 transition-opacity"
          style={{ color: topBar.textColor }}
        >
          {topBar.linkText}
        </Link>
      )}
    </div>
  );
}
