import { GeminiTTSProvider } from "./gemini";
import { OpenAITTSProvider } from "./openai";
import { TTSRequest, TTSResponse } from "./provider";

class TTSRegistry {
  private gemini: GeminiTTSProvider | null = null;
  private openai: OpenAITTSProvider | null = null;

  private getGemini(): GeminiTTSProvider {
    if (!this.gemini) {
      this.gemini = new GeminiTTSProvider();
    }
    return this.gemini;
  }

  private getOpenAI(): OpenAITTSProvider {
    if (!this.openai) {
      this.openai = new OpenAITTSProvider();
    }
    return this.openai;
  }

  async generate(req: TTSRequest): Promise<TTSResponse> {
    const order = (process.env.TTS_FALLBACK_ORDER || "gemini,openai").split(",");
    
    let activeModel = process.env.ACTIVE_TTS_MODEL || "gemini-3.1-flash-tts-preview";
    if (activeModel === "random") {
      const whitelist = (process.env.GEMINI_TTS_MODELS_WHITELIST || "gemini-3.1-flash-tts-preview").split(",");
      activeModel = whitelist[Math.floor(Math.random() * whitelist.length)].trim();
    }

    let lastError: Error | undefined;
    for (const providerId of order) {
      const trimmedId = providerId.trim();
      try {
        if (trimmedId === "gemini") {
          return await this.getGemini().generate({ ...req, activeModel } as TTSRequest & { activeModel?: string });
        }
        if (trimmedId === "openai") {
          return await this.getOpenAI().generate(req);
        }
      } catch (err) {
        console.error(`TTS provider ${trimmedId} failed:`, err as Error);
        lastError = err as Error;
      }
    }

    throw lastError || new Error("No backend TTS providers available");
  }
}

export const ttsRegistry = new TTSRegistry();
