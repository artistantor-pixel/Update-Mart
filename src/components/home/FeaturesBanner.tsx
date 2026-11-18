"use client";

import {
  Truck,
  ShieldCheck,
  Banknote,
  Clock,
  Shield,
  Battery,
  Zap,
  Star,
  RotateCcw,
  Award,
  LucideIcon,
} from 'lucide-react';
import { useHomepageStore, FeatureItem } from '@/store/homepageStore';

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  ShieldCheck,
  Banknote,
  Clock,
  Shield,
  Battery,
  Zap,
  Star,
  RotateCcw,
  Award,
};

interface FeaturesBannerProps {
  features?: FeatureItem[];
}

export default function FeaturesBanner({ features: initialFeatures }: FeaturesBannerProps) {
  const { content } = useHomepageStore();
  const features = initialFeatures && initialFeatures.length > 0 ? initialFeatures : content.features;

  if (!features || features.length === 0) return null;

  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 pb-6 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/80 dark:border-white/10 px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:divide-x divide-slate-100 dark:divide-white/10">
            {features.slice(0, 4).map((feature, idx) => {
              const Icon = ICON_MAP[feature.icon] || Truck;
              return (
                <div
                  key={feature.id || idx}
                  className={`flex items-center gap-3 sm:gap-3.5 ${
                    idx > 0 ? 'lg:pl-6' : ''
                  }`}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-500/10 dark:bg-primary-400/15 text-primary-500 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug truncate">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
