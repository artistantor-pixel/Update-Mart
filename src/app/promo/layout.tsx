import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';

export default function PromoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Update Mart" width={240} height={69} className="w-auto h-10 lg:h-12 transition-all dark:hidden" priority />
            <Image src="/logo-dark.svg" alt="Update Mart" width={240} height={69} className="w-auto h-10 lg:h-12 transition-all hidden dark:block" priority />
          </Link>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Minimal Footer */}
      <footer className="bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Update Mart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
