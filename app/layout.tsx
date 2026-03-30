import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "鏡 Kagami",
  description: "日語自然度診断システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Instrument+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+JP:wght@300;400;500&family=BIZ+UDPGothic:wght@400;700&family=Noto+Serif+SC:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-kg-bg text-kg-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
