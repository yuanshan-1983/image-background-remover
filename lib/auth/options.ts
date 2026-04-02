import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function hasGoogleAuthEnv() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET);
}

export function buildAuthOptions(): NextAuthOptions {
  const providers = [] as NextAuthOptions["providers"];

  if (hasGoogleAuthEnv()) {
    providers.push(
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string
      })
    );
  }

  return {
    secret: process.env.AUTH_SECRET,
    providers,
    session: {
      strategy: "jwt"
    },
    pages: {
      signIn: "/login"
    },
    callbacks: {
      async signIn() {
        return true;
      },
      async jwt({ token, profile }) {
        if (profile?.sub) {
          token.sub = profile.sub;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      }
    }
  };
}
