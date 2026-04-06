# <img src="public/kagami-logo.svg" width="40" height="40" alt="Kagami Logo" style="vertical-align: middle;"> Kagami (鏡) - Japanese Naturalness Diagnostic System

[English](README.md) | [简体中文](README.zh.md) | [日本語](README.ja.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js_16-black?logo=next.js)](https://nextjs.org/)
[![LLM: Gemini 3.1 Flash](https://img.shields.io/badge/AI-Gemini_3.1_Flash-orange?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Styling: Tailwind CSS 4](https://img.shields.io/badge/Styling-Tailwind_CSS_4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **Live Demo**: [https://kagami.chizunet.cc](https://kagami.chizunet.cc)

| Kagami UI Preview | Analysis Details |
| :---: | :---: |
| ![Kagami UI Preview](public/screenshot.png) | ![Analysis Details](public/screenshot1.png) |

Kagami is an LLM-powered research prototype designed to diagnose and improve the naturalness of Japanese output for Chinese native speakers. 

Moving beyond traditional Grammatical Error Correction (GEC), Kagami introduces a **Three-Layer Diagnostic Framework** to address the nuances of sociolinguistics and pragmatic competence in second language acquisition.

## 🔬 Academic Motivation

Chinese learners of Japanese frequently produce sentences that are grammatically flawless yet pragmatically unnatural to native speakers. While traditional Grammatical Error Correction (GEC) tools effectively address rule-based errors, they remain blind to the subtler dimensions of Register appropriateness and Pragmatic naturalness - the very dimensions that define true communicative competence.

A core challenge in Second Language Acquisition (SLA) research is measuring **metapragmatic awareness**: learners' ability to recognize and reason about pragmatic norms they may not yet produce consistently. Traditional assessment relies on Discourse Completion Tasks (DCTs) or think-aloud protocols, which are resource-intensive and difficult to scale.

Kagami explores an alternative approach: using **LLM-generated layered diagnostics as a pragmatic stimulus**, then observing **how learners respond to each diagnostic layer** - Grammar, Register, and Pragmatics - as a scalable proxy for metapragmatic awareness. The hypothesis draws on Pienemann's *Teachability Hypothesis*: if pragmatic knowledge is acquired later and is cognitively more demanding, learners should systematically accept Grammar corrections more readily than Pragmatics corrections, producing a measurable **acceptance gradient** across the three layers.

## 🧠 The Three-Layer Framework

Users input their Japanese text along with the specific **social context** (e.g., "Emailing a professor", "Chatting with a close friend"). Kagami analyzes the input across three distinct dimensions:

1. **Layer 1: Grammar (语法)**
   - Checks for rule-based errors (e.g., incorrect particles, verb conjugations).
   - *Nature*: Absolute right/wrong.
2. **Layer 2: Register (语体)**
   - Evaluates whether the politeness level and style match the user-defined context (e.g., Keigo misuse, mixing spoken/written styles).
   - *Nature*: Context-dependent appropriateness.
3. **Layer 3: Pragmatics (语用)**
   - Identifies expressions that are grammatically correct and situationally appropriate, but unnatural to a native speaker. Provides alternative native-like phrasing based on the context.
   - *Nature*: Native fluency and information structure.
   - Prompt reasoning flow (Step A-D):
     - Step A: Ignore learner wording and draft what a native speaker would likely say in the given scene.
     - Step B: Compare the native draft against the learner sentence.
     - Step C: Identify mismatches in collocation, information order, expression habits, and pragmatic expectations.
     - Step D: Report only Step C differences as pragmatics issues.

## 🎯 Research Objective

This project investigates a single focused research question:

> **Do L2 learners' acceptance rates of LLM-generated diagnostics differ systematically across Grammar, Register, and Pragmatics layers - and does this gradient align with the predicted Teachability Hierarchy?**

Specifically, Kagami collects two granularities of anonymous learner feedback:

1. **Macro-level**: A 3-point holistic rating of the overall diagnosis (helpful / partially helpful / not helpful).
2. **Micro-level**: Per-issue binary votes (agree / disagree) tagged by layer (Grammar / Register / Pragmatics).

The micro-level data enables per-layer acceptance-rate analysis. A declining acceptance rate from Grammar -> Register -> Pragmatics would constitute evidence that learners' metapragmatic awareness lags behind grammatical knowledge, consistent with the Teachability Hierarchy.

> [!IMPORTANT]
> **Learner feedback is not ground truth.** Agree/disagree votes reflect diagnostic acceptance (learner cognition), not diagnostic accuracy (linguistic truth). Future work will introduce a native-speaker gold annotation set to enable three-way triangulation: LLM-vs-Gold, Learner-vs-Gold, and Learner-vs-LLM.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Design System**: Apple HIG-inspired minimalistic aesthetic (Custom Design Tokens)
- **AI Integration**: Google Generative AI SDK (Gemini 3.1 Flash) with strict JSON Schema generation constraints.
- **Data Collection**: Cloudflare KV (for anonymized human evaluation data)

## 📊 Human Evaluation Mechanism

To support ongoing SLA/NLP research, Kagami collects anonymous feedback at two granularities: a holistic 3-point post-diagnosis evaluation and issue-level agree/disagree votes tagged by layer (Grammar/Register/Pragmatics). This layered signal enables per-layer acceptance-rate analysis and helps model learner diagnostic acceptance along the grammar-register-pragmatics continuum as a proxy for metapragmatic awareness, rather than treating learner feedback as ground-truth AI accuracy; future work will add a small native-speaker gold annotation set for three-way triangulation (LLM-vs-Gold, Learner-vs-Gold, Learner-vs-LLM).

## 👨‍💻 About the Developer

Developed by **Chizukuo** as an independent research project and a preliminary study for graduate applications (Targeting NAIST).

## 📄 License

This project is licensed under the [MIT License](LICENSE).
