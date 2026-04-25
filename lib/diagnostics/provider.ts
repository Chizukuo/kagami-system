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
  protected normalizeDiagnosisResult(raw: Record<string, unknown>): DiagnosisResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nativeVersions = (raw.native_versions as any[]) || [];
    
    // Ensure native_versions is correctly formatted
    if (!Array.isArray(nativeVersions)) {
      nativeVersions = [];
    }

    // Fallback: if native_versions is empty but native_version exists
    if (nativeVersions.length === 0 && raw.native_version) {
      const sentences = Array.isArray(raw.native_version)
        ? raw.native_version.map((s: unknown) => String(s).trim())
        : this.splitNativeVersion(String(raw.native_version));
      
      nativeVersions = [{
        label: "Native",
        sentences: sentences
      }];
    }

    const firstSentences = nativeVersions[0]?.sentences || [];

    return {
      ...raw,
      native_versions: nativeVersions,
      native_version: firstSentences,
    } as unknown as DiagnosisResult;
  }
}
