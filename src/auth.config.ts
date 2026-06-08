import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [Google],
  trustHost: true,
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) (token as any).id = (user as any).id;
      return token;
    },
    session({ session, token }) {
      if ((token as any).id && session.user) {
        (session.user as any).id = (token as any).id;
      }
      return session;
    },
  },
};
