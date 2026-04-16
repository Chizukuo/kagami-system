import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getSystemPrompt, RESPONSE_SCHEMA } from "../prompt";
import { DiagnosisResult, UILanguage } from "../types";
import { BaseProvider } from "./provider";

export class GeminiProvider extends BaseProvider {
  private ai: GoogleGenAI;

  constructor() {
    super();
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("[Kagami] GEMINI_API_KEY environment variable is not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async diagnose(text: string, scene: string, lang: UILanguage, modelOverride?: string): Promise<DiagnosisResult> {
    const userMessage = lang === "ja"
      ? `テキスト：${text}\n場面：${scene}`
      : `文本：${text}\n場面：${scene}`;

    const modelName = modelOverride || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

    const versionMatch = modelName.match(/(\d+)\.\d+/);
    const majorVersion = versionMatch ? parseInt(versionMatch[1], 10) : 0;
    const supportsThinking = majorVersion >= 3 || modelName.includes("thinking");

    const result = await this.ai.models.generateContent({
      model: modelName,
      contents: userMessage,
      config: {
        systemInstruction: getSystemPrompt(lang),
        ...(supportsThinking && {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MEDIUM,
          },
        }),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const raw = result.text;
    if (!raw) {
      throw new Error(`Empty response from Gemini model ${modelName}`);
    }

    return this.normalizeDiagnosisResult(JSON.parse(raw));
  }
}
