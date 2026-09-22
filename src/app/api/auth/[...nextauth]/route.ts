import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if the user exists in our admin_users table
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (error || !adminUser) {
            console.log(`Access denied for ${credentials.email} - not found.`);
            return null; // Reject the sign in
          }
          
          // Verify password
          let isValid = false;

          if (adminUser.password && (adminUser.password.startsWith('$2a$') || adminUser.password.startsWith('$2b$'))) {
            // It's a hashed password
            const bcrypt = require('bcryptjs');
            isValid = await bcrypt.compare(credentials.password, adminUser.password);
          } else {
            // It's a plain text password. Check it, and if valid, auto-migrate to hash!
            if (adminUser.password === credentials.password) {
              isValid = true;
              const bcrypt = require('bcryptjs');
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(credentials.password, salt);
              
              // Update database with new hashed password
              await supabase
                .from('admin_users')
                .update({ password: hashedPassword })
                .eq('id', adminUser.id);
              
              console.log(`Auto-migrated password to bcrypt hash for ${credentials.email}`);
            }
          }

          if (!isValid) {
             console.log(`Access denied for ${credentials.email} - wrong password.`);
             return null;
          }

          return {
            id: adminUser.id || adminUser.email,
            name: adminUser.name,
            email: adminUser.email,
            image: adminUser.avatar
          };
        } catch (error) {
          console.error("Error checking admin user:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // We verified them in authorize, fetch role if needed
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('email', user.email)
          .single();
          
        token.role = adminUser?.role || 'admin';
        
        // Generate Supabase JWT
        if (process.env.SUPABASE_JWT_SECRET) {
          const payload = {
            aud: 'authenticated',
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
            sub: user.id,
            email: user.email,
            role: 'authenticated',
          };
          token.supabaseToken = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session as any).supabaseToken = token.supabaseToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin', // Since our login is integrated in the admin page
    error: '/admin', // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
