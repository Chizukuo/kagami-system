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
      <div className="mb-4 p-6 bg-[var(--kg-blue-bg)] rounded-xl">
        <h3 className="text-[12px] uppercase tracking-widest font-bold text-[var(--kg-blue-text)] mb-2 font-mono">Summary</h3>
        <p className="text-[15px] text-[var(--kg-blue-text)] leading-[1.8] font-sans-zh font-medium">
          {result.summary}
        </p>
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
