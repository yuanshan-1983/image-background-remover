import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BG Remover - 免费在线抠图工具",
  description:
    "免费在线去除图片背景，支持 JPG/PNG/WEBP，快速下载透明 PNG。Remove image backgrounds instantly, free and fast.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
