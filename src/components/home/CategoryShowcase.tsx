import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Watch,
  Laptop,
  ShoppingBag,
  Home,
  Shirt,
  Smartphone,
  Headphones,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';

export interface HomeCategoryItem {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

interface CategoryShowcaseProps {
  categories?: HomeCategoryItem[];
  title?: string;
}

const FALLBACK_CATEGORIES: HomeCategoryItem[] = [
  {
    id: 'cat-watches',
    name: 'Watches',
    slug: 'watches',
    image_url:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    image_url:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    image_url:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-bags',
    name: 'Bags',
    slug: 'bags',
    image_url:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-smart-home',
    name: 'Smart Home',
    slug: 'smart-home',
    image_url:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-deals',
    name: 'Deals',
    slug: 'deals',
    image_url: null,
  },
];

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  watches:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80',
  electronics:
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80',
  accessories:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
  bags:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
  'smart-home':
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
  'art-materials':
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
};

// Soft rotating pastel backgrounds for circular category thumbnails
const CIRCLE_TINTS = [
  'bg-[#eef0fb] dark:bg-primary-500/20',
  'bg-[#fef5e4] dark:bg-amber-500/15',
  'bg-[#edf5f2] dark:bg-emerald-500/15',
  'bg-[#f3f0fa] dark:bg-indigo-500/20',
  'bg-[#f1f4f9] dark:bg-slate-700/60',
  'bg-[#fef2eb] dark:bg-orange-500/15',
];

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('watch')) return <Watch size={34} strokeWidth={1.6} />;
  if (lower.includes('audio') || lower.includes('headphone') || lower.includes('earbud'))
    return <Headphones size={34} strokeWidth={1.6} />;
  if (lower.includes('electronic') || lower.includes('gadget') || lower.includes('tech'))
    return <Laptop size={34} strokeWidth={1.6} />;
  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('access'))
    return <Smartphone size={34} strokeWidth={1.6} />;
  if (lower.includes('bag') || lower.includes('travel'))
    return <ShoppingBag size={34} strokeWidth={1.6} />;
  if (lower.includes('home') || lower.includes('living'))
    return <Home size={34} strokeWidth={1.6} />;
  if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('men') || lower.includes('women'))
    return <Shirt size={34} strokeWidth={1.6} />;
  if (lower.includes('food') || lower.includes('boyam') || lower.includes('gourmet'))
    return <Sparkles size={34} strokeWidth={1.6} />;
  if (lower.includes('deal') || lower.includes('sale') || lower.includes('offer'))
    return <Tag size={34} strokeWidth={1.6} />;
  return <Layers size={34} strokeWidth={1.6} />;
}

export default function CategoryShowcase({
  categories,
  title = 'Shop By Category',
}: CategoryShowcaseProps) {
  // Filter out any synthetic 'all' category and fall back cleanly if empty
  const filtered = (categories || []).filter(
    (c) => c.slug?.toLowerCase() !== 'all' && c.name?.toLowerCase() !== 'all products'
  );
  const displayCategories = filtered.length > 0 ? filtered : FALLBACK_CATEGORIES;

  return (
    <section
      id="categories"
      className="py-10 sm:py-14 bg-white dark:bg-dark-900 transition-colors"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header with Dotted Accents */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="hidden sm:flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary-400/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400/60" />
            <span className="w-8 h-[2px] rounded-full bg-gradient-to-r from-primary-400/60 to-primary-500" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
            {title}
          </h2>
          <div className="hidden sm:flex items-center gap-1">
            <span className="w-8 h-[2px] rounded-full bg-gradient-to-l from-primary-400/60 to-primary-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400/60" />
            <span className="w-1 h-1 rounded-full bg-primary-400/40" />
          </div>
        </div>

        {/* Circular Category Row: Horizontal scroll on mobile, centered grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 overflow-x-auto sm:overflow-visible no-scrollbar pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 justify-start lg:justify-center">
          {displayCategories.slice(0, 12).map((cat, idx) => {
            const href =
              cat.slug === 'deals'
                ? '/products?filter=sale'
                : `/category/${cat.slug}`;
            const circleBg = CIRCLE_TINTS[idx % CIRCLE_TINTS.length];

            return (
              <Link
                key={cat.id || `${cat.slug}-${idx}`}
                href={href}
                className="group flex flex-col items-center text-center shrink-0 w-[108px] sm:w-auto focus:outline-none"
              >
                {/* Circular Thumbnail */}
                <div
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden ${circleBg} border-2 border-transparent group-hover:border-primary-500/40 shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center`}
                >
                  {cat.image_url || DEFAULT_CATEGORY_IMAGES[cat.slug?.toLowerCase()] ? (
                    <Image
                      src={cat.image_url || DEFAULT_CATEGORY_IMAGES[cat.slug?.toLowerCase()]}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="text-primary-500 dark:text-indigo-300 group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(cat.name)}
                    </div>
                  )}
                </div>

                {/* Category Label */}
                <h3 className="mt-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {cat.name}
                </h3>

                {/* Subtle Shop Now Link */}
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary-500 dark:group-hover:text-indigo-300 transition-colors">
                  <span>Shop Now</span>
                  <ArrowRight
                    size={11}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
