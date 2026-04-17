export type UILanguage = "zh" | "ja";
export type IssueLayer = "grammar" | "register" | "pragmatics";
export type IssueVote = "agree" | "disagree";
export type ProficiencyLevel = "N5" | "N4" | "N3" | "N2" | "N1" | "N1_PLUS" | "UNKNOWN";
export type Rating = "accurate" | "partial" | "inaccurate";

export const VALID_PROFICIENCY_LEVELS: ProficiencyLevel[] = ["N5", "N4", "N3", "N2", "N1", "N1_PLUS", "UNKNOWN"];

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
  native_version: string[]; // Japanese sentences
  summary: string;        // UI language (Chinese or Japanese)
  // Client-side only -- not from API
  _inputText?: string;
  _inputScene?: string;
  _resId?: string;
  _modelId?: string;
}

export interface DiagnoseRequest {
  text: string;
  scene: string;
  lang?: UILanguage;
  model?: string;
}

export interface IssueFeedbackPayload {
  resId: string;
  layer: IssueLayer;
  index: number;
  vote: IssueVote;
  proficiencyLevel?: ProficiencyLevel;
  issueHash?: string;
  issueOriginal?: string;
  issueText?: string;
  modelId?: string;
  sessionId?: string;
  timestamp: string;
  lang?: UILanguage;
}
