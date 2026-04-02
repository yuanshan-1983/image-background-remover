import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getFreeDailyRemoveBgLimit, getTodayUsageDate } from "@/lib/auth/limits";
import { getUserUsageCountForDate, incrementDailyUsage, logUsage } from "@/lib/auth/usage";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB ?? "10");
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await requireSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in with Google before removing backgrounds." },
      { status: 401 }
    );
  }

  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is not configured. Missing REMOVE_BG_API_KEY." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image_file");

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    const usageDate = getTodayUsageDate();
    const usedCount = await getUserUsageCountForDate(session.user.id, usageDate);
    const freeLimit = getFreeDailyRemoveBgLimit();

    if (usedCount >= freeLimit) {
      return NextResponse.json(
        { error: `You have reached your free daily limit of ${freeLimit} background removals.` },
        { status: 403 }
      );
    }

    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile, imageFile.name);
    removeBgFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey
      },
      body: removeBgFormData,
      cache: "no-store"
    });

    if (!response.ok) {
      const errorText = await response.text();
      await logUsage({
        userId: session.user.id,
        actionType: "remove_background",
        inputFilename: imageFile.name,
        inputMimeType: imageFile.type,
        inputSizeBytes: imageFile.size,
        status: "failed",
        errorMessage: errorText || "Background removal failed. Please try again."
      });

      return NextResponse.json(
        {
          error: errorText || "Background removal failed. Please try again."
        },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    await logUsage({
      userId: session.user.id,
      actionType: "remove_background",
      inputFilename: imageFile.name,
      inputMimeType: imageFile.type,
      inputSizeBytes: imageFile.size,
      status: "success"
    });

    await incrementDailyUsage(session.user.id, usageDate);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="removed-background.png"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("remove-background error", error);
    await logUsage({
      userId: session.user.id,
      actionType: "remove_background",
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Service is temporarily unavailable. Please try again."
    });

    return NextResponse.json(
      { error: "Service is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
