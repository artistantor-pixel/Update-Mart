const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function getAdmins() {
  const { data, error } = await supabase.from('admin_users').select('email, role');
  console.log("Admins:", data);
}
getAdmins();
