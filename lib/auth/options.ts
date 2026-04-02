import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { D1Adapter } from "@auth/d1-adapter";
import { getD1Binding } from "@/lib/cloudflare-env";

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

  const db = getD1Binding();

  return {
    secret: process.env.AUTH_SECRET,
    adapter: db ? D1Adapter(db) : undefined,
    providers,
    session: {
      strategy: db ? "database" : "jwt"
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
      async session({ session, token, user }) {
        if (session.user) {
          session.user.id = user?.id || (token.sub as string);
        }
        return session;
      }
    }
  };
}
