import { Alternative, DiagnosisResult, GrammarIssue, NativeVersion, PragmaticsIssue, RegisterIssue, UILanguage } from "../types";

export interface DiagnosticProvider {
  /** Run diagnosis on the given text and scene. */
  diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult>;
}

export abstract class BaseProvider implements DiagnosticProvider {
  abstract diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult>;

  private asRecord(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`Invalid diagnosis result: ${label} must be an object`);
    }
    return value as Record<string, unknown>;
  }

  private requireString(value: unknown, label: string): string {
    if (typeof value !== "string") {
      throw new Error(`Invalid diagnosis result: ${label} must be a string`);
    }
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error(`Invalid diagnosis result: ${label} must not be empty`);
    }
    return trimmed;
  }

  private normalizeAlternatives(value: unknown, label: string): Alternative[] {
    if (!Array.isArray(value)) {
      throw new Error(`Invalid diagnosis result: ${label} must be an array`);
    }

    const alternatives = value.map((item, index) => {
      const record = this.asRecord(item, `${label}[${index}]`);
      return {
        expression: this.requireString(record.expression, `${label}[${index}].expression`),
        context: this.requireString(record.context, `${label}[${index}].context`),
      };
    });

    if (alternatives.length === 0) {
      throw new Error(`Invalid diagnosis result: ${label} must contain at least one item`);
    }

    return alternatives;
  }

  private normalizeGrammarIssues(value: unknown): GrammarIssue[] {
    if (!Array.isArray(value)) {
      throw new Error("Model failed to generate required layer array: grammar");
    }

    return value.map((item, index) => {
      const record = this.asRecord(item, `grammar[${index}]`);
      return {
        original: this.requireString(record.original, `grammar[${index}].original`),
        issue: this.requireString(record.issue, `grammar[${index}].issue`),
        correction: this.requireString(record.correction, `grammar[${index}].correction`),
      };
    });
  }

  private normalizeRegisterIssues(value: unknown): RegisterIssue[] {
    if (!Array.isArray(value)) {
      throw new Error("Model failed to generate required layer array: register");
    }

    return value.map((item, index) => {
      const record = this.asRecord(item, `register[${index}]`);
      return {
        original: this.requireString(record.original, `register[${index}].original`),
        issue: this.requireString(record.issue, `register[${index}].issue`),
        suggestion: this.requireString(record.suggestion, `register[${index}].suggestion`),
        alternatives: this.normalizeAlternatives(record.alternatives, `register[${index}].alternatives`),
      };
    });
  }

  private normalizePragmaticsIssues(value: unknown): PragmaticsIssue[] {
    if (!Array.isArray(value)) {
      throw new Error("Model failed to generate required layer array: pragmatics");
    }

    return value.map((item, index) => {
      const record = this.asRecord(item, `pragmatics[${index}]`);
      return {
        original: this.requireString(record.original, `pragmatics[${index}].original`),
        issue: this.requireString(record.issue, `pragmatics[${index}].issue`),
        alternatives: this.normalizeAlternatives(record.alternatives, `pragmatics[${index}].alternatives`),
      };
    });
  }

  private normalizeNativeVersions(value: unknown, legacyNativeVersion: unknown): NativeVersion[] {
    let nativeVersions: NativeVersion[] = [];

    if (Array.isArray(value)) {
      nativeVersions = value.map((item, index) => {
        const record = this.asRecord(item, `native_versions[${index}]`);
        if (!Array.isArray(record.sentences)) {
          throw new Error(`Invalid diagnosis result: native_versions[${index}].sentences must be an array`);
        }

        const sentences = record.sentences.map((sentence, sentenceIndex) =>
          this.requireString(sentence, `native_versions[${index}].sentences[${sentenceIndex}]`)
        );

        if (sentences.length === 0) {
          throw new Error(`Invalid diagnosis result: native_versions[${index}].sentences must contain at least one item`);
        }

        return {
          label: this.requireString(record.label, `native_versions[${index}].label`),
          sentences,
        };
      });
    }

    if (nativeVersions.length === 0 && legacyNativeVersion) {
      const sentences = Array.isArray(legacyNativeVersion)
        ? legacyNativeVersion.map((sentence, index) => this.requireString(sentence, `native_version[${index}]`))
        : this.splitNativeVersion(String(legacyNativeVersion));

      if (sentences.length > 0) {
        nativeVersions = [{
          label: "Native",
          sentences,
        }];
      }
    }

    if (nativeVersions.length === 0) {
      throw new Error("Model failed to generate required native_versions");
    }

    return nativeVersions;
  }

  protected splitNativeVersion(nativeVersion: string): string[] {
    return nativeVersion
      .split(/\r?\n+/)
      .flatMap((line) => line.split(/(?<=[。！？!?])\s*/))
      .map((line) => line.replace(/^[\-*・●\d.)\s]+/, "").trim())
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  protected normalizeDiagnosisResult(raw: Record<string, unknown>): DiagnosisResult {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid diagnosis result structure returned by model");
    }

    const grammar = this.normalizeGrammarIssues(raw.grammar);
    const register = this.normalizeRegisterIssues(raw.register);
    const pragmatics = this.normalizePragmaticsIssues(raw.pragmatics);
    const nativeVersions = this.normalizeNativeVersions(raw.native_versions, raw.native_version);
    const firstSentences = nativeVersions[0]?.sentences || [];

    return {
      grammar,
      register,
      pragmatics,
      summary: this.requireString(raw.summary, "summary"),
      native_versions: nativeVersions,
      native_version: firstSentences,
    };
  }
}
