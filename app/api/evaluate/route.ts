import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface KvBinding {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

type Rating = "accurate" | "partial" | "inaccurate";
const MAX_RES_ID_LENGTH = 128;

interface EvalPayload {
  resId?: string;
  // Input
  inputText: string;
  inputScene: string;
  // LLM output
  grammarCount: number;
  registerCount: number;
  pragmaticsCount: number;
  nativeVersion: string[] | string;
  summary: string;
  // Human evaluation
  rating: Rating;
  lang?: "zh" | "ja";
  intentMismatch?: boolean;
  userCorrection?: string;
  feedbackNote?: string;
}

function deriveSystemRating(grammarCount: number, registerCount: number, pragmaticsCount: number): Rating {
  const total = grammarCount + registerCount + pragmaticsCount;

  if (total === 0) {
    return "accurate";
  }

  if (total <= 2) {
    return "partial";
  }

  return "inaccurate";
}

function normalizeNativeVersion(nativeVersion: string[] | string): string[] {
  if (Array.isArray(nativeVersion)) {
    return nativeVersion
      .map((line) => String(line).trim())
      .filter((line) => line.length > 0)
      .slice(0, 30);
  }

  if (typeof nativeVersion === "string") {
    return nativeVersion
      .split(/\r?\n+/)
      .flatMap((line) => line.split(/(?<=[。！？!?])\s*/))
      .map((line) => line.replace(/^[\-*・●\d.)\s]+/, "").trim())
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 30);
  }

  return [];
}

function isValidCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function sanitizeResId(resId?: string): string {
  return (resId ?? "")
    .trim()
    .slice(0, MAX_RES_ID_LENGTH)
    .replace(/[^A-Za-z0-9_-]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body: EvalPayload = await req.json();

    // Validate required fields
    if (!body.inputText || !body.inputScene || !body.rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["accurate", "partial", "inaccurate"].includes(body.rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    if (!isValidCount(body.grammarCount) || !isValidCount(body.registerCount) || !isValidCount(body.pragmaticsCount)) {
      return NextResponse.json({ error: "Invalid count fields" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const kv = (env as Record<string, unknown>).KAGAMI_EVAL as KvBinding;

    const generatedId = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const resId = sanitizeResId(body.resId) || generatedId;
    const key = `eval_${resId}`;
    const nativeVersionLines = normalizeNativeVersion(body.nativeVersion);
    const systemRating = deriveSystemRating(body.grammarCount, body.registerCount, body.pragmaticsCount);

    const record = {
      ...body,
      resId,
      systemRating,
      nativeVersion: nativeVersionLines.join("\n"),
      // Sanitize optional fields
      intentMismatch: body.intentMismatch ?? false,
      userCorrection: (body.userCorrection ?? "").trim().slice(0, 2000),
      feedbackNote: (body.feedbackNote ?? "").trim().slice(0, 500),
      timestamp: new Date().toISOString(),
    };

    await kv.put(key, JSON.stringify(record), {
      expirationTtl: 365 * 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true, resId });
  } catch (error) {
    console.error("[Kagami] Evaluate error:", error);
    return NextResponse.json({ error: "Failed to store evaluation" }, { status: 500 });
  }
}
