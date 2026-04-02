import NextAuth from "next-auth";
import { buildAuthOptions } from "@/lib/auth/options";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

const handler = async (request: Request) => {
  const ctx = getCloudflareContext();
  globalThis.__OPENCLAW_CF_CTX__ = ctx;
  const nextAuthHandler = NextAuth(buildAuthOptions());
  return nextAuthHandler(request);
};

export { handler as GET, handler as POST };
