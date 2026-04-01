import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "鏡 Kagami",
  description: "日語自然度診断システム",
  icons: {
    icon: "/kagami-logo.svg",
    shortcut: "/kagami-logo.svg",
    apple: "/kagami-logo.svg",
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
