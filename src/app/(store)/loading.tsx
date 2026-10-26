import TrendingProductsSkeleton from '@/components/home/TrendingProductsSkeleton';

export default function StoreLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Placeholder */}
      <section className="relative w-full min-h-[70vh] bg-[#0a0a0f] -mt-24 flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto px-8 py-12 rounded-3xl bg-white/5 border border-white/5 animate-pulse text-center space-y-6">
          <div className="h-6 w-32 bg-white/10 rounded-full mx-auto" />
          <div className="h-12 sm:h-16 w-3/4 bg-white/10 rounded-2xl mx-auto" />
          <div className="h-4 w-1/2 bg-white/10 rounded-lg mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="h-12 w-40 bg-white/10 rounded-2xl" />
            <div className="h-12 w-40 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Features Bar Placeholder */}
      <div className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900 py-8">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-dark-800" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 dark:bg-dark-700 rounded" />
                <div className="h-3 w-32 bg-slate-100 dark:bg-dark-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products Grid Skeleton */}
      <TrendingProductsSkeleton count={4} />
    </div>
  );
}
