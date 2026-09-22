import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let currentToken: string | null = null;

export const setSupabaseToken = (token: string | null) => {
  currentToken = token;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      if (currentToken) {
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${currentToken}`);
        } else if (Array.isArray(options.headers)) {
          options.headers.push(['Authorization', `Bearer ${currentToken}`]);
        } else {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${currentToken}`,
          };
        }
      }
      return fetch(url, options);
    },
  },
});
