"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type UserInfo = {
  authenticated: boolean;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

type UsageInfo = {
  today: number;
  dailyLimit: number | null;
  unlimited: boolean;
  totalCount: number;
  memberSince: string | null;
  recentLogs: { filename: string; status: string; created_at: string }[];
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardClient() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/me/usage", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]).then(([u, s]) => {
      setUser(u);
      setUsage(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!user?.authenticated) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-gray-900">Please sign in first</p>
        <a
          href="/api/auth/google/start"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign in with Google
        </a>
      </div>
    );
  }

  const u = user.user!;
  const plan = usage?.unlimited ? "Unlimited" : "Free";
  const todayUsed = usage?.today ?? 0;
  const dailyLimit = usage?.dailyLimit;
  const totalCount = usage?.totalCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {u.image ? (
            <img
              src={u.image}
              alt="Avatar"
              className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {(u.name || u.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{u.name || "User"}</h1>
            <p className="mt-1 text-sm text-gray-500">{u.email}</p>
            {usage?.memberSince && (
              <p className="mt-1 text-xs text-gray-400">
                Member since {formatDate(usage.memberSince)}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
              usage?.unlimited
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {plan} Plan
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Today&apos;s usage</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {todayUsed}
            {dailyLimit !== null && (
              <span className="text-base font-normal text-gray-400"> / {dailyLimit}</span>
            )}
          </p>
          {usage?.unlimited && (
            <p className="mt-1 text-xs text-blue-600">Unlimited access</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total removals</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalCount}</p>
          <p className="mt-1 text-xs text-gray-400">All time</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{plan}</p>
          <p className="mt-1 text-xs text-gray-400">
            {usage?.unlimited ? "No daily limit" : `${dailyLimit} removals / day`}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
        >
          ✦ Remove a background
        </Link>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Log out
        </button>
      </div>

      {/* API Keys */}
      <ApiKeysSection />

      {/* Recent Activity */}
      {usage?.recentLogs && usage.recentLogs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {usage.recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    log.status === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {log.status === "success" ? "✓" : "✗"}
                  </span>
                  <span className="truncate text-gray-900">
                    {log.filename || "Unknown file"}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── API Keys Section ─── */
type ApiKeyRow = { id: string; name: string; credits_remaining: number; created_at: string; last_used_at: string | null };

function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(() => {
    fetch("/api/me/api-keys").then((r) => r.json()).then((d) => setKeys(d.keys || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "Default" }),
      });
      const data = await res.json();
      if (data.key) {
        setCreatedKey(data.key);
        setNewKeyName("");
        fetchKeys();
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        <Link href="/api-docs" className="text-sm text-blue-600 hover:underline">
          View docs →
        </Link>
      </div>

      {createdKey && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">New API key created — copy it now!</p>
          <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-xs text-gray-900">{createdKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(createdKey); }} className="mt-2 text-xs text-green-700 underline">
            Copy to clipboard
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Key name (optional)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={createKey}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-400"
        >
          Create key
        </button>
      </div>

      {keys.length > 0 && (
        <div className="mt-4 divide-y divide-gray-100">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{k.name}</p>
                <p className="text-xs text-gray-400">Created {new Date(k.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{k.credits_remaining} credits</p>
                {k.last_used_at && <p className="text-xs text-gray-400">Last used {new Date(k.last_used_at).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
