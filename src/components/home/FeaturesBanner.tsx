"use client";

import { Truck, ShieldCheck, Banknote, Clock, Shield, Battery, Zap, Star, LucideIcon } from 'lucide-react';
import { useHomepageStore } from '@/store/homepageStore';

const ICON_MAP: Record<string, LucideIcon> = {
  Truck, ShieldCheck, Banknote, Clock, Shield, Battery, Zap, Star,
};

export default function FeaturesBanner() {
  const { content } = useHomepageStore();

  return (
    <section className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x-0 lg:divide-x divide-y lg:divide-y-0 divide-slate-100 dark:divide-white/5">
          {content.features.map((feature, idx) => {
            const Icon = ICON_MAP[feature.icon] || Truck;
            return (
              <div key={feature.id} className={`flex items-center gap-4 ${idx !== 0 && idx !== 2 ? 'pl-0 lg:pl-8 pt-8 lg:pt-0' : idx === 2 ? 'pt-8 lg:pt-0 lg:pl-8' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
