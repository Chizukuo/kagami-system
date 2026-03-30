import { Schema, SchemaType } from "@google/generative-ai";

// Language pair — hardcoded for MVP, parameterized for future extension
const L1 = "Chinese";
const L2 = "Japanese";

export const SYSTEM_PROMPT = `
You are a diagnostic system that helps ${L1} native speakers improve
the naturalness of their ${L2} output.

The user provides:
1. A piece of ${L2} text
2. A usage context or scene description

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
Every issue must include 2–3 entries in the alternatives array,
showing natural options across different contexts.

LANGUAGE RULES (strict):
- Fields issue, suggestion, context, summary → write in Chinese
- Fields original, correction, expression, native_version → write in Japanese
- If a layer has no issues, return an empty array []
`.trim();

export const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    grammar: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          original:   { type: SchemaType.STRING },
          issue:      { type: SchemaType.STRING },
          correction: { type: SchemaType.STRING },
        },
        required: ["original", "issue", "correction"],
      },
    },
    register: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          original:   { type: SchemaType.STRING },
          issue:      { type: SchemaType.STRING },
          suggestion: { type: SchemaType.STRING },
          alternatives: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                expression: { type: SchemaType.STRING },
                context:    { type: SchemaType.STRING },
              },
              required: ["expression", "context"],
            },
          },
        },
        required: ["original", "issue", "suggestion", "alternatives"],
      },
    },
    pragmatics: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          original: { type: SchemaType.STRING },
          issue:    { type: SchemaType.STRING },
          alternatives: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                expression: { type: SchemaType.STRING },
                context:    { type: SchemaType.STRING },
              },
              required: ["expression", "context"],
            },
          },
        },
        required: ["original", "issue", "alternatives"],
      },
    },
    native_version: { type: SchemaType.STRING },
    summary:        { type: SchemaType.STRING },
  },
  required: ["grammar", "register", "pragmatics", "native_version", "summary"],
};
