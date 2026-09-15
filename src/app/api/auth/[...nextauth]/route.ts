import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

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
          
          // Verify password (plain text check based on standard manual setups)
          // If you hash passwords in your DB in the future, you will need to update this check.
          if (adminUser.password !== credentials.password) {
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
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
