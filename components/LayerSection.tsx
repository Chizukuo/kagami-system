"use client";

import { useState } from "react";
import { GrammarIssue, IssueVote, PragmaticsIssue, ProficiencyLevel, RegisterIssue, UILanguage } from "@/lib/types";
import { getI18n } from "@/lib/i18n";
import { getClientSessionId } from "@/lib/session-id";

interface Props {
  title: string;
  layerType: "grammar" | "register" | "pragmatics";
  items: GrammarIssue[] | RegisterIssue[] | PragmaticsIssue[];
  emptyMessage: string;
  resId?: string;
  modelId?: string;
  lang: UILanguage;
}

const VALID_PROFICIENCY_LEVELS: ProficiencyLevel[] = ["N5", "N4", "N3", "N2", "N1", "N1_PLUS", "UNKNOWN"];

function getStoredProficiencyLevel(): ProficiencyLevel | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const stored = window.localStorage.getItem("kagami.proficiencyLevel");
  if (!stored) {
    return undefined;
  }
  const normalized = stored.toUpperCase() as ProficiencyLevel;
  return VALID_PROFICIENCY_LEVELS.includes(normalized) ? normalized : undefined;
}

export default function LayerSection({
  title, layerType, items, emptyMessage, resId, modelId, lang = "zh"
}: Props) {
  const t = getI18n(lang);
  const [votes, setVotes] = useState<Record<string, IssueVote | undefined>>({});

  const getVoteKey = (index: number) => `${resId ?? "__nores__"}:${index}`;

  const submitIssueFeedback = (index: number, vote: IssueVote, issueOriginal: string, issueText: string) => {
    const voteKey = getVoteKey(index);
    if (votes[voteKey] === vote) {
      return;
    }

    setVotes((prev) => ({ ...prev, [voteKey]: vote }));

    if (!resId) {
      return;
    }

    void fetch("/api/issue-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resId,
        layer: layerType,
        index,
        vote,
        proficiencyLevel: getStoredProficiencyLevel(),
        modelId,
        sessionId: getClientSessionId(),
        issueOriginal,
        issueText,
        timestamp: new Date().toISOString(),
        lang,
      }),
    }).catch(() => {
      // Silent mode by design: optimistic UI update without user interruption.
    });
  };

  if (items.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-subhead font-bold text-kg-text mb-3 font-sans-zh tracking-wider uppercase flex items-center gap-2">
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
      <h3 className="text-subhead font-bold text-kg-text mb-4 font-sans-zh tracking-wider uppercase flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${badgeClass}`}></span>
        {title}
      </h3>
      <div className="flex flex-col border-t border-kg-sep-2">
        {items.map((item, index) => (
          <div key={index} className="py-5 border-b border-kg-sep-2 last:border-b-0 flex flex-col gap-3">
            
            {/* Teacher's correction line: strikethrough -> correction */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-[17px] font-sans-jp px-2 py-0.5 rounded-md line-through text-kg-text-3 font-bold bg-kg-bg-2 decoration-2 ${strokeColor}`}>
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
                   {item.suggestion}
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
            <p className="text-subhead font-sans-zh text-kg-text-2 leading-[1.8] mt-1 tracking-wide">
              <span className={`font-bold mr-2 text-caption uppercase ${textClass} bg-kg-bg px-2 py-0.5 rounded border border-kg-sep-2`}>{t.result.analysisLabel}</span>
              {item.issue}
            </p>

            {/* Alternatives - Show all for Register and Pragmatics */}
            {layerType !== "grammar" && 'alternatives' in item && item.alternatives.length > 0 && (
              <div className="mt-2 pl-4 border-l-[3px] border-kg-sep-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-kg-text-4 uppercase tracking-widest font-bold">{t.result.alternativesLabel}</span>
                {item.alternatives.map((alt, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                    <span className={`text-subhead font-medium font-sans-jp ${textClass}`}>
                      {alt.expression}
                    </span>
                    <span className="text-footnote text-kg-text-3 font-sans-zh">
                      {alt.context}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {resId && (
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-kg-sep-2/50 pt-2">
                <button
                  type="button"
                  onClick={() => submitIssueFeedback(index, "agree", item.original, item.issue)}
                  title={t.result.issueAgree}
                  className={`flex items-center justify-center p-1.5 rounded-md transition-all active:scale-95 ${
                    votes[getVoteKey(index)] === "agree"
                      ? "text-kg-success bg-kg-success/10"
                      : "text-kg-text-4 hover:text-kg-text-2 hover:bg-kg-bg-2"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => submitIssueFeedback(index, "disagree", item.original, item.issue)}
                  title={t.result.issueDisagree}
                  className={`flex items-center justify-center p-1.5 rounded-md transition-all active:scale-95 ${
                    votes[getVoteKey(index)] === "disagree"
                      ? "text-kg-layer1 bg-kg-layer1/10"
                      : "text-kg-text-4 hover:text-kg-text-2 hover:bg-kg-bg-2"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
