import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Background Remover | Remove Background Instantly",
  description:
    "Upload a JPG, PNG, or WEBP image and get a transparent PNG in seconds. No signup. No image storage.",
  keywords: [
    "image background remover",
    "remove background from image",
    "transparent png maker"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
