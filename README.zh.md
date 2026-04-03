# <img src="public/kagami-logo.svg" width="40" height="40" alt="Kagami Logo" style="vertical-align: middle;"> Kagami (鏡) - 日语自然度诊断系统

[English](README.md) | [简体中文](README.zh.md) | [日本語](README.ja.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js_16-black?logo=next.js)](https://nextjs.org/)
[![LLM: Gemini 3.1 Flash](https://img.shields.io/badge/AI-Gemini_3.1_Flash-orange?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Styling: Tailwind CSS 4](https://img.shields.io/badge/Styling-Tailwind_CSS_4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **在线演示**: [https://kagami.chizunet.cc](https://kagami.chizunet.cc)

| UI预览 | 分析详情 |
| :---: | :---: |
| ![Kagami UI Preview](public/screenshot.png) | ![分析详情](public/screenshot1.png) |

Kagami 是一款基于大语言模型（LLM）的科研原型系统，旨在为母语为中文的日语学习者诊断并提升其日语表达的自然度。

Kagami 突破了传统的语法纠错（GEC）范畴，引入了 **“三层诊断框架”**，以解决二语习得中存在的社会语言学与语用能力层面的细微差异。

## 🔬 学术背景

中文母语者在学习日语时常面临一种独特挑战：构建的句子在语法上完美无缺，但在特定语境下，对母语者而言却显得生硬或不自然。现有工具多侧重于僵化的语法规则，而忽略了社交语境（语体）与母语表达习惯（语用）。

Kagami 作为一个 **初步研究平台**，旨在探讨：
1. 大语言模型是否能有效区分并诊断“语法”、“语体”与“语用”三个维度的错误。
2. 模型生成的语用建议与日本母语者的直觉之间的对齐程度（Human-AI Alignment）。

## 🧠 三层诊断框架

用户输入日语文本，并指定特定的 **社交语境**（如“给教授写邮件”、“与好友聊天”）。Kagami 从以下三个维度进行分析：

1. **第一层：语法 (Grammar)**
   - 检查基于规则的错误（如助词误用、动词活用错误等）。
   - *性质*：非黑即白的对错判断。
2. **第二层：语体 (Register)**
   - 评估郑重程度与风格是否匹配用户定义的语境（如敬语误用、书面语与口语混杂等）。
   - *性质*：基于语境的得体性判断。
3. **第三层：语用 (Pragmatics)**
   - 识别语法正确且语境得体，但对母语者而言不自然的表达。根据语境提供更地道的表达方案。
   - *性质*：母语流畅度与信息结构判断。

## 🛠 技术栈

- **前端**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **设计系统**: 受 Apple HIG 启发的极简主义美学（自定义设计令牌）
- **AI 集成**: Google Generative AI SDK (Gemini 3.1 Flash)，采用严格的 JSON Schema 生成约束。
- **数据收集**: Cloudflare KV (用于捕获匿名化的用户评估数据)

## 📊 人工评估机制

为了支持持续的自然语言处理（NLP）研究，Kagami 内置了一个低摩擦、后台自动提交的评估组件。
当用户收到诊断结果时，系统会引导用户评估 AI 建议的自然度与准确性。这些匿名收集的数据将用于未来研究中计算 Human-AI 一致性的 Cohen's Kappa 系数。

## 👨‍💻 关于开发者

由 **Chizukuo** 开发的独立研究项目。本项目也是申请研究生院的前期准备研究。

## 📄 许可

本项目采用 [MIT 许可证](LICENSE)。
