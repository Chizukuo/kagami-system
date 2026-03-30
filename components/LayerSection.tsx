"use client";

import { GrammarIssue, RegisterIssue, PragmaticsIssue } from "@/lib/types";

interface Props {
  title: string;
  colorClass: string;
  layerType: "grammar" | "register" | "pragmatics";
  items: GrammarIssue[] | RegisterIssue[] | PragmaticsIssue[];
  emptyMessage: string;
}

export default function LayerSection({
  title, colorClass, layerType, items, emptyMessage
}: Props) {
  if (items.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold text-kg-text mb-3 font-sans-zh tracking-wide">{title}</h3>
        <p className="text-kg-success font-medium font-sans-zh">{emptyMessage}</p>
      </div>
    );
  }

  const bgClass = layerType === "grammar" ? "bg-[var(--kg-layer1-bg)]" : layerType === "register" ? "bg-[var(--kg-layer2-bg)]" : "bg-[var(--kg-layer3-bg)]";
  const textClass = layerType === "grammar" ? "text-[var(--kg-layer1-text)]" : layerType === "register" ? "text-[var(--kg-layer2-text)]" : "text-[var(--kg-layer3-text)]";
  const borderClass = layerType === "grammar" ? "border-[var(--kg-layer1-sep)]" : layerType === "register" ? "border-[var(--kg-layer2-sep)]" : "border-[var(--kg-layer3-sep)]";
  const badgeClass = layerType === "grammar" ? "bg-[var(--kg-layer1)]" : layerType === "register" ? "bg-[var(--kg-layer2)]" : "bg-[var(--kg-layer3)]";

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-kg-text mb-3 font-sans-zh tracking-wide">{title}</h3>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={index} className={`pl-4 py-4 ${colorClass} bg-kg-bg border border-kg-sep shadow-sm hover:shadow-hover transition-shadow duration-300 ease-snappy rounded-r-xl`}>
            {/* Original word pill and issue text */}
            <div className="mb-3">
              <div className={`inline-block ${badgeClass} text-white font-mono text-[11px] font-bold px-2 py-1 rounded mb-2`}>
                {item.original}
              </div>
              <p className="text-[17px] font-medium text-kg-text font-sans-zh leading-[1.7]">{item.issue}</p>
            </div>

            {/* Grammar field */}
            {layerType === "grammar" && 'correction' in item && (
              <div className={`mt-3 ${bgClass} border ${borderClass} p-3 rounded-lg`}>
                <span className="text-[11px] font-mono font-bold text-kg-text-3 block mb-1">CORRECTION</span>
                <p className={`text-[15px] font-bold ${textClass} font-sans-jp`}>{item.correction}</p>
              </div>
            )}

            {/* Register field */}
            {layerType === "register" && 'suggestion' in item && (
              <div className={`mt-3 ${bgClass} border ${borderClass} p-3 rounded-lg`}>
                <span className="text-[11px] font-mono font-bold text-kg-text-3 block mb-1">SUGGESTION</span>
                <p className={`text-[15px] ${textClass} font-medium mb-3 font-sans-jp`}>{item.suggestion}</p>
                
                <span className="text-[11px] font-mono font-bold text-kg-text-3 block mb-1">ALTERNATIVES</span>
                <div className="flex flex-col gap-2">
                  {item.alternatives.map((alt, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 bg-kg-bg p-2 rounded-md border border-kg-sep">
                      <span className={`text-[15px] font-bold ${textClass} font-sans-jp`}>{alt.expression}</span>
                      <span className="text-[13px] text-kg-text-2 font-sans-jp">{alt.context}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pragmatics field */}
            {layerType === "pragmatics" && 'alternatives' in item && (
              <div className={`mt-3 ${bgClass} border ${borderClass} p-3 rounded-lg`}>
                <span className="text-[11px] font-mono font-bold text-kg-text-3 block mb-1">ALTERNATIVES</span>
                <div className="flex flex-col gap-2">
                  {item.alternatives.map((alt, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 bg-kg-bg p-2 rounded-md border border-kg-sep">
                      <span className={`text-[15px] font-bold ${textClass} font-sans-jp`}>{alt.expression}</span>
                      <span className="text-[13px] text-kg-text-2 font-sans-jp">{alt.context}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
