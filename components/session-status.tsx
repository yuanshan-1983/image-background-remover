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
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-soft">
        Checking login status...
      </div>
    );
  }

  if (!state.authenticated) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
        Not signed in yet. Google login is available, but remover API protection will be enabled after D1 persistence is fully finished.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-soft">
      Signed in as {state.user?.email || state.user?.name || state.user?.id}
    </div>
  );
}
