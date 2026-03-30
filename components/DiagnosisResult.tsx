"use client";

import { DiagnosisResult as ResultType } from "@/lib/types";
import LayerSection from "./LayerSection";
import NativeVersion from "./NativeVersion";

interface Props {
  result: ResultType;
}

export default function DiagnosisResult({ result }: Props) {
  return (
    <div className="w-full flex flex-col pt-4">
      {/* Summary */}
      <div className="mb-8 p-6 bg-[var(--kg-blue-bg)] border border-transparent rounded-2xl shadow-sm hover:shadow-hover transition-shadow duration-300 ease-snappy">
        <h3 className="text-[15px] font-bold text-[var(--kg-blue-text)] mb-3 font-display-zh tracking-wide">総评 Summary</h3>
        <p className="text-[17px] text-[var(--kg-blue-text)] leading-[1.8] font-sans-zh">
          {result.summary}
        </p>
      </div>

      {/* Layers */}
      <LayerSection
        title="Grammar 语法"
        colorClass="border-l-[4px] border-[var(--kg-layer1)]"
        layerType="grammar"
        items={result.grammar}
        emptyMessage="✓ 无语法错误"
      />

      <LayerSection
        title="Register 语体"
        colorClass="border-l-[4px] border-[var(--kg-layer2)]"
        layerType="register"
        items={result.register}
        emptyMessage="✓ 语体使用恰当"
      />

      <LayerSection
        title="Pragmatics 语用"
        colorClass="border-l-[4px] border-[var(--kg-layer3)]"
        layerType="pragmatics"
        items={result.pragmatics}
        emptyMessage="✓ 表达自然"
      />

      {/* Native Output */}
      <NativeVersion nativeVersion={result.native_version} />
    </div>
  );
}
