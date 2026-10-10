const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function updatePassword() {
  const serviceToken = jwt.sign(
    { role: 'service_role' },
    process.env.SUPABASE_JWT_SECRET
  );
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${serviceToken}` } } }
  );

  const { data, error } = await adminSupabase
    .from('admin_users')
    .update({ password: 'Password@123' })
    .eq('email', 'artistantor@gmail.com');

  console.log("Updated password for artistantor@gmail.com", data, error);
}

updatePassword();
