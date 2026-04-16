import { DiagnosisResult, UILanguage } from "../types";

export interface DiagnosticProvider {
  /**
   * Run diagnosis on the given text and scene.
   * @param text The input text to diagnose
   * @param scene The situational context
   * @param lang The UI language
   * @param model A specific model string if applicable, or undefined to use provider default
   */
  diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult>;
}

export abstract class BaseProvider implements DiagnosticProvider {
  abstract diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult>;

  protected splitNativeVersion(nativeVersion: string): string[] {
    return nativeVersion
      .split(/\r?\n+/)
      .flatMap((line) => line.split(/(?<=[。！？!?])\s*/))
      .map((line) => line.replace(/^[\-*・●\d.)\s]+/, "").trim())
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  // Type definition for raw diagnosis missing array parsing
  protected normalizeDiagnosisResult(raw: Omit<DiagnosisResult, "native_version"> & { native_version: string[] | string }): DiagnosisResult {
    const nativeVersion = Array.isArray(raw.native_version)
      ? raw.native_version.map((line) => String(line).trim()).filter((line) => line.length > 0)
      : this.splitNativeVersion(String(raw.native_version ?? ""));

    return {
      ...raw,
      native_version: nativeVersion,
    };
  }
}
