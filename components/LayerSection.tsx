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
  const [activeAltIndices, setActiveAltIndices] = useState<Record<number, number>>({});

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
          const activeAltIndex = activeAltIndices[index] || 0;
          const currentAlt = alternatives[activeAltIndex];

          let primaryCorrection = "";
          if (layerType === "grammar" && 'correction' in item) primaryCorrection = item.correction;
          else if (layerType === "register" && 'suggestion' in item) primaryCorrection = item.suggestion;
          else if (layerType === "pragmatics" && currentAlt) primaryCorrection = currentAlt.expression;

          return (
            <div key={index} className="py-5 border-b border-kg-sep-2 last:border-b-0 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-[17px] font-sans-jp px-2 py-0.5 rounded-md line-through text-kg-text-3 font-bold bg-kg-bg-2 decoration-2 ${strokeColor}`}>
                  {item.original}
                </span>
                <span className="text-kg-text-4 font-mono">鈫</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[17px] font-sans-jp font-bold px-3 py-0.5 rounded-md ${textClass} ${bgClass}`}>
                    {primaryCorrection}
                  </span>
                  <AudioPlayer text={primaryCorrection} scene={scene} className="w-7 h-7 scale-90" />
                </div>
              </div>

              <p className="text-subhead font-sans-zh text-kg-text-2 leading-[1.8] mt-1 tracking-wide">
                <span className={`font-bold mr-2 text-caption uppercase ${textClass} bg-kg-bg px-2 py-0.5 rounded border border-kg-sep-2`}>{t.result.analysisLabel}</span>
                {item.issue}
              </p>

              {layerType !== "grammar" && alternatives.length > 0 && (
                <div className="mt-2 pl-4 border-l-[3px] border-kg-sep-2 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {alternatives.map((alt, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveAltIndices(prev => ({...prev, [index]: i}))}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                          i === activeAltIndex
                            ? `bg-kg-bg-2 ${textClass} shadow-sm border border-kg-sep-2`
                            : "text-kg-text-4 hover:bg-kg-bg-2"
                        }`}
                      >
                        {alt.expression}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-kg-bg-2/30 rounded-lg animate-fade-in" key={`${index}-${activeAltIndex}`}>
                    <p className="text-footnote text-kg-text-3 font-sans-zh italic leading-relaxed">
                      {currentAlt.context}
                    </p>
                  </div>
                </div>
              )}

              {resId && (
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-kg-sep-2/50 pt-2">
                  <button
                    onClick={() => submitIssueFeedback(index, "agree", item.original, item.issue)}
                    className={`text-caption font-sans-zh ${votes[getVoteKey(index)] === "agree" ? "text-kg-success font-bold" : "text-kg-text-4"}`}
                  >
                    {t.result.issueAgree}
                  </button>
                  <button
                    onClick={() => submitIssueFeedback(index, "disagree", item.original, item.issue)}
                    className={`text-caption font-sans-zh ${votes[getVoteKey(index)] === "disagree" ? "text-kg-layer1 font-bold" : "text-kg-text-4"}`}
                  >
                    {t.result.issueDisagree}
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
