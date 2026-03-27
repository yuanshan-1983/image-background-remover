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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - remove.bg 风格深色导航 */}
      <header className="bg-[#1a1a2e] text-white px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1a1a2e]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">bg-remover</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">工具</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">定价</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-300 hover:text-white transition-colors">登录</button>
            <button className="bg-white text-[#1a1a2e] text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
              注册
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#f0f4ff] to-white py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Remove Image Background
            </h1>
            <p className="text-xl text-gray-500 mb-10">
              100% 自动去除背景，完全免费
            </p>

            {/* 上传区 */}
            {(status === "idle" || status === "error") && (
              <div
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer
                  ${isDragging
                    ? "border-[#4f46e5] bg-indigo-50 shadow-xl"
                    : "border-dashed border-gray-300 hover:border-[#4f46e5] hover:shadow-xl"
                  }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="py-16 px-8 flex flex-col items-center gap-5">
                  {/* 上传图标 */}
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#4f46e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>

                  <div>
                    <button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-lg px-10 py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg">
                      上传图片
                    </button>
                    <p className="text-gray-400 text-sm mt-3">
                      或拖拽图片到此处 · 支持 JPG / PNG / WEBP · 最大 10MB
                    </p>
                  </div>

                  {/* 错误提示 */}
                  {status === "error" && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      {error}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* 处理中 */}
            {status === "processing" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 py-16 px-8">
                <div className="flex flex-col items-center gap-6">
                  {originalUrl && (
                    <div className="relative">
                      <img src={originalUrl} alt="原图" className="w-40 h-40 object-cover rounded-xl opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-800">正在智能去除背景...</p>
                    <p className="text-sm text-gray-400 mt-1">通常需要 2-5 秒，请稍候</p>
                  </div>
                  <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4f46e5] rounded-full animate-pulse" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* 成功结果 */}
            {status === "success" && (
              <div className="flex flex-col items-center gap-6">
                {/* 对比图 */}
                <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    {/* 原图 */}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">原图</p>
                      <div className="rounded-xl overflow-hidden bg-gray-50">
                        <img src={originalUrl} alt="原图" className="w-full h-64 object-contain" />
                      </div>
                    </div>
                    {/* 结果 */}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-[#4f46e5] uppercase tracking-wider mb-3 text-center">去背景结果 ✨</p>
                      <div className="rounded-xl overflow-hidden checkerboard">
                        <img src={resultUrl} alt="去背景结果" className="w-full h-64 object-contain" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载 PNG
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-colors border border-gray-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0L8 7m4-4l4 4" />
                    </svg>
                    重新上传
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 功能介绍 */}
        {status === "idle" && (
          <section className="py-16 px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">为什么选择 BG Remover？</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "⚡",
                    title: "极速处理",
                    desc: "AI 智能识别，通常 2-5 秒完成，告别漫长等待"
                  },
                  {
                    icon: "🎯",
                    title: "精准抠图",
                    desc: "边缘细节清晰，发丝、透明物体都能完美处理"
                  },
                  {
                    icon: "🔒",
                    title: "隐私安全",
                    desc: "图片处理后立即删除，不保存任何用户数据"
                  }
                ].map((item) => (
                  <div key={item.title} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-gray-400 py-8 px-6 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#1a1a2e]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="text-white font-semibold">bg-remover</span>
          </div>
          <p>
            Powered by{" "}
            <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
              Remove.bg
            </a>
            {" "}· © 2026 BG Remover
          </p>
        </div>
      </footer>
    </div>
  );
}
