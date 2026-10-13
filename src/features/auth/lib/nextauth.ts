import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getEnv } from "@/shared/config";
import { createAuthAdapter } from "./adapter";
import { createAuthService } from "./auth-service";
import { decideGoogleSignIn } from "./google-sign-in";
import { createPasswordSignIn } from "./password-sign-in";

const passwordSignIn = createPasswordSignIn(
  createAuthService(),
  (credentials) => signIn("credentials", { ...credentials, redirect: false })
);

const { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } = getEnv();
/** Google sign-in exists only when both keys are set; the login page hides
 *  its button otherwise. */
export const googleConfigured = Boolean(AUTH_GOOGLE_ID && AUTH_GOOGLE_SECRET);

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
      authorize: (credentials) => passwordSignIn.authorize(credentials),
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

/** Starts a JWT session with an email and password; a refusal says why. */
export const signInWithPassword = passwordSignIn.signIn;
