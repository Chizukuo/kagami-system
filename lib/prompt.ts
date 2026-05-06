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

  const issueFormatRule = lang === "zh"
    ? `ISSUE FORMAT (required for every issue):
Write "issue" as one compact diagnostic note with all four parts:
问题类型：<具体问题标签>; 严重度：<高/中/低>; 证据：<点名触发词或缺失信息>; 修改原则：<可执行改写策略>
Good example:
问题类型：口语缓冲语过强; 严重度：中; 证据：「～んですけど」在教授邮件中语气偏随意; 修改原则：改用正式请求句式，并显式标明提问目的。`
    : `ISSUE FORMAT (required for every issue):
Write "issue" as one compact diagnostic note with all four parts:
問題タイプ：<具体ラベル>; 重大度：<高/中/低>; 根拠：<トリガー語または不足情報>; 修正方針：<実行可能な書き換え方針>
Good example:
問題タイプ：口語的クッション表現の過多; 重大度：中; 根拠：「～んですけど」は教授宛メールでは砕けすぎる; 修正方針：丁寧な依頼文型に置き換え、質問意図を明示する。`;

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

SPAN RULE (important):
- "original" must point to the minimal problematic span (phrase/chunk),
  not an entire paragraph.
- If one sentence contains two independent root causes, split into two
  issue objects.
- Do not merge unrelated problems into one issue.
- If the issue is omission-based (missing addressee, course name, request
  goal, scope, etc.), "original" must be the shortest existing anchor span
  where the missing information should attach.
- For omission-based issues, never fabricate the missing text itself as
  "original".

${issueFormatRule}

Diagnose the input across three layers:

LAYER 1 — Grammar (语法)
Rule-based errors: particles, verb conjugation, sentence structure.
These have clear right/wrong answers.

LAYER 2 — Register (语体)
Whether the expression matches the user's described scene.
Includes keigo appropriateness, written/spoken style mixing.
Judged relative to the given scene — no absolute right/wrong.
Every issue must include an alternatives array.
The "suggestion" field must be the single best rewrite for the user's
current scene.
For each register issue, explicitly identify:
- Trigger expression(s) causing mismatch
- Target politeness/style expected in this scene
- Revision principle (what to change and why)

LAYER 3 — Pragmatics (语用)
Grammatically correct and register-appropriate, but unnatural
to native speakers. Expression habits, information structure,
conversational expectations.
For each pragmatics issue, explicitly identify:
- What concrete information is missing or too vague
- Why a native reader cannot act on the current wording smoothly
- A specific repair direction (e.g., add scope, referent, or request goal)

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

Every register/pragmatics issue must include 2–3 alternatives.
The first alternative must be the best fit for the user's current scene.
Any remaining alternatives may vary by formality or usage context.
Alternatives must be meaning-preserving. Avoid near-duplicate rewrites.

ADDITIONAL RULES:
- If a layer has no issues, return an empty array []
- native_versions must be an array of objects containing a "label" (e.g., "Native", "Casual", "Formal") and a "sentences" array preserving natural sentence boundaries.
- The first item in native_versions should have the label "Native".
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
    native_versions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          label: { type: 'STRING' },
          sentences: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['label', 'sentences'],
      },
    },
    summary:        { type: 'STRING' },
  },
  required: ['grammar', 'register', 'pragmatics', 'native_versions', 'summary'],
};
