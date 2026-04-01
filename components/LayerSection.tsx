"use client";

import { GrammarIssue, RegisterIssue, PragmaticsIssue } from "@/lib/types";

interface Props {
  title: string;
  layerType: "grammar" | "register" | "pragmatics";
  items: GrammarIssue[] | RegisterIssue[] | PragmaticsIssue[];
  emptyMessage: string;
}

export default function LayerSection({
  title, layerType, items, emptyMessage
}: Props) {
  if (items.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-[15px] font-bold text-kg-text mb-3 font-sans-zh tracking-wider uppercase flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full bg-kg-success`}></span>
          {title}
        </h3>
        <div className="bg-kg-success-bg border border-kg-sep-2 rounded-xl p-4">
          <p className="text-kg-success-text font-medium font-sans-zh text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  const bgClass = layerType === "grammar" ? "bg-[var(--kg-layer1-bg)]" : layerType === "register" ? "bg-[var(--kg-layer2-bg)]" : "bg-[var(--kg-layer3-bg)]";
  const textClass = layerType === "grammar" ? "text-[var(--kg-layer1-text)]" : layerType === "register" ? "text-[var(--kg-layer2-text)]" : "text-[var(--kg-layer3-text)]";
  const badgeClass = layerType === "grammar" ? "bg-[var(--kg-layer1)]" : layerType === "register" ? "bg-[var(--kg-layer2)]" : "bg-[var(--kg-layer3)]";
  const strokeColor = layerType === 'grammar' ? 'decoration-[var(--kg-layer1)]' : layerType === 'register' ? 'decoration-[var(--kg-layer2)]' : 'decoration-[var(--kg-layer3)]';

  return (
    <div className="mb-8">
      <h3 className="text-[15px] font-bold text-kg-text mb-4 font-sans-zh tracking-wider uppercase flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${badgeClass}`}></span>
        {title}
      </h3>
      <div className="flex flex-col border-t border-kg-sep-2">
        {items.map((item, index) => (
          <div key={index} className="py-5 border-b border-kg-sep-2 last:border-b-0 flex flex-col gap-3">
            
            {/* Teacher's correction line: strikethrough -> correction */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-[17px] font-sans-jp px-2 py-0.5 rounded-md line-through text-kg-text-3 font-bold bg-kg-bg-2 decoration-[2px] ${strokeColor}`}>
                {item.original}
              </span>
              
              <span className="text-kg-text-4 font-mono">→</span>
              
              {layerType === "grammar" && 'correction' in item && (
                <span className={`text-[17px] font-sans-jp font-bold px-3 py-0.5 rounded-md ${textClass} ${bgClass}`}>
                  {item.correction}
                </span>
              )}

              {layerType === "register" && 'suggestion' in item && (
                 <span className={`text-[17px] font-sans-jp font-bold px-3 py-0.5 rounded-md ${textClass} ${bgClass}`}>
                   {'alternatives' in item && item.alternatives.length > 0 ? item.alternatives[0].expression : item.suggestion}
                 </span>
              )}

              {/* Pragmatics: Show the first alternative as the primary suggestion */}
              {layerType === "pragmatics" && 'alternatives' in item && item.alternatives.length > 0 && (
                <span className={`text-[17px] font-sans-jp font-bold px-3 py-0.5 rounded-md ${textClass} ${bgClass}`}>
                  {item.alternatives[0].expression}
                </span>
              )}
            </div>

            {/* Explanation / Issue */}
            <p className="text-[15px] font-sans-zh text-kg-text-2 leading-[1.8] mt-1 tracking-wide">
              <span className={`font-bold mr-2 text-[12px] uppercase ${textClass} bg-kg-bg px-2 py-0.5 rounded border border-kg-sep-2`}>解析</span>
              {item.issue}
            </p>

            {/* Alternatives - Show all for Register and Pragmatics */}
            {layerType !== "grammar" && 'alternatives' in item && item.alternatives.length > 0 && (
              <div className="mt-2 pl-4 border-l-[3px] border-kg-sep-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-kg-text-4 uppercase tracking-widest font-bold">Alternatives</span>
                {item.alternatives.map((alt, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                    <span className={`text-[15px] font-medium font-sans-jp ${textClass}`}>
                      {alt.expression}
                    </span>
                    <span className="text-[13px] text-kg-text-3 font-sans-zh">
                      {alt.context}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
