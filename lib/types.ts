export interface Alternative {
  expression: string; // Japanese
  context: string;    // Chinese
}

export interface GrammarIssue {
  original: string;    // Japanese
  issue: string;       // Chinese
  correction: string;  // Japanese
}

export interface RegisterIssue {
  original: string;    // Japanese
  issue: string;       // Chinese
  suggestion: string;  // Chinese
  alternatives: Alternative[];
}

export interface PragmaticsIssue {
  original: string;    // Japanese
  issue: string;       // Chinese
  alternatives: Alternative[];
}

export interface DiagnosisResult {
  grammar: GrammarIssue[];
  register: RegisterIssue[];
  pragmatics: PragmaticsIssue[];
  native_version: string; // Japanese
  summary: string;        // Chinese
}

export interface DiagnoseRequest {
  text: string;
  scene: string;
}
