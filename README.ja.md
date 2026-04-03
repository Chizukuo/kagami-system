# <img src="public/kagami-logo.svg" width="40" height="40" alt="Kagami Logo" style="vertical-align: middle;"> Kagami (鏡) - 日本語自然度診断システム

[English](README.md) | [简体中文](README.zh.md) | [日本語](README.ja.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js_16-black?logo=next.js)](https://nextjs.org/)
[![LLM: Gemini 3.1 Flash](https://img.shields.io/badge/AI-Gemini_3.1_Flash-orange?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Styling: Tailwind CSS 4](https://img.shields.io/badge/Styling-Tailwind_CSS_4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **ライブデモ**: [https://kagami.chizunet.cc](https://kagami.chizunet.cc)

| UIプレビュー | 分析の詳細 |
| :---: | :---: |
| ![Kagami UI Preview](public/screenshot.png) | ![分析の詳細](public/screenshot1.png) |

Kagami（鏡）は、中国語を母語とする日本語学習者のために、日本語出力の自然度を診断・改善することを目的とした、大規模言語モデル（LLM）駆動のプロトタイプシステムです。

従来の文法誤り訂正（GEC）の枠を超え、Kagamiは社会言語学や語用論的な観点を反映した **「三層診断フレームワーク」** を導入しています。

## 🔬 研究の背景

中国語を母語とする日本語学習者は、しばしば「文法的には完璧だが、ネイティブスピーカーにとっては不自然、あるいは文脈にそぐわない」文章を作成してしまうという課題に直面します。既存のツールの多くは厳格な文法規則に焦点を当てており、社会的文脈（レジスター）やネイティブ固有の表現習慣（語用論）を軽視しがちです。

Kagamiは **パイロット研究プラットフォーム** として、以下の調査を行います：
1. LLMが「文法」「レジスター」「語用」の各層における誤りを効果的に分離し、診断できるか。
2. LLMが生成する語用的修正案と、人間のネイティブスピーカーの直感との整合性（Human-AI Alignment）。

## 🧠 三層診断フレームワーク

ユーザーは日本語のテキストと、特定の **社会的文脈**（例：「教授へのメール」「親しい友人との会話」）を入力します。Kagamiは以下の3つの次元で入力を分析します：

1. **第1層：文法 (Grammar)**
   - 規則に基づく誤り（助詞の誤用、動詞の活用ミスなど）をチェックします。
   - *性質*: 絶対的な正誤。
2. **第2層：レジスター (Register)**
   - 丁寧さのレベルやスタイルが、ユーザーの定義した文脈に合致しているか（敬語の誤用、話し言葉と書き言葉の混同など）を評価します。
   - *性質*: 文脈に依存する妥当性。
3. **第3層：語用 (Pragmatics)**
   - 文法的に正しく文脈にも合っているが、ネイティブスピーカーにとっては不自然な表現を特定します。文脈に基づいて、より自然な表現案を提示します。
   - *性質*: ネイティブのような流暢さと情報構造。

## 🛠 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **デザインシステム**: Apple HIG（ヒューマンインターフェースガイドライン）に触発されたミニマリズムな美学（カスタムデザイントークン）
- **AI 統合**: Google Generative AI SDK (Gemini 3.1 Flash)。厳格な JSON Schema 制約による生成。
- **データ収集**: Cloudflare KV (匿名化された人間による評価データの収集)

## 📊 人間による評価メカニズム

言語処理研究をサポートするため、Kagamiには摩擦の少ないサイレント送信型評価ウィジェットが組み込まれています。
ユーザーが診断結果を受け取った際、AIの提案の自然度や正確さを評価するよう促されます。このデータは匿名で収集され、将来の研究において人間とLLMの一致度（Cohen's Kappa）を算出するために使用されます。

## 👨‍💻 開発者について

**Chizukuo** による個人研究プロジェクトです。本プロジェクトは、大学院進学（NAIST志望）に向けた予備研究として開発されました。

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下でライセンスされています。
