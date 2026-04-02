import BackgroundRemover from "@/components/background-remover";
import AuthCta from "@/components/auth-cta";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Image Background Remover
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Remove backgrounds, preview instantly, download a transparent PNG.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <AuthCta />
      </div>

      <BackgroundRemover />
    </main>
  );
}
