import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export let supabase = createClient(supabaseUrl, supabaseAnonKey);

export const setSupabaseToken = (token: string | null) => {
  if (token) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
};
