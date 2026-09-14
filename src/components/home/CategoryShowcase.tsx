import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    title: 'Smart Watches',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colSpan: 'lg:col-span-2',
    link: '/products?category=Smart Watches'
  },
  {
    title: 'Audio',
    image: 'https://images.unsplash.com/photo-1612548403247-aa2873e9422d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colSpan: 'lg:col-span-1',
    link: '/products?category=Audio'
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colSpan: 'lg:col-span-1',
    link: '/products?category=Accessories'
  },
  {
    title: 'Bags & Travel',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colSpan: 'lg:col-span-2',
    link: '/products?category=Bags'
  }
];

export default function CategoryShowcase() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-dark-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Shop by Category</h2>
          <p className="text-slate-600 dark:text-slate-400">Curated collections designed to elevate your everyday lifestyle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link key={idx} href={cat.link}
              className={`group relative overflow-hidden rounded-3xl h-64 md:h-80 ${cat.colSpan}`}
            >
              <Image 
                src={cat.image} 
                alt={cat.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              fill={true} style={{objectFit: "cover"}} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">{cat.title}</h3>
                <div className="flex items-center gap-2 text-white/80 group-hover:text-primary-400 transition-colors">
                  <span className="font-medium text-sm">Explore Collection</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
