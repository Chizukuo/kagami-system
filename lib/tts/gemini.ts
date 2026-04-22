import { GoogleGenAI } from "@google/genai";
import { BaseTTSProvider, TTSRequest, TTSResponse } from "./provider";

export class GeminiTTSProvider extends BaseTTSProvider {
  private ai: GoogleGenAI;

  constructor() {
    super();
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set for TTS");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Encapsulates raw PCM data into a WAV container
   */
  private encodeWav(pcmBuffer: Buffer, sampleRate: number): Buffer {
    const header = Buffer.alloc(44);
    
    // RIFF identifier
    header.write("RIFF", 0);
    // File length
    header.writeUInt32LE(36 + pcmBuffer.length, 4);
    // RIFF type
    header.write("WAVE", 8);
    // Format chunk identifier
    header.write("fmt ", 12);
    // Format chunk length
    header.writeUInt32LE(16, 16);
    // Sample format (1 is PCM)
    header.writeUInt16LE(1, 20);
    // Channel count (1 for mono)
    header.writeUInt16LE(1, 22);
    // Sample rate
    header.writeUInt32LE(sampleRate, 24);
    // Byte rate (sampleRate * numChannels * bitsPerSample / 8)
    header.writeUInt32LE(sampleRate * 1 * 2, 28);
    // Block align (numChannels * bitsPerSample / 8)
    header.writeUInt16LE(1 * 2, 32);
    // Bits per sample
    header.writeUInt16LE(16, 34);
    // Data chunk identifier
    header.write("data", 36);
    // Data chunk length
    header.writeUInt32LE(pcmBuffer.length, 40);

    return Buffer.concat([header, pcmBuffer]);
  }

  async generate(req: TTSRequest): Promise<TTSResponse> {
    const modelId = req.activeModel || process.env.ACTIVE_TTS_MODEL || "gemini-3.1-flash-tts-preview";
    const voiceName = req.voice || process.env.GEMINI_TTS_VOICE || "Kore";
    
    const styleInstruction = req.style 
      ? `Speak in a ${req.style} tone.` 
      : "Speak in a natural, neutral tone.";

    const result = await this.ai.models.generateContent({
      model: modelId,
      contents: [{ role: "user", parts: [{ text: `${styleInstruction}\n\nText: ${req.text}` }] }],
      config: {
        // @ts-expect-error - types in SDK might be behind
        responseModalities: ["audio"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName
            }
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    const candidate = result.candidates?.[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts = candidate?.content?.parts as any[];
    const audioPart = parts?.find((p) => p.inlineData?.mimeType?.startsWith("audio/"));

    if (!audioPart || !audioPart.inlineData?.data) {
      throw new Error(`No audio part in Gemini response`);
    }

    const rawBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    const mimeType = audioPart.inlineData.mimeType;

    // If Gemini returns raw PCM (L16), wrap it in WAV
    if (mimeType.includes("l16")) {
      // Extract sample rate from mimeType if available, else default to 24000 (Gemini default)
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      
      console.log(`[GeminiTTS] Converting L16 PCM to WAV (${sampleRate}Hz)`);
      const wavBuffer = this.encodeWav(rawBuffer, sampleRate);
      
      return {
        audioBase64: wavBuffer.toString("base64"),
        contentType: "audio/wav"
      };
    }

    return {
      audioBase64: rawBuffer.toString("base64"),
      contentType: mimeType || "audio/mpeg"
    };
  }
}
