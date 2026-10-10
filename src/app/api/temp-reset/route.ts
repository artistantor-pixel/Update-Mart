import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    let adminSupabase = supabase;
    if (process.env.SUPABASE_JWT_SECRET) {
      const serviceToken = jwt.sign(
        { role: 'service_role' },
        process.env.SUPABASE_JWT_SECRET
      );
      adminSupabase = require('@supabase/supabase-js').createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        { global: { headers: { Authorization: `Bearer ${serviceToken}` } } }
      );
    }
    const { data, error } = await adminSupabase
      .from('admin_users')
      .update({ password: 'Password123' })
      .eq('email', 'artistantor@gmail.com')
      .select();

    return NextResponse.json({ success: true, data, error });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
