import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionCookieName, verifyAppSession } from "@/lib/auth/custom-oauth";

export async function getCurrentSession() {
  globalThis.__OPENCLAW_CF_CTX__ = await getCloudflareContext({ async: true });

  const cookieStore = cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return null;

  return verifyAppSession(token);
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}
