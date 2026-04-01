"use client";

import { DiagnosisResult as ResultType } from "@/lib/types";
import LayerSection from "./LayerSection";
import NativeVersion from "./NativeVersion";

interface Props {
  result: ResultType;
}

export default function DiagnosisResult({ result }: Props) {
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
      <div className={`mb-4 p-6 ${severity.bg} border ${severity.border} rounded-xl`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] uppercase tracking-widest font-bold text-[var(--kg-blue-text)] font-mono">Summary</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-sans-zh font-bold ${severity.color}`}>{severity.label}</span>
            <span className="text-[11px] font-mono text-kg-text-3 uppercase">{severity.sublabel}</span>
          </div>
        </div>
        <p className="text-[15px] text-[var(--kg-blue-text)] leading-[1.8] font-sans-zh font-medium">
          {result.summary}
        </p>
        <div className="mt-3 flex gap-4 text-[11px] font-mono text-kg-text-3 uppercase tracking-wider">
          <span>语法 {result.grammar.length}</span>
          <span>语体 {result.register.length}</span>
          <span>语用 {result.pragmatics.length}</span>
        </div>
      </div>

      {/* Native Output elevated to the top! */}
      <NativeVersion nativeVersion={result.native_version} />

      <div className="mt-4 flex flex-col gap-6">
        <h2 className="text-[17px] font-display-zh font-bold text-kg-text pb-2 border-b border-kg-sep text-center mb-2">
          诊断详情 Details
        </h2>

        {/* Layers */}
        <LayerSection
          title="Grammar 语法"
          layerType="grammar"
          items={result.grammar}
          emptyMessage="✓ 无语法错误"
        />

        <LayerSection
          title="Register 语体"
          layerType="register"
          items={result.register}
          emptyMessage="✓ 语体使用恰当"
        />

        <LayerSection
          title="Pragmatics 语用"
          layerType="pragmatics"
          items={result.pragmatics}
          emptyMessage="✓ 表达自然"
        />
      </div>
    </div>
  );
}
