import { NextRequest, NextResponse } from "next/server";
import { diagnose } from "@/lib/gemini";
import { DiagnoseRequest, UILanguage } from "@/lib/types";
import { isSupportedLanguage } from "@/lib/i18n";

const MAX_TEXT_LENGTH = 2000;
const MAX_SCENE_LENGTH = 200;
const MAX_ERROR_DETAILS_LENGTH = 2000;

function createResId() {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function messageByLang(lang: UILanguage, zh: string, ja: string) {
  return lang === "ja" ? ja : zh;
}

function truncateText(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength)}\n... [truncated]`;
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function toLowerErrorPayload(error: unknown): string {
  const parts: string[] = [];
  if (error instanceof Error) {
    parts.push(error.message);
    if (error.stack) {
      parts.push(error.stack);
    }
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      parts.push(cause.message);
      if (cause.stack) {
        parts.push(cause.stack);
      }
    } else if (typeof cause === "object" && cause !== null) {
      parts.push(safeStringify(cause));
    } else if (cause) {
      parts.push(String(cause));
    }
  } else {
    parts.push(String(error));
  }
  return parts.join("\n").toLowerCase();
}

function buildErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const stackPreview = (error.stack || "").split("\n").slice(0, 4).join("\n");
    let details = stackPreview || error.message;
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      details += `\n\n[Cause]: ${cause.message}`;
      if (cause.stack) {
        details += `\n${cause.stack.split("\n").slice(0, 2).join("\n")}`;
      }
    } else if (typeof cause === "object" && cause !== null) {
      const maybeCode = (cause as { code?: unknown }).code;
      const maybeMessage = (cause as { message?: unknown }).message;
      details += `\n\n[Cause]: ${typeof maybeMessage === "string" ? maybeMessage : safeStringify(cause)}`;
      if (typeof maybeCode === "string") {
        details += ` (Code: ${maybeCode})`;
      }
      const maybeErrors = (cause as { errors?: unknown }).errors;
      if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
        const summarized = maybeErrors
          .slice(0, 3)
          .map((item) => {
            if (item instanceof Error) {
              return item.message;
            }
            if (typeof item === "object" && item !== null && "message" in item && typeof (item as { message?: unknown }).message === "string") {
              return (item as { message: string }).message;
            }
            return String(item);
          })
          .join("; ");
        details += `\n[Errors]: ${summarized}`;
      }
    }
    return truncateText(details, MAX_ERROR_DETAILS_LENGTH);
  }
  return truncateText(String(error), MAX_ERROR_DETAILS_LENGTH);
}

function hasNumericStatusCode(payload: string, code: 404 | 429 | 503 | 504) {
  const compact = payload.replace(/\s+/g, "");
  const normalizedCode = String(code);
  return (
    compact.includes(`"code":${normalizedCode}`) ||
    compact.includes(`"code":"${normalizedCode}"`) ||
    compact.includes(`"statuscode":${normalizedCode}`) ||
    compact.includes(`"statuscode":"${normalizedCode}"`) ||
    compact.includes(`"status":${normalizedCode}`) ||
    compact.includes(`"status":"${normalizedCode}"`) ||
    compact.includes(`code:${normalizedCode}`) ||
    payload.includes(`status code ${normalizedCode}`) ||
    payload.includes(`http ${normalizedCode}`)
  );
}

function getErrorStatusCode(payload: string) {
  if (hasNumericStatusCode(payload, 429) || payload.includes("resource_exhausted")) {
    return 429;
  }
  if (hasNumericStatusCode(payload, 404) || payload.includes("not found")) {
    return 503;
  }
  if (hasNumericStatusCode(payload, 503) || payload.includes("unavailable")) {
    return 503;
  }
  if (
    hasNumericStatusCode(payload, 504) ||
    payload.includes("deadline_exceeded") ||
    payload.includes("etimedout") ||
    payload.includes("timeout") ||
    payload.includes("timed out")
  ) {
    return 504;
  }
  if (
    payload.includes("fetch failed") ||
    payload.includes("econnreset") ||
    payload.includes("enotfound") ||
    payload.includes("eai_again") ||
    payload.includes("econnrefused") ||
    payload.includes("socket hang up") ||
    payload.includes("network")
  ) {
    return 503;
  }
  return 500;
}

export async function POST(req: NextRequest) {
  let lang: UILanguage = "zh";

  try {
    const body: DiagnoseRequest = await req.json();
    lang = isSupportedLanguage(body.lang) ? body.lang : "zh";

    if (typeof body.text !== "string" || typeof body.scene !== "string") {
      return NextResponse.json(
        { error: messageByLang(lang, "text 和 scene 必须为字符串", "text と scene は文字列である必要があります") },
        { status: 400 }
      );
    }

    if (!body.text.trim() || !body.scene.trim()) {
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
    return NextResponse.json({
      ...result,
      _resId: createResId(),
    });
  } catch (error) {
    const traceId = createResId();
    console.error(`[Kagami][${traceId}] Diagnose error:`, error);

    const payload = toLowerErrorPayload(error);
    const status = getErrorStatusCode(payload);
    const details = buildErrorDetails(error);
    const exposeDetails = process.env.NODE_ENV !== "production";

    let errorMessage = messageByLang(
      lang,
      "诊断失败，请稍后重试。",
      "診断に失敗しました。しばらくしてから再試行してください。"
    );

    if (status === 429) {
      errorMessage = messageByLang(
        lang,
        "请求过于频繁，请稍后重试。",
        "リクエストが多すぎます。しばらくしてから再試行してください。"
      );
    } else if (status === 503) {
      errorMessage = messageByLang(
        lang,
        "上游服务暂时不可用，请稍后重试。",
        "上流サービスが一時的に利用できません。しばらくしてから再試行してください。"
      );
    } else if (status === 504) {
      errorMessage = messageByLang(
        lang,
        "上游服务响应超时，请稍后重试。",
        "上流サービスの応答がタイムアウトしました。しばらくしてから再試行してください。"
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        traceId,
        ...(exposeDetails ? { details } : {}),
      },
      { status }
    );
  }
}
