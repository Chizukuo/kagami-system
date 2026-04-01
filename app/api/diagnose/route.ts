import { NextRequest, NextResponse } from "next/server";
import { diagnose } from "@/lib/gemini";
import { DiagnoseRequest, UILanguage } from "@/lib/types";
import { isSupportedLanguage } from "@/lib/i18n";

const MAX_TEXT_LENGTH = 2000;
const MAX_SCENE_LENGTH = 200;

function messageByLang(lang: UILanguage, zh: string, ja: string) {
  return lang === "ja" ? ja : zh;
}

export async function POST(req: NextRequest) {
  let lang: UILanguage = "zh";

  try {
    const body: DiagnoseRequest = await req.json();
    lang = isSupportedLanguage(body.lang) ? body.lang : "zh";

    if (!body.text?.trim() || !body.scene?.trim()) {
      return NextResponse.json(
        { error: messageByLang(lang, "text 和 scene 不能为空", "text と scene は必須です") },
        { status: 400 }
      );
    }

    if (body.text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error: messageByLang(
            lang,
            `text 超过最大长度 ${MAX_TEXT_LENGTH} 字符`,
            `text が最大長 ${MAX_TEXT_LENGTH} 文字を超えています`
          ),
        },
        { status: 400 }
      );
    }

    if (body.scene.length > MAX_SCENE_LENGTH) {
      return NextResponse.json(
        {
          error: messageByLang(
            lang,
            `scene 超过最大长度 ${MAX_SCENE_LENGTH} 字符`,
            `scene が最大長 ${MAX_SCENE_LENGTH} 文字を超えています`
          ),
        },
        { status: 400 }
      );
    }

    const result = await diagnose(body.text, body.scene, lang);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Kagami] Diagnose error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        {
          error: messageByLang(
            lang,
            "请求过于频繁，请稍后重试。",
            "リクエストが多すぎます。しばらくしてから再試行してください。"
          ),
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: messageByLang(
          lang,
          "诊断失败，请稍后重试。",
          "診断に失敗しました。しばらくしてから再試行してください。"
        ),
      },
      { status: 500 }
    );
  }
}
