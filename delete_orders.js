const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function deleteAllOrders() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;

  if (!supabaseUrl || !supabaseAnonKey || !jwtSecret) {
    console.error("Missing env variables");
    return;
  }

  const serviceToken = jwt.sign({ role: 'service_role' }, jwtSecret);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${serviceToken}` } }
  });

  console.log("Deleting all orders...");
  
  // To delete all rows, Supabase requires you to use a filter that matches everything.
  // Using .neq('id', 'non-existent-id') matches everything.
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .neq('id', 'non-existent-id');

  if (error) {
    console.error("Error deleting orders:", error);
  } else {
    console.log("Successfully deleted all orders!");
  }
}

deleteAllOrders();
