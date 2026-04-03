"use client";

import { DiagnosisResult as ResultType, UILanguage } from "@/lib/types";
import LayerSection from "./LayerSection";
import NativeVersion from "./NativeVersion";
import EvaluationWidget from "./EvaluationWidget";

interface Props {
  result: ResultType;
  lang: UILanguage;
}

export default function DiagnosisResult({ result, lang }: Props) {
  const totalIssues = result.grammar.length + result.register.length + result.pragmatics.length;
  
  const severity = totalIssues === 0 
    ? { label: "非常自然", sublabel: "Excellent", color: "text-kg-success", bg: "bg-kg-success-bg", border: "border-kg-success/20" }
    : totalIssues <= 2 
    ? { label: "基本自然", sublabel: "Good", color: "text-kg-blue", bg: "bg-kg-blue-bg", border: "border-kg-blue/20" }
    : totalIssues <= 4
    ? { label: "需要改善", sublabel: "Needs Work", color: "text-[var(--kg-layer2)]", bg: "bg-[var(--kg-layer2-bg)]", border: "border-[var(--kg-layer2)]/20" }
    : { label: "不够自然", sublabel: "Review Carefully", color: "text-[var(--kg-layer1)]", bg: "bg-[var(--kg-layer1-bg)]", border: "border-[var(--kg-layer1)]/20" };

  return (
    <div className="w-full flex flex-col pt-4">
      {/* Summary */}
      <div className={`mb-6 p-6 ${severity.bg} border ${severity.border} rounded-xl`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-caption uppercase tracking-widest font-bold text-(--kg-blue-text) font-mono">Summary</h3>
          <div className="flex items-center gap-2">
            <span className={`text-footnote font-sans-zh font-bold ${severity.color}`}>{severity.label}</span>
            <span className="text-mono-label font-mono text-kg-text-3 uppercase">{severity.sublabel}</span>
          </div>
        </div>
        <p className="text-subhead text-(--kg-blue-text) leading-[1.8] font-sans-zh font-medium">
          {result.summary}
        </p>
        <div className="mt-3 flex gap-4 text-mono-label font-mono text-kg-text-3 uppercase tracking-wider">
          <span>语法 {result.grammar.length}</span>
          <span>语体 {result.register.length}</span>
          <span>语用 {result.pragmatics.length}</span>
        </div>
      </div>

      {/* Native Output elevated to the top! */}
      <NativeVersion nativeVersion={result.native_version} lang={lang} />

      {/* Evaluation Widget - Lightweight footer */}
      <EvaluationWidget
        inputText={result._inputText ?? ""}
        inputScene={result._inputScene ?? ""}
        grammarCount={result.grammar.length}
        registerCount={result.register.length}
        pragmaticsCount={result.pragmatics.length}
        nativeVersion={result.native_version}
        summary={result.summary}
        lang={lang}
      />

      {/* Details Section - Full prominence */}
      <div className="mt-8 flex flex-col gap-6">
        <h2 className="text-[17px] font-display-zh font-bold text-kg-text pb-3 border-b border-kg-sep text-center">
          诊断详情 Details
        </h2>

        {/* Layers */}
        <LayerSection
          title="Grammar 语法"
          layerType="grammar"
          items={result.grammar}
          emptyMessage="无语法错误"
          lang={lang}
        />

        <LayerSection
          title="Register 语体"
          layerType="register"
          items={result.register}
          emptyMessage="语体使用恰当"
          lang={lang}
        />

        <LayerSection
          title="Pragmatics 语用"
          layerType="pragmatics"
          items={result.pragmatics}
          emptyMessage="表达自然"
          lang={lang}
        />
      </div>
    </div>
  );
}
