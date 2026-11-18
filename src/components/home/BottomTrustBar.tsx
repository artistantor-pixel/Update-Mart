import Link from 'next/link';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Track Your Order',
    description: 'Real-time delivery updates',
    href: '/track-order',
  },
  {
    icon: ShieldCheck,
    title: 'Best Price Guarantee',
    description: '100% genuine & fair pricing',
    href: '/products',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Cash on Delivery & secure pay',
    href: '/products',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    description: "We're here anytime you need",
    href: '/support',
  },
];

export default function BottomTrustBar() {
  return (
    <section className="py-8 sm:py-10 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/90 dark:bg-dark-800 rounded-2xl border border-slate-200/80 dark:border-white/10 px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:divide-x divide-slate-200/80 dark:divide-white/10">
            {TRUST_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex items-center gap-3.5 ${
                    idx > 0 ? 'lg:pl-6' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10 text-primary-500 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary-500/40 group-hover:scale-105 transition-all">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-indigo-300 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

