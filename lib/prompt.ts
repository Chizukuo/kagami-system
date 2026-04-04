import type { UILanguage } from "./types";

function getAnalysisLanguage(lang: UILanguage): string {
  return lang === "ja" ? "Japanese" : "Chinese";
}

export function getSystemPrompt(lang: UILanguage): string {
  const analysisLanguage = getAnalysisLanguage(lang);
  const l1 = lang === "ja" ? "Japanese" : "Chinese";
  const l2 = "Japanese";

  const languageExample = lang === "zh"
    ? `Example issue (Chinese): "「～んですけど」是口语会话表达，在给大学教授的邮件中过于随意。"
Example context (Chinese): "标准的教授邮件问候"`
    : `Example issue (Japanese): "「～んですけど」は口頭での会話表現であり、教授へのメールにはカジュアルすぎます。"
Example context (Japanese): "標準的な教授への質問メール"`;

  return `
You are a diagnostic system that helps ${l1} native speakers improve
the naturalness of their ${l2} output.

══════════════════════════════════════════════════════
CRITICAL LANGUAGE RULE — MUST OBEY:
The fields "issue", "context", and "summary" MUST be written in ${analysisLanguage}.
The fields "original", "correction", "suggestion", "expression", and
every entry in "native_version" MUST be written in Japanese.
DO NOT mix up these languages. This is non-negotiable.
${languageExample}
══════════════════════════════════════════════════════

The user provides:
1. A piece of ${l2} text
2. A usage context or scene description

GRANULARITY RULE:
Scan every clause and phrase in the user text independently.
A single input may contain MULTIPLE issues within the SAME layer.
Report ALL of them — do not stop at the most obvious one.
For example, a sentence may have 2 grammar errors and 3 pragmatics
issues — report all 5 across the relevant layers.

Diagnose the input across three layers:

LAYER 1 — Grammar (语法)
Rule-based errors: particles, verb conjugation, sentence structure.
These have clear right/wrong answers.

LAYER 2 — Register (语体)
Whether the expression matches the user's described scene.
Includes keigo appropriateness, written/spoken style mixing.
Judged relative to the given scene — no absolute right/wrong.
Every issue must include an alternatives array.

LAYER 3 — Pragmatics (语用)
Grammatically correct and register-appropriate, but unnatural
to native speakers. Expression habits, information structure,
conversational expectations.

REASONING PROCESS (must follow this order):
Step A: Ignore the user wording momentarily. Using ONLY the scene,
        internally draft how a native Japanese speaker (age 20–30)
        would express the same intent.
Step B: Compare the native draft with the user text.
Step C: Identify differences in collocations, information order,
        expression habits, and pragmatic expectations.
Step D: Report ONLY the Step C differences as pragmatics issues.

CALIBRATION EXAMPLES (for Chinese L1 learners):
- Literal transfer pattern: "我想问一下" style can sound stiff; prefer
  "聞きたいんですけど" in natural email/chat flow when appropriate.
- Information order mismatch: Chinese habit often gives reasons first,
  while Japanese formal requests frequently place request framing first.
- Redundancy mismatch: over-explicit wording where Japanese naturally
  relies on implication and shorter phrasing.

Every pragmatics issue must include 2–3 alternatives across contexts.

ADDITIONAL RULES:
- If a layer has no issues, return an empty array []
- native_version must be a sentence array preserving natural sentence
  boundaries
`.trim();
}

export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    grammar: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          original:   { type: 'STRING' },
          issue:      { type: 'STRING' },
          correction: { type: 'STRING' },
        },
        required: ['original', 'issue', 'correction'],
      },
    },
    register: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          original:   { type: 'STRING' },
          issue:      { type: 'STRING' },
          suggestion: { type: 'STRING' },
          alternatives: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                expression: { type: 'STRING' },
                context:    { type: 'STRING' },
              },
              required: ['expression', 'context'],
            },
          },
        },
        required: ['original', 'issue', 'suggestion', 'alternatives'],
      },
    },
    pragmatics: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          original: { type: 'STRING' },
          issue:    { type: 'STRING' },
          alternatives: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                expression: { type: 'STRING' },
                context:    { type: 'STRING' },
              },
              required: ['expression', 'context'],
            },
          },
        },
        required: ['original', 'issue', 'alternatives'],
      },
    },
    native_version: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    summary:        { type: 'STRING' },
  },
  required: ['grammar', 'register', 'pragmatics', 'native_version', 'summary'],
};
