"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";

type Status = "idle" | "uploading" | "success" | "error";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_FILE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? "10");

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BackgroundRemover() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalPreview, resultUrl]);

  const helperText = useMemo(
    () => `Supports JPG, PNG, WEBP · Max file size: ${DEFAULT_MAX_FILE_MB}MB · We do not store your images`,
    []
  );

  const resetError = () => {
    if (error) setError("");
  };

  const validateFile = (nextFile: File) => {
    const maxBytes = DEFAULT_MAX_FILE_MB * 1024 * 1024;

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      return "Unsupported file type. Please upload JPG, PNG, or WEBP.";
    }

    if (nextFile.size > maxBytes) {
      return `File is too large. Max size is ${DEFAULT_MAX_FILE_MB}MB.`;
    }

    return "";
  };

  const prepareFile = (nextFile: File) => {
    const validationError = validateFile(nextFile);
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    resetError();
    setStatus("idle");
    setFile(nextFile);

    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }

    setOriginalPreview(URL.createObjectURL(nextFile));
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    prepareFile(nextFile);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (!nextFile) return;
    prepareFile(nextFile);
  };

  const onSubmit = async () => {
    if (!file) {
      setStatus("error");
      setError("Please choose an image first.");
      return;
    }

    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image_file", file);

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Background removal failed. Please try again.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const resetAll = () => {
    setStatus("idle");
    setError("");
    setFile(null);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalPreview("");
    setResultUrl("");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              Fast AI background removal
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Remove image background instantly
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Upload your image and get a clean transparent PNG in seconds. No signup. No image storage.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">No signup</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Processed in memory</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">PNG download</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="space-y-4">
              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  dragActive
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-300 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileChange}
                />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-900">Upload image</p>
                  <p className="text-sm text-slate-500">Drag and drop or click to choose a file</p>
                  <p className="text-xs text-slate-400">{helperText}</p>
                </div>
              </label>

              {file ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{file.name}</p>
                      <p>{formatBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetAll}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={onSubmit}
                disabled={!file || status === "uploading"}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status === "uploading" ? "Removing background..." : "Remove Background"}
              </button>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Original image</h2>
            <span className="text-sm text-slate-500">Before</span>
          </div>
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {originalPreview ? (
              <img src={originalPreview} alt="Original preview" className="max-h-[420px] w-auto rounded-xl object-contain" />
            ) : (
              <p className="max-w-xs text-center text-sm text-slate-400">Upload a JPG, PNG, or WEBP image to preview it here.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Background removed</h2>
            <span className="text-sm text-slate-500">After</span>
          </div>
          <div className="checkerboard flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 p-4">
            {resultUrl ? (
              <img src={resultUrl} alt="Processed result" className="max-h-[420px] w-auto rounded-xl object-contain" />
            ) : (
              <p className="max-w-xs text-center text-sm text-slate-500">Your transparent PNG result will appear here after processing.</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={resultUrl || undefined}
              download="removed-background.png"
              className={`inline-flex flex-1 items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition ${
                resultUrl
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "pointer-events-none bg-slate-200 text-slate-400"
              }`}
            >
              Download PNG
            </a>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Upload Another Image
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "No image storage",
            desc: "Images are processed in memory only and are not saved on the server."
          },
          {
            title: "Simple workflow",
            desc: "Upload, wait a few seconds, preview the result, and download your transparent PNG."
          },
          {
            title: "Built for MVP speed",
            desc: "Uses the Remove.bg API so you can validate demand before investing in custom ML infra."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
        <div className="mt-6 space-y-4">
          {[
            {
              q: "Do you store my images?",
              a: "No. This MVP is designed to process images in memory only and does not keep uploads or output files."
            },
            {
              q: "What file types are supported?",
              a: "JPG, PNG, and WEBP are supported in the current version."
            },
            {
              q: "How large can my image be?",
              a: `The default upload limit is ${DEFAULT_MAX_FILE_MB}MB.`
            },
            {
              q: "Is this tool free?",
              a: "This MVP is focused on validating the core workflow. Pricing and usage limits can be added later."
            },
            {
              q: "What if the result is not ideal?",
              a: "Some complex edges like hair, glass, or shadows may need a better source image or future refinement tools."
            }
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">{item.q}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
