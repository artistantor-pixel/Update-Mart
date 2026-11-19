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
    fetch: async (url, options = {}) => {
      const headers = new Headers(options.headers || {});

      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
        // Ensure no browser, Next.js, or CDN caching for critical admin data
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');

        const response = await fetch(url, {
          ...options,
          headers,
          cache: 'no-store',
        });

        // If a custom token was rejected with 401, retry once without stale token
        // so public/readable tables still load without hard-failing
        if (response.status === 401) {
          console.warn('[Supabase] Bearer token rejected (401). Retrying with default anon access.');
          const fallbackHeaders = new Headers(options.headers || {});
          return fetch(url, {
            ...options,
            headers: fallbackHeaders,
          });
        }

        return response;
      }

      // For public storefront queries and build-time static generation
      return fetch(url, {
        ...options,
        headers,
      });
    },
  },
});
