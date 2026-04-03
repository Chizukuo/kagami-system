import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface KvBinding {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface EvalPayload {
  // Input
  inputText: string;
  inputScene: string;
  // LLM output
  grammarCount: number;
  registerCount: number;
  pragmaticsCount: number;
  nativeVersion: string;
  summary: string;
  // Human evaluation
  rating: "accurate" | "partial" | "inaccurate";
  lang?: "zh" | "ja";
  intentMismatch?: boolean;
  userCorrection?: string;
  feedbackNote?: string;
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

    const { env } = getCloudflareContext();
    const kv = (env as Record<string, unknown>).KAGAMI_EVAL as KvBinding;

    const generatedId = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const key = `eval_${generatedId}`;

    const record = {
      ...body,
      // Sanitize optional fields
      intentMismatch: body.intentMismatch ?? false,
      userCorrection: (body.userCorrection ?? "").trim().slice(0, 2000),
      feedbackNote: (body.feedbackNote ?? "").trim().slice(0, 500),
      timestamp: new Date().toISOString(),
    };

    await kv.put(key, JSON.stringify(record), {
      expirationTtl: 365 * 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Kagami] Evaluate error:", error);
    return NextResponse.json({ error: "Failed to store evaluation" }, { status: 500 });
  }
}
