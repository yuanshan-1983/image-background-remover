import Link from "next/link";

export default function LoginPage() {
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Login</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Continue with Google</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This page is the entry point for the upcoming Auth.js + Google OAuth flow.
        </p>

        <div className="mt-8 space-y-4">
          {googleConfigured ? (
            <a
              href="/api/auth/signin"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              Continue with Google
            </a>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Google OAuth is not configured yet. Add <code>AUTH_GOOGLE_ID</code>, <code>AUTH_GOOGLE_SECRET</code>,
              and <code>AUTH_SECRET</code> to enable login.
            </div>
          )}

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
