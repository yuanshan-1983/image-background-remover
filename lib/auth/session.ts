import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth/options";

export async function getCurrentSession() {
  return getServerSession(buildAuthOptions());
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}
