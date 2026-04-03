import Link from "next/link";

export default function AuthCta() {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Product access</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Sign in once, remove backgrounds faster, and keep your usage synced.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Google login unlocks secure image processing, D1-backed session persistence, and your free daily usage quota.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open login
          </Link>
          <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600">
            5 free removals / day
          </span>
        </div>
      </div>
    </div>
  );
}
