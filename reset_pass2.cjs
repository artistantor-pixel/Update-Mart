const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function resetPass() {
  const serviceToken = jwt.sign(
    { role: 'service_role' },
    process.env.SUPABASE_JWT_SECRET
  );
  try {
    const response = await fetch("https://apstiiunljirfsjyowyl.supabase.co/rest/v1/admin_users?email=eq.artistantor@gmail.com", {
      method: 'PATCH',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${serviceToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ password: 'Password@123' })
    });
    const data = await response.json();
    console.log("Success data:", JSON.stringify(data));
  } catch(e) {
    console.log("Error:", e.message);
  } finally {
    process.exit(0);
  }
}
resetPass();
