import type { Metadata } from 'next';
import { getBoyamProducts } from '@/lib/products';
import BoyamPageClient from './BoyamPageClient';

export const metadata: Metadata = {
  title: 'বোয়াম (Boyam) — ঐতিহ্যবাহী ঘরে তৈরি খাঁটি খাবার | Update Mart',
  description:
    'সুন্দরবনের খাঁটি মধু, কাঠের ঘানির সরিষার তেলে তৈরি আচার, বিলোনা গাওয়া ঘি, হাতে তৈরি নিমকি — প্রিজারভেটিভ মুক্ত ১০০% ঘরে তৈরি বোয়াম পণ্যসমূহ। Boyam — Authentic homemade Bengali artisanal food.',
  openGraph: {
    title: 'বোয়াম (Boyam) — ঐতিহ্যবাহী স্বাদ',
    description:
      'মায়ের হাতের রেসিপি, প্রকৃতির শুদ্ধতা — এক বোয়ামে সব কিছু। ১০০% ঘরে তৈরি, প্রিজারভেটিভ মুক্ত।',
    type: 'website',
  },
};

/**
 * Boyam Sales Landing Page — Server Component shell.
 * Fetches Boyam-brand products server-side and passes them to the client
 * interactive component for sticky filtering & add-to-cart actions.
 */
export default async function BoyamPage() {
  const products = await getBoyamProducts();

  return <BoyamPageClient products={products} />;
}

