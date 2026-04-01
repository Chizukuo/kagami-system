"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import DiagnosisResult from "@/components/DiagnosisResult";
import { DiagnosisResult as ResultType } from "@/lib/types";

// Flat icon for alerts
const IconAlertCircle = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default function ClientPage() {
  const [result, setResult] = useState<ResultType | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefillText, setPrefillText] = useState("");
  const [prefillScene, setPrefillScene] = useState("");

  async function handleSubmit(text: string, scene: string) {
    setIsDiagnosing(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, scene }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API error");
      }

      const data: ResultType = await res.json();
      data._inputText = text;
      data._inputScene = scene;
      setResult(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("诊断超时，请重试。");
      } else {
        setError("诊断失败，请稍后重试。");
      }
    } finally {
      clearTimeout(timeout);
      setIsDiagnosing(false);
    }
  }

  return (
    <>
    <div className="min-h-screen flex flex-col relative overflow-hidden">
    <div className="pointer-events-none absolute -top-24 -right-20 w-90 h-90 rounded-full bg-[radial-gradient(circle,var(--kg-blue-bg)_0%,transparent_72%)] opacity-70" />
    <div className="pointer-events-none absolute -bottom-32 -left-24 w-105 h-105 rounded-full bg-[radial-gradient(circle,var(--kg-layer3-bg)_0%,transparent_72%)] opacity-60" />
    <main className="max-w-2xl mx-auto w-full px-4 py-12 flex-1">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-display text-kg-text mb-2 tracking-tight flex items-baseline justify-center gap-3">
          <span className="font-display-jp font-light">鏡</span>
          <span className="italic font-light">Kagami</span>
        </h1>
        <p className="text-kg-text-3 text-footnote tracking-widest uppercase font-mono mt-2">Japanese Naturalness Diagnostic</p>
        <p className="text-kg-text-3 text-subhead font-display-jp mt-1" style={{ fontWeight: 300 }}>
          日本語の自然さを映す鏡
        </p>
      </div>

      <InputForm
        onSubmit={handleSubmit}
        isLoading={isDiagnosing}
        externalText={prefillText}
        externalScene={prefillScene}
      />

      {error && (
        <div className="mt-6 p-5 rounded-xl bg-kg-layer1-bg border border-kg-layer1-sep flex items-start gap-3 shadow-sm" aria-live="assertive">
          <IconAlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-kg-layer1" />
          <div className="flex flex-col gap-2">
            <p className="text-kg-layer1-text text-subhead font-sans-zh font-medium leading-relaxed">
              {error}
            </p>
            <button 
              type="button"
              onClick={() => setError(null)}
              className="text-footnote text-kg-blue hover:text-kg-blue-hover font-medium font-sans-zh transition-colors self-start cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {!result && !isDiagnosing && !error && (
        <div className="mt-20 text-center flex flex-col items-center gap-6">
          <div className="text-8xl font-display-jp opacity-[0.06] select-none leading-none" style={{ fontWeight: 300 }}>鏡</div>
          <div className="flex flex-col gap-3 max-w-sm">
            <p className="text-kg-text-2 text-callout font-sans-zh font-medium">
              输入日语文本，获取自然度诊断
            </p>
            <p className="text-kg-text-3 text-footnote font-sans-zh leading-relaxed">
              语法 · 语体 · 语用 三层诊断
            </p>
          </div>
          <div className="w-8 h-px bg-kg-sep"></div>
          <button
            type="button"
            onClick={() => {
              setPrefillText("先生、昨日の授業ですが、ちょっとわからないところがあって、聞きたいんですけど。");
              setPrefillScene("大学教授へのメール");
            }}
            className="px-4 py-2 rounded-lg border border-kg-sep text-footnote text-kg-blue hover:text-kg-blue-hover hover:border-kg-blue/40 hover:bg-kg-blue-bg font-medium font-sans-zh transition-all interaction-press cursor-pointer"
          >
            加载示例并体验诊断
          </button>
        </div>
      )}

      {result && (
        <div className="mt-12 relative" key={result.summary} style={{ animation: "fadeInUp 0.5s ease-out" }}>
          <div
            className={`absolute z-10 inset-0 pointer-events-none transition-opacity duration-300 ease-in-out bg-kg-bg/85 flex items-center justify-center ${
              isDiagnosing ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-5 h-5 border-2 border-kg-sep border-t-kg-blue rounded-full animate-spin"></div>
              <span className="text-caption font-mono text-kg-text-3 tracking-wider uppercase">分析中</span>
            </div>
          </div>
          <DiagnosisResult result={result} />
        </div>
      )}
    </main>
    <footer className="border-t border-kg-sep-2 py-8 mt-20">
      <div className="max-w-2xl mx-auto px-4 flex flex-col items-center gap-2">
        <p className="text-caption text-kg-text-4 font-mono tracking-wider">
          鏡 Kagami — Japanese Naturalness Diagnostic
        </p>
        <p className="text-mono-label text-kg-text-4 font-mono">
          Powered by Gemini · Built for NAIST NLP Lab
        </p>
      </div>
    </footer>
    </div>
  </>
  );
}
