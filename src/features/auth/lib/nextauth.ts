import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createAuthAdapter } from "./adapter";
import { createAuthService } from "./auth-service";
import { decideGoogleSignIn } from "./google-sign-in";

const service = createAuthService();

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

/**
 * Auth.js instance: Credentials (+ Google when configured), JWT sessions
 * (ADR 0002). `allowDangerousEmailAccountLinking` stays off (ADR 0004).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createAuthAdapter(),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const result = await service.verifyCredentials(credentials);
        return result.ok
          ? { id: result.data.id, email: result.data.email }
          : null;
      },
    }),
    ...(googleConfigured ? [Google] : []),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google" || !user.email) return true;
      return decideGoogleSignIn(user.email);
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
