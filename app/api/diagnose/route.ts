import { NextRequest, NextResponse } from "next/server";
import { diagnose } from "@/lib/gemini";
import { DiagnoseRequest } from "@/lib/types";

const MAX_TEXT_LENGTH = 2000;
const MAX_SCENE_LENGTH = 200;

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequest = await req.json();

    if (!body.text?.trim() || !body.scene?.trim()) {
      return NextResponse.json(
        { error: "text and scene are required" },
        { status: 400 }
      );
    }

    if (body.text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (body.scene.length > MAX_SCENE_LENGTH) {
      return NextResponse.json(
        { error: `scene exceeds maximum length of ${MAX_SCENE_LENGTH} characters` },
        { status: 400 }
      );
    }

    const result = await diagnose(body.text, body.scene);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Kagami] Diagnose error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Rate limited. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Diagnosis failed. Please try again." },
      { status: 500 }
    );
  }
}
