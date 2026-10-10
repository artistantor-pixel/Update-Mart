const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });
const serviceToken = jwt.sign(
  { role: 'service_role' },
  process.env.SUPABASE_JWT_SECRET
);
console.log(serviceToken);
