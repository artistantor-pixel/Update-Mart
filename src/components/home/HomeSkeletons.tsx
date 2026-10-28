import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800 rounded-3xl overflow-hidden border border-slate-200/70 dark:border-white/5 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-slate-200 dark:bg-dark-700" />

      {/* Details Skeleton */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-2.5 w-16 bg-slate-200 dark:bg-dark-700 rounded-full" />
            <div className="h-2.5 w-8 bg-slate-200 dark:bg-dark-700 rounded-full" />
          </div>
          <div className="h-4 w-4/5 bg-slate-200 dark:bg-dark-700 rounded-lg" />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="h-5 w-20 bg-slate-200 dark:bg-dark-700 rounded-lg" />
          <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-dark-700" />
        </div>
      </div>
    </div>
  );
}

export function CuratedRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-200 dark:bg-dark-700 rounded-full animate-pulse" />
            <div className="h-7 w-48 bg-slate-200 dark:bg-dark-700 rounded-xl animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-slate-200 dark:bg-dark-700 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function JustForYouSkeleton({ count = 10 }: { count?: number }) {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-dark-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-sm mx-auto mb-12 space-y-2">
          <div className="h-3 w-24 mx-auto bg-slate-200 dark:bg-dark-700 rounded-full animate-pulse" />
          <div className="h-8 w-44 mx-auto bg-slate-200 dark:bg-dark-700 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

