import { useState } from "react";
import { ProficiencyLevel, UILanguage, VALID_PROFICIENCY_LEVELS } from "@/lib/types";
import { getI18n } from "@/lib/i18n";
import { getClientSessionId } from "@/lib/session-id";

const IconCheck = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const IconAlertCircle = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

const IconChevronDown = ({ className = "w-4 h-4", strokeWidth = "2" }: { className?: string, strokeWidth?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

interface Props {
  resId: string;
  modelId: string;
  inputText: string;
  inputScene: string;
  grammarCount: number;
  registerCount: number;
  pragmaticsCount: number;
  nativeVersion: string[];
  summary: string;
  lang: UILanguage;
}

const getStoredProficiencyLevel = (): ProficiencyLevel | "" => {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem("kagami.proficiencyLevel");
  if (stored && VALID_PROFICIENCY_LEVELS.includes(stored as ProficiencyLevel)) {
    return stored as ProficiencyLevel;
  }
  return "";
};

export default function EvaluationWidget({
  resId,
  modelId,
  inputText,
  inputScene,
  grammarCount,
  registerCount,
  pragmaticsCount,
  nativeVersion,
  summary,
  lang,
}: Props) {
  const t = getI18n(lang);
  const [uiState, setUiState] = useState<"initial" | "done">("initial");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string } | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel | "">(getStoredProficiencyLevel);

  const handleProficiencyChange = (value: string) => {
    const normalized = value.toUpperCase() as ProficiencyLevel;
    const next = VALID_PROFICIENCY_LEVELS.includes(normalized) ? normalized : "";
    setProficiencyLevel(next);
    if (typeof window !== "undefined") {
      if (next) window.localStorage.setItem("kagami.proficiencyLevel", next);
      else window.localStorage.removeItem("kagami.proficiencyLevel");
    }
  };

  const canSubmit = feedbackNote.trim().length > 0;

  const submitFeedback = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resId,
          modelId,
          sessionId: getClientSessionId(),
          inputText,
          inputScene,
          grammarCount,
          registerCount,
          pragmaticsCount,
          nativeVersion: nativeVersion.join("\n"),
          summary,
          proficiencyLevel: proficiencyLevel || undefined,
          feedbackNote,
          lang,
        }),
      });

      if (!res.ok) {
        setSubmitError({ message: `${t.evaluation.submitFailed} [HTTP ${res.status}]` });
        return;
      }
      setUiState("done");
    } catch {
      setSubmitError({ message: t.evaluation.submitFailed });
    } finally {
      setSubmitting(false);
    }
  };

  if (uiState === "done") {
    return (
      <div className="px-6 py-10 text-center border-t border-kg-sep-2 animate-fade-in-up">
        <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-kg-success/10 flex items-center justify-center text-kg-success">
          <IconCheck className="w-5 h-5" />
        </div>
        <p className="text-body font-sans-zh font-bold text-kg-text mb-2">{t.evaluation.doneTitle}</p>
        <p className="text-footnote text-kg-text-3 font-sans-zh max-w-sm mx-auto leading-relaxed">{t.evaluation.doneSubline}</p>
      </div>
    );
  }

  // Check if proficiency level has already been set (from localStorage)
  const showProficiency = !getStoredProficiencyLevel();

  return (
    <div className="border-t border-kg-sep-2 pt-8 pb-6 animate-fade-in-up">
      <div className="max-w-2xl mx-auto px-4 flex flex-col gap-5">
        {/* Gentle prompt */}
        <p className="text-footnote text-kg-text-4 font-sans-zh text-center">
          {t.evaluation.prompt}
        </p>

        {submitError && (
          <div className="text-center text-caption text-kg-layer1 font-sans-zh bg-kg-layer1-bg border border-kg-layer1-sep rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-kg-layer1 shrink-0" />
            {submitError.message}
          </div>
        )}

        {/* Proficiency selector — only shown if not already stored */}
        {showProficiency && (
          <div className="flex flex-col gap-2">
            <label className="text-footnote font-sans-zh text-kg-text-3 font-medium uppercase tracking-wider">{t.evaluation.proficiencyLabel}</label>
            <div className="relative group">
              <select
                value={proficiencyLevel}
                onChange={(e) => handleProficiencyChange(e.target.value)}
                disabled={submitting}
                className="appearance-none w-full h-11 pl-4 pr-10 bg-kg-bg border border-kg-sep rounded-xl text-footnote text-kg-text outline-none focus:border-kg-blue focus:ring-4 focus:ring-kg-blue/10 hover:border-kg-sep-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                <option value="">{t.evaluation.proficiencyPlaceholder}</option>
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
                <option value="N1_PLUS">{t.evaluation.proficiencyN1Plus}</option>
                <option value="UNKNOWN">{t.evaluation.proficiencyUnknown}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-kg-text-4 group-hover:text-kg-text-3">
                <IconChevronDown className="w-4 h-4" strokeWidth="3" />
              </div>
            </div>
            <p className="text-mono-label text-kg-text-4 font-mono">{t.evaluation.proficiencyHint}</p>
          </div>
        )}

        {/* Optional feedback textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-footnote font-sans-zh text-kg-text-3 font-medium uppercase tracking-wider">{t.evaluation.feedbackLabel}</label>
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            maxLength={500}
            disabled={submitting}
            placeholder={t.evaluation.feedbackPlaceholder}
            className="w-full min-h-[80px] p-3.5 bg-kg-bg border border-kg-sep rounded-xl text-[14px] text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue focus:ring-4 focus:ring-kg-blue/10 hover:border-kg-sep-2 transition-all duration-200 ease-apple disabled:opacity-60 shadow-sm focus:shadow-md font-sans-zh"
          />
        </div>

        {/* Submit + consent */}
        <div className={`flex flex-col gap-3 transition-all duration-300 ${canSubmit ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <button
            onClick={submitFeedback}
            disabled={submitting || !canSubmit}
            className="w-full sm:w-auto self-end px-8 py-3 rounded-2xl text-footnote font-sans-zh font-bold bg-kg-text text-kg-bg shadow-sm hover:shadow-md hover:bg-[var(--kg-text-2)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[120px] disabled:opacity-60 disabled:scale-100 disabled:shadow-none"
          >
            {submitting ? (
              <svg className="w-5 h-5 animate-spin text-kg-bg flex-shrink-0" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : t.evaluation.submit}
          </button>

          <p className="text-mono-label text-kg-text-4 font-mono text-center leading-relaxed">
            {t.evaluation.consent}
          </p>
        </div>
      </div>
    </div>
  );
}
