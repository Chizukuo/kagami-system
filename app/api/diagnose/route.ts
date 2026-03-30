import { NextRequest, NextResponse } from "next/server";
import { diagnose } from "@/lib/gemini";
import { DiagnoseRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequest = await req.json();

    if (!body.text?.trim() || !body.scene?.trim()) {
      return NextResponse.json(
        { error: "text and scene are required" },
        { status: 400 }
      );
    }

    const result = await diagnose(body.text, body.scene);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Kagami] Diagnose error:", error);
    return NextResponse.json(
      { error: "Diagnosis failed. Please try again." },
      { status: 500 }
    );
  }
}
