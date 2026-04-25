import { NextRequest, NextResponse } from "next/server";
import { ttsRegistry } from "@/lib/tts/registry";

const MAX_TTS_LENGTH = 500;

export async function POST(req: NextRequest) {
  try {
    const { text, scene, voice } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > MAX_TTS_LENGTH) {
      return NextResponse.json({ error: `Text too long (max ${MAX_TTS_LENGTH} characters)` }, { status: 400 });
    }

    // Heuristic style extraction from scene
    let style = "neutral";
    const lowScene = (scene || "").toLowerCase();
    
    if (lowScene.includes("敬語") || lowScene.includes("丁寧") || lowScene.includes("教授") || lowScene.includes("上司") || lowScene.includes("polite") || lowScene.includes("formal")) {
      style = "polite and professional";
    } else if (lowScene.includes("友達") || lowScene.includes("家族") || lowScene.includes("casual") || lowScene.includes("friendly") || lowScene.includes("口語")) {
      style = "casual and friendly";
    }

    const response = await ttsRegistry.generate({
      text,
      voice,
      style
    });

    const buffer = Buffer.from(response.audioBase64, 'base64');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: unknown) {
    console.error("[TTS API Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to generate TTS";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
