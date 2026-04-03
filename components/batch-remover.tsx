"use client";

import { ChangeEvent, useState } from "react";

type FileResult = {
  filename: string;
  status: "pending" | "success" | "failed";
  data?: string;
  error?: string;
};

const ACCEPTED = "image/jpeg,image/png,image/webp";
const MAX_FILES = 20;

export default function BatchRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const onFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, MAX_FILES);
    setFiles(selected);
    setResults([]);
    setError("");
  };

  const onSubmit = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError("");
    setResults(files.map((f) => ({ filename: f.name, status: "pending" })));

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f, f.name));

      const res = await fetch("/api/remove-background/batch", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Batch processing failed.");
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = () => {
    results
      .filter((r) => r.status === "success" && r.data)
      .forEach((r) => {
        const a = document.createElement("a");
        a.href = r.data!;
        a.download = r.filename.replace(/\.[^.]+$/, "") + "-nobg.png";
        a.click();
      });
  };

  const successCount = results.filter((r) => r.status === "success").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Batch Remove Backgrounds</h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload up to {MAX_FILES} images at once. Pro feature — requires an active Pro subscription.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
          <input
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={onFilesChange}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">📁</div>
          <p className="mt-3 text-base font-semibold text-gray-900">Select images</p>
          <p className="mt-1 text-sm text-gray-500">JPG, PNG, WEBP · Up to {MAX_FILES} files</p>
        </label>

        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f) => (
                <span key={f.name} className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={files.length === 0 || processing}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {processing ? `Processing ${files.length} images...` : `Remove backgrounds (${files.length})`}
        </button>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Results ({successCount}/{results.length} processed)
            </h2>
            {successCount > 0 && (
              <button
                type="button"
                onClick={downloadAll}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                ⬇ Download all ({successCount})
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <p className="truncate text-sm font-medium text-gray-900">{r.filename}</p>
                {r.status === "pending" && (
                  <div className="mt-3 flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  </div>
                )}
                {r.status === "success" && r.data && (
                  <div className="checkerboard mt-3 flex h-32 items-center justify-center rounded-lg border border-gray-100 p-2">
                    <img src={r.data} alt={r.filename} className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                {r.status === "failed" && (
                  <div className="mt-3 flex h-32 items-center justify-center rounded-lg bg-red-50 text-xs text-red-500">
                    Failed: {r.error || "Unknown error"}
                  </div>
                )}
                {r.status === "success" && r.data && (
                  <a
                    href={r.data}
                    download={r.filename.replace(/\.[^.]+$/, "") + "-nobg.png"}
                    className="mt-2 flex w-full items-center justify-center rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
