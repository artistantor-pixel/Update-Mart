import { supabase } from '@/lib/supabase';
import { Product, INITIAL_PRODUCTS } from '@/store/productStore';
import { HomepageContent, DEFAULT_CONTENT } from '@/store/homepageStore';

const safeParse = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

/**
 * Fetch top trending/featured products optimized for initial server-side render.
 * Selects only required card fields, filters by live status, and orders by newest.
 */
export async function getTrendingProducts(limit: number = 4): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, rating, category, brand, is_new, is_live, stock, colors, variants')
      .or('is_live.eq.true,is_live.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending products on server:', error.message);
      return INITIAL_PRODUCTS.slice(0, limit);
    }

    if (!data || data.length === 0) {
      return INITIAL_PRODUCTS.slice(0, limit);
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
      image: p.image || '/placeholder.png',
      rating: Number(p.rating) || 5,
      category: p.category || 'General',
      brand: p.brand || '',
      isNew: Boolean(p.is_new),
      isLive: p.is_live !== false,
      stock: p.stock,
      colors: safeParse(p.colors),
      variants: safeParse(p.variants),
    })) as Product[];
  } catch (err) {
    console.error('Failed to get trending products:', err);
    return INITIAL_PRODUCTS.slice(0, limit);
  }
}

/**
 * Fetch homepage settings and section content on server.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('id', 'homepage_settings')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching homepage content on server:', error.message);
    }

    if (data && data.value) {
      return data.value as HomepageContent;
    }
  } catch (err) {
    console.error('Failed to get homepage content:', err);
  }
  return DEFAULT_CONTENT;
}
