"use client";

import { useState } from "react";
import { GrammarIssue, IssueVote, PragmaticsIssue, ProficiencyLevel, RegisterIssue, UILanguage, VALID_PROFICIENCY_LEVELS, PROFICIENCY_STORAGE_KEY } from "@/lib/types";
import { getI18n } from "@/lib/i18n";
import { getClientSessionId } from "@/lib/session-id";
import AudioPlayer from "./AudioPlayer";

interface Props {
  title: string;
  layerType: "grammar" | "register" | "pragmatics";
  items: (GrammarIssue | RegisterIssue | PragmaticsIssue)[];
  emptyMessage: string;
  resId?: string;
  modelId?: string;
  lang: UILanguage;
  scene?: string;
}

function getStoredProficiencyLevel(): ProficiencyLevel | undefined {
  if (typeof window === "undefined") return undefined;
  const val = localStorage.getItem(PROFICIENCY_STORAGE_KEY) as ProficiencyLevel;
  return VALID_PROFICIENCY_LEVELS.includes(val) ? val : undefined;
}

export default function LayerSection({
  title, layerType, items, emptyMessage, resId, modelId, lang = "zh", scene
}: Props) {
  const t = getI18n(lang);
  const [votes, setVotes] = useState<Record<string, IssueVote | undefined>>({});

  const getVoteKey = (index: number) => `${resId ?? "__nores__"}:${index}`;

  const submitIssueFeedback = async (index: number, vote: IssueVote, original: string, issue: string) => {
    const key = getVoteKey(index);
    if (votes[key] === vote) return;
    setVotes((prev) => ({ ...prev, [key]: vote }));

    try {
      await fetch("/api/issue-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resId, modelId, issueIndex: index, vote, original, issue,
          layer: layerType, sessionId: getClientSessionId(),
          userProficiency: getStoredProficiencyLevel(),
        }),
      });
    } catch (err) {
      console.error("Failed to submit issue feedback:", err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-mono-label uppercase tracking-widest font-mono text-kg-text-3 font-bold">
          {title}
        </h3>
        <p className="text-footnote font-sans-zh text-kg-text-4 italic">{emptyMessage}</p>
      </div>
    );
  }

  const textClass = layerType === "grammar" ? "text-kg-layer1" : layerType === "register" ? "text-kg-layer2" : "text-kg-layer3";
  const bgClass = layerType === "grammar" ? "bg-kg-layer1-bg" : layerType === "register" ? "bg-kg-layer2-bg" : "bg-kg-layer3-bg";
  const strokeColor = layerType === "grammar" ? "decoration-kg-layer1" : layerType === "register" ? "decoration-kg-layer2" : "decoration-kg-layer3";

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-mono-label uppercase tracking-widest font-mono text-kg-text-3 font-bold">
        {title}
      </h3>
      <div className="flex flex-col border-t border-kg-sep-2">
        {items.map((item, index) => {
          const alternatives = 'alternatives' in item ? item.alternatives : [];
          let primaryCorrection = "";
          if (layerType === "grammar" && 'correction' in item) primaryCorrection = item.correction;
          else if (layerType === "register" && 'suggestion' in item) primaryCorrection = item.suggestion;
          else if (layerType === "pragmatics" && alternatives.length > 0) primaryCorrection = alternatives[0].expression;

          return (
            <div key={index} className="py-5 border-b border-kg-sep-2 last:border-b-0 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-[17px] font-sans-jp px-2 py-0.5 rounded-md line-through text-kg-text-3 font-bold bg-kg-bg-2 decoration-2 ${strokeColor}`}>
                  {item.original}
                </span>
                {primaryCorrection && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[17px] font-sans-jp font-bold px-3 py-0.5 rounded-md ${textClass} ${bgClass}`}>
                      {primaryCorrection}
                    </span>
                    <AudioPlayer text={primaryCorrection} scene={scene} className="w-7 h-7 scale-90" />
                  </div>
                )}
              </div>

              <p className="text-subhead font-sans-zh text-kg-text-2 leading-[1.8] mt-1 tracking-wide">
                <span className={`font-bold mr-2 text-caption uppercase ${textClass} bg-kg-bg px-2 py-0.5 rounded border border-kg-sep-2`}>{t.result.analysisLabel}</span>
                {item.issue}
              </p>

              {layerType !== "grammar" && alternatives.length > 0 && (
                <div className="mt-2 pl-4 border-l-[3px] border-kg-sep-2 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-kg-text-4 uppercase tracking-widest font-bold">{t.result.alternativesLabel}</span>
                  {alternatives.map((alt, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-subhead font-medium font-sans-jp ${textClass}`}>
                          {alt.expression}
                        </span>
                        <AudioPlayer text={alt.expression} scene={scene} className="w-5 h-5 scale-75" />
                      </div>
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
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md transition-all active:scale-95 text-caption font-sans-zh ${
                      votes[getVoteKey(index)] === "agree"
                        ? "text-kg-success bg-kg-success/10 font-medium"
                        : "text-kg-text-4 hover:text-kg-text-2 hover:bg-kg-bg-2"
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span>{t.result.issueAgree}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => submitIssueFeedback(index, "disagree", item.original, item.issue)}
                    title={t.result.issueDisagree}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md transition-all active:scale-95 text-caption font-sans-zh ${
                      votes[getVoteKey(index)] === "disagree"
                        ? "text-kg-layer1 bg-kg-layer1/10 font-medium"
                        : "text-kg-text-4 hover:text-kg-text-2 hover:bg-kg-bg-2"
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"></path>
                      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                    </svg>
                    <span>{t.result.issueDisagree}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
