import type { Metadata } from "next";
import "./globals.css";

const iconVersion = "20260508-3";

export const metadata: Metadata = {
  title: "Kagami 鏡 — 日语自然度诊断系统 | AI 驱动的语用分析工具",
  description: "专为中文学习者设计的日语诊断工具。从语法、语体、语用三层深度分析，提供地道日语修版建议。",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: `/favicon.ico?v=${iconVersion}`, sizes: "any" },
      { url: "/kagami-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: `/favicon.ico?v=${iconVersion}`,
    apple: [{ url: `/apple-touch-icon.png?v=${iconVersion}`, sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f4f7fb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Instrument+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+JP:wght@300;400;500&family=BIZ+UDPGothic:wght@400;700&family=Noto+Serif+SC:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-kg-bg text-kg-text min-h-dvh overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
