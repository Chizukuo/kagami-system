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

中文母语者在学习日语时，经常会写出语法正确却语用不自然的句子。传统语法纠错（GEC）工具擅长处理规则性错误，却难以覆盖语体得体性与语用自然度，而这两者正是交际能力的关键。

在二语习得研究中，一个核心难点是如何规模化测量**元语用意识（metapragmatic awareness）**：学习者是否能识别并解释自己尚未稳定产出的语用规范。传统方法（如 DCT 或有声思维）成本高、难扩展。

Kagami 的思路是：把 **LLM 分层诊断作为语用刺激物**，观察学习者对 Grammar / Register / Pragmatics 三层诊断的反馈差异，并将其作为元语用意识的可扩展代理指标。该假设受 Pienemann 可教性假说启发：若语用知识获得更晚且认知负担更高，学习者应更容易接受语法层诊断，而非语用层诊断，从而形成可测量的**接受率梯度**。

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
   - Prompt 推理流程（Step A-D）：
     - Step A：暂时忽略学习者原句，仅根据场景起草母语者表达。
     - Step B：将母语者草稿与学习者原句逐项对比。
     - Step C：识别搭配、信息顺序、表达习惯与语用期待差异。
     - Step D：仅将 Step C 中的差异输出为语用问题。

## 🎯 研究目标

本项目聚焦一个核心问题：

> **L2 学习者对 LLM 生成诊断的接受率，是否会在 Grammar / Register / Pragmatics 三层上呈现系统性差异，并与可教性层级预测一致？**

Kagami 收集两种粒度的匿名反馈：

1. **宏观层（Macro-level）**：对整次诊断给出三档主观有用性评价（有帮助 / 部分有帮助 / 帮助不大）。
2. **微观层（Micro-level）**：对每条诊断问题进行同意/不同意投票，并带有层级标签（Grammar / Register / Pragmatics）。

微观数据可直接用于分层接受率分析。若接受率随 Grammar -> Register -> Pragmatics 逐层下降，可视为学习者元语用意识滞后于语法知识的证据，并与可教性层级相一致。

> [!IMPORTANT]
> **学习者反馈不等于真值标注。** 同意/不同意反映的是诊断接受（学习者认知），而非诊断准确性（语言学真值）。后续将引入母语者 gold annotation，开展 LLM-vs-Gold、Learner-vs-Gold、Learner-vs-LLM 三角验证。

## 🛠 技术栈

- **前端**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **设计系统**: 受 Apple HIG 启发的极简主义美学（自定义设计令牌）
- **AI 集成**: Google Generative AI SDK (Gemini 3.1 Flash)，采用严格的 JSON Schema 生成约束。
- **数据收集**: Cloudflare KV (用于捕获匿名化的用户评估数据)

## 📊 人工评估机制

为支持持续的二语习得与 NLP 研究，Kagami 以匿名方式收集两种粒度的反馈：诊断后的整体三档评价，以及按“语法/语体/语用”分层的单条问题同意/不同意反馈；这种分层数据可用于计算各层接受率，并刻画学习者在语法—语体—语用连续体上的诊断接受模式（可作为元语用意识的代理指标），而非将学习者反馈视为 AI 准确率的真值标注；未来将引入小规模母语者金标准标注集，开展 LLM-vs-Gold、Learner-vs-Gold、Learner-vs-LLM 的三方三角验证。

## 👨‍💻 关于开发者

由 **Chizukuo** 开发的独立研究项目。本项目也是申请研究生院的前期准备研究。

## 📄 许可

本项目采用 [MIT 许可证](LICENSE)。
