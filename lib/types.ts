export type UILanguage = "zh" | "ja";

export interface Alternative {
  expression: string; // Japanese
  context: string;    // UI language (Chinese or Japanese)
}

export interface GrammarIssue {
  original: string;    // Japanese
  issue: string;       // UI language (Chinese or Japanese)
  correction: string;  // Japanese
}

export interface RegisterIssue {
  original: string;    // Japanese
  issue: string;       // UI language (Chinese or Japanese)
  suggestion: string;  // Japanese
  alternatives: Alternative[];
}

export interface PragmaticsIssue {
  original: string;    // Japanese
  issue: string;       // UI language (Chinese or Japanese)
  alternatives: Alternative[];
}

export interface DiagnosisResult {
  grammar: GrammarIssue[];
  register: RegisterIssue[];
  pragmatics: PragmaticsIssue[];
  native_version: string; // Japanese
  summary: string;        // UI language (Chinese or Japanese)
  // Client-side only -- not from API
  _inputText?: string;
  _inputScene?: string;
}

export interface DiagnoseRequest {
  text: string;
  scene: string;
  lang?: UILanguage;
}
