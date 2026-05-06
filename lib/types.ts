export type UILanguage = "zh" | "ja";
export type IssueLayer = "grammar" | "register" | "pragmatics";
export type IssueVote = "agree" | "disagree";
export type ProficiencyLevel = "N5" | "N4" | "N3" | "N2" | "N1" | "N1_PLUS" | "NATIVE" | "UNKNOWN";
export type Rating = "accurate" | "partial" | "inaccurate";

export const VALID_PROFICIENCY_LEVELS: ProficiencyLevel[] = ["N5", "N4", "N3", "N2", "N1", "N1_PLUS", "NATIVE", "UNKNOWN"];
export const PROFICIENCY_STORAGE_KEY = "kagami.proficiencyLevel";

/** A single alternative expression with contextual explanation. */
export interface Alternative {
  expression: string; // Japanese
  context: string;    // UI language (zh or ja)
}

export interface GrammarIssue {
  original: string;    // Japanese
  issue: string;       // UI language (zh or ja)
  correction: string;  // Japanese
}

export interface RegisterIssue {
  original: string;    // Japanese
  issue: string;       // UI language (zh or ja)
  suggestion: string;  // Japanese
  alternatives: Alternative[];
}

export interface PragmaticsIssue {
  original: string;    // Japanese
  issue: string;       // UI language (zh or ja)
  alternatives: Alternative[];
}

export interface NativeVersion {
  label: string;
  sentences: string[];
}

export interface DiagnosisResult {
  grammar: GrammarIssue[];
  register: RegisterIssue[];
  pragmatics: PragmaticsIssue[];
  native_versions: NativeVersion[];
  native_version: string[]; // Legacy — kept for backward compat
  summary: string;
  // Client-side only — injected after API response, not from LLM.
  _inputText?: string;
  _inputScene?: string;
  _resId?: string;
  _modelId?: string;
  _sig?: string;
}

export interface DiagnoseRequest {
  text: string;
  scene: string;
  lang?: UILanguage;
  model?: string;
}

export interface IssueFeedbackPayload {
  resId: string;
  _sig?: string;
  layer: IssueLayer;
  index: number;
  vote: IssueVote;
  proficiencyLevel?: ProficiencyLevel;
  issueHash?: string;
  issueOriginal?: string;
  issueText?: string;
  issueTextLength?: number;
  modelId?: string;
  sessionId?: string;
  timestamp: string;
  lang?: UILanguage;
}

export function getStoredProficiencyLevel(): ProficiencyLevel | undefined {
  if (typeof window === "undefined") return undefined;
  const val = localStorage.getItem(PROFICIENCY_STORAGE_KEY);
  if (val && VALID_PROFICIENCY_LEVELS.includes(val as ProficiencyLevel)) {
    return val as ProficiencyLevel;
  }
  return undefined;
}
