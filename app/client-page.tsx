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
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, scene }),
      });
      if (!res.ok) throw new Error("API error");
      const data: ResultType = await res.json();
      setResult(data);
    } catch {
      setError("診断に失敗しました。もう一度お試しください。");
    } finally {
      setIsDiagnosing(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display-jp font-bold mb-1 tracking-tight text-kg-text">鏡 Kagami</h1>
      <p className="text-kg-text-3 font-medium text-sm mb-8">日語自然度診断</p>

      <InputForm onSubmit={handleSubmit} isLoading={isDiagnosing} />

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-kg-layer1-bg border border-kg-layer1-sep text-kg-layer1-text text-sm font-sans-zh font-medium">
          {error}
        </div>
      )}

      {result && (
        <div className={isDiagnosing ? "mt-8 opacity-50 transition-opacity" : "mt-8 transition-opacity"}>
          <DiagnosisResult result={result} />
        </div>
      )}
    </main>
  );
}
