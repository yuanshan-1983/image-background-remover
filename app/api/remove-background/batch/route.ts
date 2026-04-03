import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getDailyLimitForPlan, getTodayUsageDate, isUnlimitedUser } from "@/lib/auth/limits";
import { getUserUsageCountForDate, incrementDailyUsage, logUsage } from "@/lib/auth/usage";
import { getEnvValue } from "@/lib/cloudflare-env";

export const runtime = "nodejs";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB ?? "10");
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_BATCH_SIZE = 20;

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const user = session.user as any;
  const userPlan = user.plan as string | undefined;

  // Only pro+ users can batch
  if (userPlan !== "pro" && !isUnlimitedUser(user.email)) {
    return NextResponse.json(
      { error: "Batch processing is available for Pro users. Upgrade to unlock." },
      { status: 403 }
    );
  }

  const apiKey = getEnvValue("REMOVE_BG_API_KEY");
  if (!apiKey) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const formData = await request.formData();
  const files: File[] = [];
  for (const [, value] of formData.entries()) {
    if (value instanceof File) files.push(value);
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
  }

  if (files.length > MAX_BATCH_SIZE) {
    return NextResponse.json({ error: `Maximum ${MAX_BATCH_SIZE} files per batch.` }, { status: 400 });
  }

  // Validate all files first
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file: ${file.name}` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
    }
  }

  // Check usage
  const usageDate = getTodayUsageDate();
  const unlimited = isUnlimitedUser(user.email);

  if (!unlimited) {
    const dailyLimit = getDailyLimitForPlan(userPlan);
    const usedCount = await getUserUsageCountForDate(session.user.id, usageDate);
    if (usedCount + files.length > dailyLimit) {
      return NextResponse.json(
        { error: `Not enough quota. You have ${dailyLimit - usedCount} removals remaining today.` },
        { status: 403 }
      );
    }
  }

  // Process all files in parallel
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const removeBgFormData = new FormData();
      removeBgFormData.append("image_file", file, file.name);
      removeBgFormData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: removeBgFormData,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();
        await logUsage({
          userId: session.user.id,
          actionType: "remove_background",
          inputFilename: file.name,
          inputMimeType: file.type,
          inputSizeBytes: file.size,
          status: "failed",
          errorMessage: errorText,
        });
        throw new Error(errorText || "Failed");
      }

      const arrayBuffer = await response.arrayBuffer();

      await logUsage({
        userId: session.user.id,
        actionType: "remove_background",
        inputFilename: file.name,
        inputMimeType: file.type,
        inputSizeBytes: file.size,
        status: "success",
      });
      await incrementDailyUsage(session.user.id, usageDate);

      // Return base64 encoded result
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      return {
        filename: file.name,
        status: "success" as const,
        data: `data:image/png;base64,${base64}`,
      };
    })
  );

  const output = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      filename: files[i].name,
      status: "failed" as const,
      error: r.reason?.message || "Processing failed",
    };
  });

  return NextResponse.json({ results: output });
}
