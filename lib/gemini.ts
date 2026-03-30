import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from "./prompt";
import { DiagnosisResult } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: RESPONSE_SCHEMA,
  },
});

export async function diagnose(
  text: string,
  scene: string
): Promise<DiagnosisResult> {
  const userMessage = `文本：${text}\n場面：${scene}`;
  const result = await model.generateContent(userMessage);
  const raw = result.response.text();
  return JSON.parse(raw) as DiagnosisResult;
}
