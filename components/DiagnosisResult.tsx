"use client";

import { DiagnosisResult as ResultType, UILanguage } from "@/lib/types";
import { getI18n } from "@/lib/i18n";
import LayerSection from "./LayerSection";
import NativeVersion from "./NativeVersion";
import EvaluationWidget from "./EvaluationWidget";

interface Props {
  result: ResultType;
  lang: UILanguage;
}

export default function DiagnosisResult({ result, lang }: Props) {
  const t = getI18n(lang);
  const totalIssues = result.grammar.length + result.register.length + result.pragmatics.length;
  
  const severity = totalIssues === 0 
    ? { label: t.result.severity.excellent, sublabel: "Excellent", color: "text-kg-success", bg: "bg-kg-success-bg", border: "border-kg-success/20" }
    : totalIssues <= 2 
    ? { label: t.result.severity.good, sublabel: "Good", color: "text-kg-blue", bg: "bg-kg-blue-bg", border: "border-kg-blue/20" }
    : totalIssues <= 4
    ? { label: t.result.severity.needsWork, sublabel: "Needs Work", color: "text-[var(--kg-layer2)]", bg: "bg-[var(--kg-layer2-bg)]", border: "border-[var(--kg-layer2)]/20" }
    : { label: t.result.severity.review, sublabel: "Review Carefully", color: "text-[var(--kg-layer1)]", bg: "bg-[var(--kg-layer1-bg)]", border: "border-[var(--kg-layer1)]/20" };

  return (
    <div className="w-full flex flex-col pt-4">
      {/* Summary */}
      <div className={`mb-6 p-6 ${severity.bg} border ${severity.border} rounded-xl`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-caption uppercase tracking-widest font-bold text-(--kg-blue-text) font-mono">{t.result.summaryTitle}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-footnote font-sans-zh font-bold ${severity.color}`}>{severity.label}</span>
            <span className="text-mono-label font-mono text-kg-text-3 uppercase">{severity.sublabel}</span>
          </div>
        </div>
        <p className="text-subhead text-(--kg-blue-text) leading-[1.8] font-sans-zh font-medium">
          {result.summary}
        </p>
        <div className="mt-3 flex gap-4 text-mono-label font-mono text-kg-text-3 uppercase tracking-wider">
          <span>{t.result.grammarTitle} {result.grammar.length}</span>
          <span>{t.result.registerTitle} {result.register.length}</span>
          <span>{t.result.pragmaticsTitle} {result.pragmatics.length}</span>
        </div>
      </div>

      {/* Native Output elevated to the top! */}
      <NativeVersion nativeVersions={result.native_versions} lang={lang} scene={result._inputScene} />

      {/* Details Section - Full prominence */}
      <div className="mt-8 flex flex-col gap-6">
        <h2 className="text-[17px] font-display-zh font-bold text-kg-text pb-3 border-b border-kg-sep text-center">
          {t.result.detailsTitle}
        </h2>

        {/* Layers */}
        <LayerSection
          key={`${result._resId}-grammar`}
          title={t.result.grammarTitle}
          layerType="grammar"
          items={result.grammar}
          emptyMessage={t.result.grammarEmpty}
          resId={result._resId}
          modelId={result._modelId}
          lang={lang}
          scene={result._inputScene}
        />

        <LayerSection
          key={`${result._resId}-register`}
          title={t.result.registerTitle}
          layerType="register"
          items={result.register}
          emptyMessage={t.result.registerEmpty}
          resId={result._resId}
          modelId={result._modelId}
          lang={lang}
          scene={result._inputScene}
        />

        <LayerSection
          key={`${result._resId}-pragmatics`}
          title={t.result.pragmaticsTitle}
          layerType="pragmatics"
          items={result.pragmatics}
          emptyMessage={t.result.pragmaticsEmpty}
          resId={result._resId}
          modelId={result._modelId}
          lang={lang}
          scene={result._inputScene}
        />
      </div>

      {/* Evaluation Widget - Shifted to the end for progressive read flow */}
      <div className="mt-12">
        <EvaluationWidget
          resId={result._resId ?? ""}
          modelId={result._modelId ?? ""}
          inputText={result._inputText ?? ""}
          inputScene={result._inputScene ?? ""}
          grammarCount={result.grammar.length}
          registerCount={result.register.length}
          pragmaticsCount={result.pragmatics.length}
          nativeVersion={result.native_version}
          summary={result.summary}
          lang={lang}
        />
      </div>
    </div>
  );
}
