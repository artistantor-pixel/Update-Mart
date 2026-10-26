export default function TrendingProductsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section id="trending" className="py-20 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-dark-700 rounded-xl animate-pulse mb-3" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-dark-800 rounded-lg animate-pulse" />
          </div>
          <div className="hidden sm:block h-5 w-32 bg-slate-100 dark:bg-dark-800 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm"
            >
              {/* Image Skeleton */}
              <div className="relative aspect-square bg-slate-100 dark:bg-dark-700/60 animate-pulse" />

              {/* Content Skeleton */}
              <div className="flex flex-col flex-grow p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="h-5 bg-slate-200 dark:bg-dark-700 rounded-md w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 dark:bg-dark-700 rounded-md w-8 animate-pulse" />
                </div>
                <div className="h-4 bg-slate-100 dark:bg-dark-700/50 rounded-md w-1/3 animate-pulse" />
                <div className="pt-3 flex justify-between items-center mt-auto">
                  <div className="h-6 bg-slate-200 dark:bg-dark-700 rounded-md w-24 animate-pulse" />
                  <div className="h-8 w-8 bg-slate-100 dark:bg-dark-700 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
