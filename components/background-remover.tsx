"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "uploading" | "success" | "error";
type BgOption = "transparent" | "white" | "custom";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_FILE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? "10");

const PRESET_COLORS = ["#ffffff", "#000000", "#f43f5e", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function compositeOnColor(transparentUrl: string, color: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(URL.createObjectURL(blob));
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/png"
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = transparentUrl;
  });
}

export default function BackgroundRemover() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>(""); // always transparent
  const [downloadUrl, setDownloadUrl] = useState<string>(""); // may have bg color
  const [dragActive, setDragActive] = useState(false);
  const [bgOption, setBgOption] = useState<BgOption>("transparent");
  const [customColor, setCustomColor] = useState("#3b82f6");
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (downloadUrl && downloadUrl !== resultUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [originalPreview, resultUrl, downloadUrl]);

  // Recomposite when bg option changes
  const updateDownload = useCallback(async () => {
    if (!resultUrl) return;
    if (bgOption === "transparent") {
      setDownloadUrl(resultUrl);
      return;
    }
    const color = bgOption === "white" ? "#ffffff" : customColor;
    try {
      const url = await compositeOnColor(resultUrl, color);
      setDownloadUrl((prev) => {
        if (prev && prev !== resultUrl) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setDownloadUrl(resultUrl);
    }
  }, [resultUrl, bgOption, customColor]);

  useEffect(() => {
    updateDownload();
  }, [updateDownload]);

  const helperText = useMemo(
    () => `JPG, PNG, WEBP · Max ${DEFAULT_MAX_FILE_MB} MB`,
    []
  );

  const resetError = () => { if (error) setError(""); };

  const validateFile = (nextFile: File) => {
    const maxBytes = DEFAULT_MAX_FILE_MB * 1024 * 1024;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) return "Unsupported file type. Please upload JPG, PNG, or WEBP.";
    if (nextFile.size > maxBytes) return `File is too large. Max size is ${DEFAULT_MAX_FILE_MB} MB.`;
    return "";
  };

  const prepareFile = (nextFile: File) => {
    const validationError = validateFile(nextFile);
    if (validationError) { setStatus("error"); setError(validationError); return; }
    resetError();
    setStatus("idle");
    setFile(nextFile);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultUrl) { URL.revokeObjectURL(resultUrl); setResultUrl(""); }
    if (downloadUrl && downloadUrl !== resultUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");
    setOriginalPreview(URL.createObjectURL(nextFile));
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) prepareFile(f); };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); setDragActive(false);
    const f = e.dataTransfer.files?.[0]; if (f) prepareFile(f);
  };

  const onSubmit = async () => {
    if (!file) { setStatus("error"); setError("Please choose an image first."); return; }
    setStatus("uploading"); setError("");
    try {
      const formData = new FormData();
      formData.append("image_file", file);
      const response = await fetch("/api/remove-background", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (response.status === 401) throw new Error(data?.error || "Please sign in with Google to use this tool.");
        if (response.status === 403) throw new Error(data?.error || "Daily free limit reached. Try again tomorrow.");
        throw new Error(data?.error || "Background removal failed. Please try again.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setDownloadUrl(url);
      setBgOption("transparent");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const resetAll = () => {
    setStatus("idle"); setError(""); setFile(null);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    if (downloadUrl && downloadUrl !== resultUrl) URL.revokeObjectURL(downloadUrl);
    setOriginalPreview(""); setResultUrl(""); setDownloadUrl("");
    setBgOption("transparent");
  };

  const downloadFilename = bgOption === "transparent"
    ? "removed-background.png"
    : bgOption === "white"
      ? "white-background.png"
      : "custom-background.png";

  /* ─── Upload screen ─── */
  if (!file && status !== "success") {
    return (
      <div className="space-y-4">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-14 text-center transition ${
            dragActive
              ? "border-blue-400 bg-blue-500/20"
              : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15"
          }`}
        >
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl text-white">📤</div>
          <p className="mt-4 text-base font-semibold text-white">Upload Image</p>
          <p className="mt-1 text-sm text-blue-200">or drag and drop a file</p>
          <p className="mt-3 text-xs text-blue-300/70">{helperText}</p>
        </label>
        {error && <div className="rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>}
      </div>
    );
  }

  /* ─── File selected / processing / result ─── */
  return (
    <div className="space-y-6">
      {/* File selected, not yet processed */}
      {file && status !== "success" && (
        <div className="space-y-4">
          {originalPreview && (
            <div className="rounded-xl bg-white/10 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-200">Preview</p>
              <div className="flex items-center justify-center rounded-lg bg-white/5 p-2">
                <img src={originalPreview} alt="Original preview" className="max-h-[280px] w-auto rounded-lg object-contain" />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm">
            <div className="min-w-0 text-left">
              <p className="truncate font-medium text-white">{file.name}</p>
              <p className="text-blue-200">{formatBytes(file.size)}</p>
            </div>
            <button type="button" onClick={resetAll} className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/10">Change</button>
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-300 border-t-white" />
          <p className="text-sm font-medium text-white">Removing background...</p>
        </div>
      )}

      {file && status === "idle" && (
        <button type="button" onClick={onSubmit} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-5 py-3.5 text-base font-bold text-white transition hover:bg-blue-600">
          Remove Background
        </button>
      )}

      {error && <div className="rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>}

      {/* Result */}
      {status === "success" && (
        <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
          {/* Images side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Original</p>
              <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-3" style={{ minHeight: 200 }}>
                {originalPreview ? (
                  <img src={originalPreview} alt="Original" style={{ maxHeight: 360, maxWidth: "100%" }} className="rounded-lg object-contain" />
                ) : (
                  <p className="text-sm text-gray-400">Original image not available</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Background Removed</p>
              <div
                className={`flex items-center justify-center rounded-xl border border-gray-200 p-3 ${bgOption === "transparent" ? "checkerboard" : ""}`}
                style={{
                  minHeight: 200,
                  backgroundColor: bgOption === "white" ? "#ffffff" : bgOption === "custom" ? customColor : undefined,
                }}
              >
                {resultUrl ? (
                  <img src={resultUrl} alt="Result" style={{ maxHeight: 360, maxWidth: "100%" }} className="rounded-lg object-contain" />
                ) : (
                  <p className="text-sm text-gray-500">Result not available</p>
                )}
              </div>
            </div>
          </div>

          {/* Background Options */}
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Background</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setBgOption("transparent")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  bgOption === "transparent" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="checkerboard inline-block h-5 w-5 rounded border border-gray-200" />
                Transparent
              </button>
              <button
                type="button"
                onClick={() => setBgOption("white")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  bgOption === "white" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="inline-block h-5 w-5 rounded border border-gray-200 bg-white" />
                White
              </button>
              <button
                type="button"
                onClick={() => setBgOption("custom")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  bgOption === "custom" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="inline-block h-5 w-5 rounded border border-gray-200" style={{ backgroundColor: customColor }} />
                Color
              </button>

              {bgOption === "custom" && (
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition ${customColor === c ? "border-blue-500 scale-110" : "border-gray-200 hover:border-gray-400"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-xs text-gray-400 hover:border-gray-400"
                  >
                    +
                  </button>
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="invisible absolute h-0 w-0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Remove another image
            </button>
            <a
              href={downloadUrl || resultUrl || undefined}
              download={downloadFilename}
              className={`inline-flex flex-1 items-center justify-center rounded-xl px-5 py-3 text-base font-bold transition ${
                downloadUrl ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 pointer-events-none"
              }`}
            >
              ⬇ Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
