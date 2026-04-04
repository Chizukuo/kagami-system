import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getSystemPrompt, RESPONSE_SCHEMA } from "./prompt";
import { DiagnosisResult, UILanguage } from "./types";

type RawDiagnosisResult = Omit<DiagnosisResult, "native_version"> & {
  native_version: string[] | string;
};

if (!process.env.GEMINI_API_KEY) {
  throw new Error("[Kagami] GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function splitNativeVersion(nativeVersion: string): string[] {
  return nativeVersion
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/(?<=[。！？!?])\s*/))
    .map((line) => line.replace(/^[\-*・●\d.)\s]+/, "").trim())
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function normalizeDiagnosisResult(raw: RawDiagnosisResult): DiagnosisResult {
  const nativeVersion = Array.isArray(raw.native_version)
    ? raw.native_version.map((line) => String(line).trim()).filter((line) => line.length > 0)
    : splitNativeVersion(String(raw.native_version ?? ""));

  return {
    ...raw,
    native_version: nativeVersion,
  };
}

export async function diagnose(
  text: string,
  scene: string,
  lang: UILanguage
): Promise<DiagnosisResult> {
  const userMessage = lang === "ja"
    ? `テキスト：${text}\n場面：${scene}`
    : `文本：${text}\n場面：${scene}`;

  const result = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: userMessage,
    config: {
      systemInstruction: getSystemPrompt(lang),
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MEDIUM,
      },
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const raw = result.text;
  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  return normalizeDiagnosisResult(JSON.parse(raw) as RawDiagnosisResult);
}
