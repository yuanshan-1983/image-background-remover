"use client";

import { useState, useRef, useCallback } from "react";

type Status = "idle" | "processing" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // 前端基础校验
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("请上传 JPG / PNG / WEBP 格式的图片");
      setStatus("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("图片大小不能超过 10MB");
      setStatus("error");
      return;
    }

    // 显示原图预览
    const originalObjectUrl = URL.createObjectURL(file);
    setOriginalUrl(originalObjectUrl);
    setStatus("processing");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "处理失败，请重试");
      }

      const blob = await res.blob();
      const resultObjectUrl = URL.createObjectURL(blob);
      setResultUrl(resultObjectUrl);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败，请重试");
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "removed-bg.png";
    a.click();
  };

  const handleReset = () => {
    setStatus("idle");
    setOriginalUrl("");
    setResultUrl("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <svg
            className="w-8 h-8 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" strokeDasharray="3 2" />
            <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
          </svg>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BG Remover</h1>
            <p className="text-xs text-gray-500">
              Remove image backgrounds instantly — free &amp; fast
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        {/* 初始 / 上传区域 */}
        {(status === "idle" || status === "error") && (
          <div className="flex flex-col items-center gap-6">
            <div
              className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-16 flex flex-col items-center gap-4 cursor-pointer transition-colors
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  拖拽图片到这里，或{" "}
                  <span className="text-blue-600 underline">点击上传</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  支持 JPG / PNG / WEBP，最大 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>

            {/* 错误提示 */}
            {status === "error" && (
              <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  <p className="text-xs text-red-600 mt-1">请重新上传图片</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 处理中 */}
        {status === "processing" && (
          <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-2xl bg-white rounded-2xl p-12 flex flex-col items-center gap-6 shadow-sm">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">
                  正在去除背景，请稍候...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  通常需要 2-5 秒
                </p>
              </div>
              {originalUrl && (
                <img
                  src={originalUrl}
                  alt="原图"
                  className="w-32 h-32 object-cover rounded-xl opacity-50"
                />
              )}
            </div>
          </div>
        )}

        {/* 成功结果 */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 原图 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-3 text-center">
                  原图
                </p>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={originalUrl}
                    alt="原图"
                    className="w-full h-64 object-contain bg-gray-50"
                  />
                </div>
              </div>

              {/* 结果图 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-3 text-center">
                  去除背景后
                </p>
                <div className="rounded-xl overflow-hidden checkerboard">
                  <img
                    src={resultUrl}
                    alt="去背景结果"
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                重新上传
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        Powered by{" "}
        <a
          href="https://www.remove.bg"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Remove.bg
        </a>{" "}
        &nbsp;|&nbsp; © 2026 BG Remover
      </footer>
    </div>
  );
}
