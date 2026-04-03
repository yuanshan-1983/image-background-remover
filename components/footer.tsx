import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold text-gray-900">ImageBackgroundRemover</p>
            <p className="mt-1 text-xs text-gray-500">
              Remove image backgrounds automatically. Free daily usage with Google sign-in.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/login" className="hover:text-gray-900 transition">
              Login
            </Link>
            <a href="https://github.com/yuanshan-1983/image-background-remover" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">
              GitHub
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} ImageBackgroundRemover. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
