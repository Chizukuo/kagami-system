"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import DiagnosisResult from "@/components/DiagnosisResult";
import { DiagnosisResult as ResultType } from "@/lib/types";

export default function ClientPage() {
  const [result, setResult] = useState<ResultType | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-display text-kg-text mb-2 tracking-tight flex items-baseline justify-center gap-3">
          <span className="font-display-jp font-light">鏡</span>
          <span className="italic font-light">Kagami</span>
        </h1>
        <p className="text-kg-text-3 text-[13px] tracking-widest uppercase font-mono mt-2">Japanese Naturalness Diagnostic</p>
      </div>

      <InputForm onSubmit={handleSubmit} isLoading={isDiagnosing} />

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-kg-layer1-bg border border-kg-layer1-sep text-kg-layer1-text text-sm font-sans-zh font-medium">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-12 relative">
          <div
            className={`absolute z-10 inset-0 pointer-events-none transition-opacity duration-300 ease-in-out bg-kg-bg/85 ${
              isDiagnosing ? "opacity-100" : "opacity-0"
            }`}
          ></div>
          <DiagnosisResult result={result} />
        </div>
      )}
    </main>
  );
}
