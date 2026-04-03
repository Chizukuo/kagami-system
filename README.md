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

Chinese learners of Japanese often face a unique challenge: constructing sentences that are grammatically flawless but contextually awkward or unnatural to native speakers. Existing tools focus heavily on rigid grammar rules, ignoring the social context (Register) and native expression habits (Pragmatics). 

Kagami serves as a **pilot research platform** to investigate:
1. Whether LLMs can effectively separate and diagnose errors across Grammar, Register, and Pragmatics.
2. The alignment between LLM-generated pragmatic corrections and human native-speaker intuition (Human-AI Alignment).

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

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Design System**: Apple HIG-inspired minimalistic aesthetic (Custom Design Tokens)
- **AI Integration**: Google Generative AI SDK (Gemini 3.1 Flash) with strict JSON Schema generation constraints.
- **Data Collection**: Cloudflare KV (for anonymized human evaluation data)

## 📊 Human Evaluation Mechanism

To support ongoing NLP research, Kagami includes a frictionless, silent-submission evaluation widget. 
When users receive their diagnostic results, they are prompted to evaluate the naturalness and accuracy of the AI's suggestions. This data is collected anonymously and will be used to calculate Cohen's Kappa for human-LLM consistency in future studies.

## 👨‍💻 About the Developer

Developed by **Chizukuo** as an independent research project and a preliminary study for graduate applications (Targeting NAIST).

## 📄 License

This project is licensed under the [MIT License](LICENSE).
