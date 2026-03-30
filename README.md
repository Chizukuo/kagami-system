# Kagami (鏡) — 日语自然度诊断系统


> **Kagami** (镜) 是一款专为中文母语者设计的日语自然度诊断工具。它不仅能够指出语法错误，更深入地从**语体 (Register)** 和 **语用 (Pragmatics)** 层面分析日语表达，帮助学习者写出更地道、更得体的日语。

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini 1.5 Flash](https://img.shields.io/badge/AI-Gemini_3.1_Flash-4285F4?style=flat-square&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ 核心特性

- **🔍 三层深度诊断**：
  - **语法 (Grammar)**：纠正基础的拼写、助词、时态错误。
  - **语体 (Register)**：分析敬语 (Keigo) 使用是否符合场景（如：职场、学校、家庭）。
  - **语用 (Pragmatics)**：诊断表达是否符合日本人的习惯，避免“中式日语”。
- **🤖 顶尖 AI 驱动**：使用 **Gemini 3.1 Flash lite** 模型，配置专门的 Prompt 优化中日互译思维下的微妙差异，并支持 Thought Signatures 以获取更深层的推理过程。
- **🎨 极致设计美学 (Design System)**：
  - **Apple HIG 灵感**：采用 SF Pro/Noto Serif 字体栈、8pt 间距系统、以及细腻的玻璃拟态 (Glassmorphism) 效果。
  - **Material Design 交互**：引入了响应式海拔 (Elevation)、弹性交互动画以及 Google 风格的点击反馈。
  - **Tailwind CSS v4**：利用最新的原生主题系统，支持完美的深色模式 (Dark Mode) 适配。
- **📝 母语级建议**：不仅指出问题，还提供完整的「地道修版」及详细的中文原原理分析。


---

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **底层**: React 19 (Server Components + Client Components)
- **样式**: Tailwind CSS v4 (原生主题配置)
- **AI**: @google/generative-ai (Gemini 1.5 Flash)
- **类型**: TypeScript (严格模式)

---

## 🚀 快速开始

### 1. 克隆并安装依赖

```bash
git clone https://github.com/your-username/kagami-system.git
cd kagami-system
npm install
```

### 2. 环境配置

在根目录创建 `.env.local` 文件并填入你的 Gemini API Key：

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可开始诊断。

---

## 📖 使用示例

**输入文本：**
`先生、昨日の授業ですが、ちょっとわからないところがあって、聞きたいんですけど。`

**场景设定：**
`联系大学教授询问课程问题 (邮件)`

**诊断结果：**
- **语法**：✅ 无错误
- **语体**：⚠️ 过于随意。在给教授的邮件中，“んですけど” 显得不够庄重，建议使用 “〜でしょうか”。
- **语用**：⚠️ 过于直接。建议先进行寒暄，并使用更礼貌的请求表达（如 “〜について伺いたいことがございます”）。
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
└── tailwind.config.ts    # Tailwind CSS 配置 (v4 语法)
```

---

## 🛡️ 风险防控与稳定性

- **JSON Schema 约束**：通过 `responseSchema` 强制要求 AI 返回结构化数据，杜绝解析错误。
- **无状态设计**：应用层不保留敏感数据，确保隐私与性能。
- **错误降级**：内置完善的 API 错误处理与用户提示机制。

---

## 🤝 贡献与反馈

如果你对日语自然度诊断有更好的建议，欢迎提交 Issue 或 PR。

