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
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${currentToken}`,
        };
      }
      return fetch(url, options);
    },
  },
});
