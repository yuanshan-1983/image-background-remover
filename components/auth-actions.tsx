"use client";

export default function AuthActions() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href="/api/auth/google/start"
        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Continue with Google
      </a>
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Logout
      </button>
    </div>
  );
}
