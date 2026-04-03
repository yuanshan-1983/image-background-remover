import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remove Image Background — Free & Instant | ImageBackgroundRemover",
  description:
    "Remove image backgrounds 100% automatically in seconds. Upload a photo and download a transparent PNG. Free daily usage with Google sign-in.",
  keywords: [
    "remove background",
    "image background remover",
    "remove bg",
    "transparent png",
    "background eraser",
    "free background remover",
    "remove background from image",
    "background removal tool",
    "ai background remover"
  ],
  metadataBase: new URL("https://imagebackgroundremover.club"),
  openGraph: {
    title: "Remove Image Background — Free & Instant",
    description: "Remove image backgrounds 100% automatically in seconds. Upload a photo and download a transparent PNG.",
    url: "https://imagebackgroundremover.club",
    siteName: "ImageBackgroundRemover",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Image Background — Free & Instant",
    description: "Remove image backgrounds 100% automatically in seconds.",
  },
  alternates: {
    canonical: "https://imagebackgroundremover.club",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
