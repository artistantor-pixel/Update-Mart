"use client";

import { useEffect } from 'react';
import { Star } from 'lucide-react';
import { useReviewStore } from '@/store/reviewStore';
import { useHomepageStore } from '@/store/homepageStore';

const AVATAR_COLORS = [
  'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
  'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
  'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
];

export default function Testimonials() {
  const { content } = useHomepageStore();
  const { allReviews, isLoading, fetchAllReviews } = useReviewStore();

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  // Use real reviews if available, else fall back to admin-managed store testimonials
  const hasRealReviews = allReviews.length > 0;

  return (
    <section className="py-20 bg-white dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Don&apos;t just take our word for it
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Join thousands of satisfied customers who have upgraded their lifestyle with Update Mart.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Real customer reviews from Supabase */}
        {!isLoading && hasRealReviews && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allReviews.slice(0, 6).map((review, idx) => {
              const initials = review.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={review.id}
                  className="bg-slate-50 dark:bg-dark-800 p-8 rounded-3xl border border-slate-200 dark:border-white/5 relative mt-8 flex flex-col"
                >
                  {/* Avatar */}
                  <div
                    className={`absolute -top-8 left-8 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white dark:border-dark-900 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                  >
                    {initials}
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mt-4 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? 'text-accent-500 fill-accent-500'
                            : 'text-slate-300 dark:text-slate-600'
                        }
                      />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-slate-700 dark:text-slate-300 mb-6 italic text-base leading-relaxed flex-1">
                    &quot;{review.content}&quot;
                  </p>

                  {/* Name + product */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{review.name}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Verified Buyer
                      {review.product_name && (
                        <span className="text-primary-500"> · {review.product_name}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback: admin-managed testimonials */}
        {!isLoading && !hasRealReviews && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials.map((testimonial, idx) => (
              <div
                key={testimonial.id}
                className="bg-slate-50 dark:bg-dark-800 p-8 rounded-3xl border border-slate-200 dark:border-white/5 relative mt-8"
              >
                <div
                  className={`absolute -top-8 left-8 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white dark:border-dark-900 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                >
                  {testimonial.avatar}
                </div>

                <div className="flex gap-1 mt-4 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < testimonial.rating
                          ? 'text-accent-500 fill-accent-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }
                    />
                  ))}
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-6 italic text-lg leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
