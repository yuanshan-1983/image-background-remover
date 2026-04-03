"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SessionPayload = {
  authenticated: boolean;
  user?: { email?: string | null; name?: string | null; image?: string | null };
};

export default function Navbar() {
  const [session, setSession] = useState<SessionPayload | null>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSession(d))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  return (
    <nav className="hero-gradient sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-xl font-bold">✦</span>
            <span className="text-sm font-semibold tracking-wide sm:text-base">ImageBGRemover</span>
          </Link>
          <Link href="/pricing" className="hidden text-sm text-blue-200 transition hover:text-white sm:inline">
            Pricing
          </Link>
          <Link href="/batch" className="hidden text-sm text-blue-200 transition hover:text-white sm:inline">
            Batch
          </Link>
          <Link href="/api-docs" className="hidden text-sm text-blue-200 transition hover:text-white sm:inline">
            API
          </Link>
          <Link href="/dashboard" className="hidden text-sm text-blue-200 transition hover:text-white sm:inline">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session === null ? (
            <span className="text-xs text-blue-200">Loading...</span>
          ) : session.authenticated ? (
            <>
              <Link href="/dashboard" className="hidden items-center gap-2 text-xs text-blue-200 transition hover:text-white sm:inline-flex">
                {session.user?.image && (
                  <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
                )}
                {session.user?.email || session.user?.name}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 sm:hidden"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <a
              href="/api/auth/google/start"
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
