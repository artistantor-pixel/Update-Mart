import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if the user exists in our admin_users table
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (error || !adminUser) {
            console.log(`Access denied for ${user.email} - not in admin_users table.`);
            return false; // Reject the sign in
          }
          
          // Optional: Update name/avatar if they changed
          await supabase.from('admin_users').update({
            name: user.name,
            avatar: user.image
          }).eq('email', user.email);

          return true; // Allow sign in
        } catch (error) {
          console.error("Error checking admin user:", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        // We verified them in signIn, fetch role if needed
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
