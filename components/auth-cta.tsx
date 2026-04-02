import Link from "next/link";

export default function AuthCta() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">Google login is the next step</p>
          <p className="mt-1 text-sm text-emerald-800">
            The D1 schema is ready. Next, wire Google OAuth credentials and protect background removal for signed-in users.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
        >
          Open login page
        </Link>
      </div>
    </div>
  );
}
