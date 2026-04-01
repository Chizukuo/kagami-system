import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getSystemPrompt, RESPONSE_SCHEMA } from "./prompt";
import { DiagnosisResult, UILanguage } from "./types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("[Kagami] GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const raw = result.text;
  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  return JSON.parse(raw) as DiagnosisResult;
}
