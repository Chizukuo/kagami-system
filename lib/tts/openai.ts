import OpenAI from "openai";
import { BaseTTSProvider, TTSRequest, TTSResponse } from "./provider";

export class OpenAITTSProvider extends BaseTTSProvider {
  private openai: OpenAI | null = null;

  constructor() {
    super();
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async generate(req: TTSRequest): Promise<TTSResponse> {
    if (!this.openai) {
      throw new Error("OPENAI_API_KEY is not set for OpenAI TTS");
    }

    const response = await this.openai.audio.speech.create({
      model: "tts-1",
      voice: (req.voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer") || "alloy",
      input: req.text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audioBase64: buffer.toString("base64"),
      contentType: "audio/mpeg"
    };
  }
}
