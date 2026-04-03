"use client";

import { useEffect, useState } from "react";

type SessionPayload = {
  authenticated: boolean;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function SessionStatus() {
  const [state, setState] = useState<SessionPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/me", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as SessionPayload;
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState({ authenticated: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/80 px-5 py-4 text-sm text-slate-500 shadow-soft backdrop-blur">
        Checking account status...
      </div>
    );
  }

  if (!state.authenticated) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm text-amber-900 shadow-soft">
        <p className="font-semibold">Sign in to unlock background removal</p>
        <p className="mt-1 text-amber-800">Free plan includes 5 image background removals per day.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-sm text-emerald-950 shadow-soft">
      <p className="font-semibold">Signed in successfully</p>
      <p className="mt-1 text-emerald-800">Using account: {state.user?.email || state.user?.name || state.user?.id}</p>
    </div>
  );
}
