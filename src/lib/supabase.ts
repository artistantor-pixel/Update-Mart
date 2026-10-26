import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let currentToken: string | null = null;

export const setSupabaseToken = (token: string | null) => {
  currentToken = token;
};

export const getSupabaseToken = () => currentToken;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      const headers = new Headers(options.headers || {});

      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
      }

      // Ensure no browser, Next.js, or CDN caching for critical admin data
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');

      return fetch(url, {
        ...options,
        headers,
        cache: 'no-store',
      });
    },
  },
});
