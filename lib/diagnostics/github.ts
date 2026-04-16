import OpenAI from "openai";
import { getSystemPrompt } from "../prompt";
import { DiagnosisResult, UILanguage } from "../types";
import { BaseProvider } from "./provider";

export class GithubModelsProvider extends BaseProvider {
  private client: OpenAI;

  constructor() {
    super();
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("[Kagami] GITHUB_TOKEN environment variable is not set");
    }
    this.client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN,
    });
  }

  async diagnose(text: string, scene: string, lang: UILanguage, modelOverride?: string): Promise<DiagnosisResult> {
    const userMessage = lang === "ja"
      ? `テキスト：${text}\n場面：${scene}`
      : `文本：${text}\n場面：${scene}`;

    const modelName = modelOverride || process.env.GITHUB_MODELS_DEFAULT || "gpt-4o";

    const response = await this.client.chat.completions.create({
      model: modelName,
      temperature: 0.2, // Low temperature for more deterministic diagnostic responses
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: getSystemPrompt(lang) },
        { role: "user", content: userMessage }
      ]
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new Error(`Empty response from GitHub Model ${modelName}`);
    }

    return this.normalizeDiagnosisResult(JSON.parse(raw));
  }
}
