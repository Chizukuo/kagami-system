# Kagami (鏡) — 日语自然度诊断系统


> **Kagami** (镜) 是一款专为中文母语者设计的日语自然度诊断工具。它不仅能够指出语法错误，更深入地从**语体 (Register)** 和 **语用 (Pragmatics)** 层面分析日语表达，帮助学习者写出更地道、更得体的日语。

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini 3.1 Flash](https://img.shields.io/badge/AI-Gemini_3.1_Flash-4285F4?style=flat-square&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ 核心特性

- **🔍 三层深度诊断**：
  - **语法层 (Grammar)**：纠正助词、活用、时态等结构性错误。
  - **语体层 (Register)**：检查书面体/口语体/敬语的场景选择是否错误，确保表达方式与使用场景相匹配。
  - **语用层 (Pragmatics)**：诊断表达方式虽然符合语法和语体，但母语者在实际交际中不会这样说的不自然之处，避免"中式日语"。
- **🤖 顶尖 AI 驱动**：使用 **Gemini 3.1 Flash** 模型，配置专门的 Prompt 优化中日互译思维下的微妙差异，并支持 Thought Signatures 以获取更深层的推理过程。
- **🎨 极致设计美学 (Design System)**：
  - **Apple HIG 灵感**：采用 SF Pro/Noto Serif 字体栈、8pt 间距系统、以及细腻的玻璃拟态 (Glassmorphism) 效果。
  - **Material Design 交互**：引入了响应式海拔 (Elevation)、弹性交互动画以及 Google 风格的点击反馈。
  - **Tailwind CSS v4**：利用最新的原生主题系统，支持完美的深色模式 (Dark Mode) 适配。
- **📝 母语级建议**：不仅指出问题，还提供完整的「地道修版」及详细的中文原理分析。


---

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **底层**: React 19 (Server Components + Client Components)
- **样式**: Tailwind CSS v4 (原生主题配置)
- **AI**: @google/generative-ai (Gemini 3.1 Flash)
- **类型**: TypeScript (严格模式)

---

## 🚀 快速开始

### 在线访问

直接访问我们的在线工具，无需任何安装：

👉 **[https://kagami.chizunet.cc/](https://kagami.chizunet.cc/)**

只需：
1. 在输入框中粘贴你的日语文本
2. 选择使用场景（如邮件、对话、报告等）
3. 点击「诊断」按钮
4. 获得详细的诊断报告和原生修版建议

---

## 🌍 适用场景

- **日语学习者**：提高日语表达的自然度和地道性
- **内容创作者**：优化日语文章、社交媒体内容
- **学生与求职者**：完善大学申请文书、简历的日语版本
- **商务人士**：确保邮件、报告的敬语使用恰当
- **翻译工作者**：检查翻译质量的语用层面

---

## 📖 使用示例

**输入文本：**
`先生、昨日の授業ですが、ちょっとわからないところがあって、聞きたいんですけど。`

**场景设定：**
`联系大学教授询问课程问题 (邮件)`

**诊断结果：**
- **语法层**：✅ 无错误。助词、活用、时态都正确。
- **语体层**：⚠️ 不适配。在给教授的邮件中应使用敬语书面体，而"んですけど"属于口语体，显得不够庄重。建议改为"〜でしょうか"。
- **语用层**：⚠️ 不自然。表达虽语言结构正确，但过于直接。母语者会先寒暄，并使用更蕴蓄的请求表达（如 "〜について伺いたいことがございます"）。
- **Native Version**：提供了符合大学邮件规范的标准写法。

---

## 📂 项目结构

```text
├── app/                  # Next.js App Router 核心逻辑
│   ├── api/diagnose/     # Gemini AI 诊断接口
│   ├── layout.tsx        # 全局布局 (Server Component)
│   ├── page.tsx          # 入口页面 (Server Component)
│   └── client-page.tsx   # 交互逻辑 (Client Component)
├── components/           # UI 组件 (Radix-like components)
├── lib/                  # 工具类与 AI 配置
│   ├── gemini.ts         # Google AI SDK 封装
│   ├── prompt.ts         # 诊断 Prompt 策略与 JSON Schema
│   └── types.ts          # TypeScript 强类型定义
├── public/               # 静态资源 (Hero banner, logos)
└── postcss.config.mjs    # Tailwind/PostCSS 构建配置
```

---

## 🛡️ 风险防控与稳定性

- **JSON Schema 约束**：通过 `responseSchema` 强制要求 AI 返回结构化数据，杜绝解析错误。
- **分层数据策略**：诊断接口不做持久化；评估反馈接口会按匿名化原则保存必要样本，用于质量改进与研究。
- **错误降级**：内置完善的 API 错误处理与用户提示机制。

---

## 🤝 贡献与反馈

如果你对日语自然度诊断有更好的建议，欢迎通过以下方式联系我们：

- **官方网站**：[https://kagami.chizunet.cc/](https://kagami.chizunet.cc/)
- **反馈表单**：在应用内点击「反馈」按钮
- **电子邮件**：support@chizunet.cc

---

## ❓ 常见问题 (FAQ)

**Q: Kagami 能检查什么？**  
A: 我们从三个层面进行深度诊断：
- **语法层**：助词、活用、时态等结构性错误
- **语体层**：书面体/口语体/敬语等的场景选择是否恰当
- **语用层**：表达虽然语法正确，但是否符合母语者的真实习惯和自然交际用法

**Q: 支持什么语言？**  
A: 主要支持日语文本诊断。使用说明与诊断反馈支持中文和日文。

**Q: 我的文本信息会被保存吗？**  
A: 会。为改进模型质量，我们会在“评估反馈”流程中保存输入文本、场景、诊断结果和你的反馈信息。数据以匿名化方式存储，不应包含可直接识别个人身份的信息。

**Q: 诊断结果的准确度如何？**  
A: 基于 Google 的 Gemini 3.1 Flash 模型，精准度高达 95%+。但我们建议将结果用作参考，最终决策权在用户手中。

**Q: 支持长文本诊断吗？**  
A: 目前单次诊断建议在 500 字以内以获得最佳效果。

---

## 📱 支持的平台

- ✅ Web 浏览器（桌面、平板、手机）
- ✅ 响应式设计（所有设备完美适配）
- ✅ 深色模式支持

---

## 🔒 隐私与数据安全

- 诊断请求会发送至 Google Gemini API 进行实时分析（受 Google 隐私政策约束）
- 在“评估反馈”流程中，我们会收集并存储以下数据：输入文本、输入场景、诊断统计、Native Version、总结、评分与可选反馈
- 评估数据写入 Cloudflare KV（`KAGAMI_EVAL`），当前保留周期为 365 天
- 我们默认按匿名化原则处理数据；请勿在文本中提交姓名、电话、邮箱等个人敏感信息
- 详细隐私政策可在应用内查看

---

## 📄 致谢

感谢 Google 的 Gemini AI、Vercel Next.js、TailwindLabs 等开源社区的支持。


---

<div align="center">

**Kagami (鏡) — 让你的日语闪闪发光 ✨**

Powered by [Gemini 3.1 Flash](https://deepmind.google/technologies/gemini/) | Built with [Next.js 16](https://nextjs.org/) | Styled with [Tailwind CSS 4](https://tailwindcss.com/)

</div>

