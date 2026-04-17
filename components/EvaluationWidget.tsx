import { useState } from "react";
import { Rating, ProficiencyLevel, UILanguage, VALID_PROFICIENCY_LEVELS } from "@/lib/types";
import { getI18n } from "@/lib/i18n";
import { getClientSessionId } from "@/lib/session-id";

const IconCheck = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const IconAlertCircle = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

const IconMinus = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const IconX = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
  const [rating, setRating] = useState<Rating | null>(null);
  const [uiState, setUiState] = useState<"initial" | "expanded" | "done">("initial");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; log?: string } | null>(null);

  const [intentMismatch, setIntentMismatch] = useState(false);
  const [userCorrection, setUserCorrection] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel | "">(getStoredProficiencyLevel);

  const ratingLabel: Record<Rating, string> = {
    accurate: t.evaluation.accurate,
    partial: t.evaluation.partial,
    inaccurate: t.evaluation.inaccurate,
  };

  const ratingIcon = {
    accurate: <IconCheck className="w-5 h-5" />,
    partial: <IconMinus className="w-5 h-5" />,
    inaccurate: <IconX className="w-5 h-5" />,
  };

  const getCardClass = (r: Rating) => {
    if (!rating) return "bg-kg-bg hover:bg-kg-bg-2 border-kg-sep text-kg-text cursor-pointer active:scale-95";
    if (rating !== r) return "bg-transparent border-transparent text-kg-text-4 opacity-50 scale-[0.98] pointer-events-none grayscale-[0.2]";
    if (r === "accurate") return "bg-kg-success/10 border-kg-success/30 text-kg-success scale-100 shadow-sm pointer-events-none";
    if (r === "partial") return "bg-kg-blue/10 border-kg-blue/30 text-kg-blue scale-100 shadow-sm pointer-events-none";
    return "bg-kg-layer1/10 border-kg-layer1/30 text-kg-layer1 scale-100 shadow-sm pointer-events-none";
  };

  const textareaBaseClass = "w-full min-h-[96px] p-3.5 bg-kg-bg border border-kg-sep rounded-xl text-[14px] text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue focus:ring-4 focus:ring-kg-blue/10 hover:border-kg-sep-2 transition-all duration-200 ease-apple disabled:opacity-60 shadow-sm focus:shadow-md";

  const submitEval = async (currentRating: Rating, isFinal = false) => {
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
          rating: currentRating,
          proficiencyLevel: proficiencyLevel || undefined,
          ...(isFinal ? { intentMismatch, userCorrection, feedbackNote } : {}),
          lang,
        }),
      });

      if (!res.ok) {
        setSubmitError({ message: `${t.evaluation.submitFailed} [HTTP ${res.status}]` });
        return;
      }
      if (isFinal) setUiState("done");
    } catch {
      setSubmitError({ message: t.evaluation.submitFailed });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickRate = (r: Rating) => {
    if (rating) return;
    setRating(r);
    setUiState("expanded");
    void submitEval(r, false);
  };

  const handleProficiencyChange = (value: string) => {
    const normalized = value.toUpperCase() as ProficiencyLevel;
    const next = VALID_PROFICIENCY_LEVELS.includes(normalized) ? normalized : "";
    setProficiencyLevel(next);
    if (typeof window !== "undefined") {
      if (next) window.localStorage.setItem("kagami.proficiencyLevel", next);
      else window.localStorage.removeItem("kagami.proficiencyLevel");
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

  return (
    <div className="border-t border-kg-sep-2 pt-8 pb-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <h3 className="text-[17px] font-sans-zh font-bold text-kg-text-2 mb-2">
          {rating ? t.evaluation.savedTitle : t.evaluation.question}
        </h3>
        <p className="text-footnote text-kg-text-4 font-sans-zh">
          {rating ? t.evaluation.savedSubline : t.evaluation.quickHint}
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex gap-3 px-4">
        {(["accurate", "partial", "inaccurate"] as Rating[]).map((r) => (
          <button
            key={r}
            disabled={rating !== null}
            onClick={() => handleQuickRate(r)}
            className={`flex-1 flex flex-col items-center justify-center py-5 sm:py-6 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${getCardClass(r)}`}
          >
            <div className="mb-2">{ratingIcon[r]}</div>
            <span className="text-footnote font-sans-zh font-medium">{ratingLabel[r]}</span>
          </button>
        ))}
      </div>

      <div className={`transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden flex flex-col items-center ${uiState === "expanded" ? "max-h-[1000px] opacity-100 mt-8" : "max-h-0 opacity-0 mt-0 pointer-events-none"}`}>
        <div className="w-full max-w-2xl px-4 flex flex-col gap-6">
          <div className="w-10 h-1 bg-kg-sep-2 rounded-full mx-auto opacity-50"></div>
          <p className="text-footnote text-kg-text-3 font-sans-zh text-center mt-2">{t.evaluation.detailIntro}</p>

          {submitError && (
             <div className="text-center text-caption text-kg-layer1 font-sans-zh mt-2 bg-kg-layer1-bg border border-kg-layer1-sep rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-2">
               <IconAlertCircle className="w-4 h-4 text-kg-layer1 shrink-0" />
               {submitError.message}
             </div>
          )}

          <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-kg-bg-2 transition-colors border border-transparent">
            <input type="checkbox" checked={intentMismatch} onChange={(e) => setIntentMismatch(e.target.checked)} disabled={submitting} className="w-5 h-5 accent-[var(--kg-blue)] cursor-pointer mt-0.5 rounded transition-transform group-active:scale-90" />
            <div className="flex flex-col">
              <span className="text-subhead font-sans-zh text-kg-text-2 font-semibold tracking-wide">{t.evaluation.intentMismatch}</span>
              <span className="text-caption font-sans-zh text-kg-text-4 mt-1 leading-[1.6]">{t.evaluation.intentMismatchHint}</span>
            </div>
          </label>

          <div className="flex flex-col gap-2 pl-1">
            <label className="text-footnote font-sans-zh text-kg-text-3 font-medium uppercase tracking-wider">{t.evaluation.proficiencyLabel}</label>
            <div className="relative group">
              <select value={proficiencyLevel} onChange={(e) => handleProficiencyChange(e.target.value)} disabled={submitting} className="appearance-none w-full h-12 pl-4 pr-10 bg-kg-bg border border-kg-sep rounded-xl text-footnote text-kg-text outline-none focus:border-kg-blue focus:ring-4 focus:ring-kg-blue/10 hover:border-kg-sep-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60">
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
          </div>

          <div className="flex flex-col gap-2 pl-1">
            <label className="text-footnote font-sans-zh text-kg-text-3 font-medium uppercase tracking-wider">{t.evaluation.betterExpressionLabel}</label>
            <textarea value={userCorrection} onChange={(e) => setUserCorrection(e.target.value)} maxLength={2000} disabled={submitting} placeholder={t.evaluation.betterExpressionPlaceholder} className={`${textareaBaseClass} font-sans-jp`} />
          </div>

          <div className="flex flex-col gap-2 pl-1">
            <label className="text-footnote font-sans-zh text-kg-text-3 font-medium uppercase tracking-wider">{t.evaluation.feedbackLabel}</label>
            <textarea value={feedbackNote} onChange={(e) => setFeedbackNote(e.target.value)} maxLength={500} disabled={submitting} placeholder={t.evaluation.feedbackPlaceholder} className={`${textareaBaseClass} min-h-[96px] font-sans-zh`} />
          </div>

          <div className="flex gap-4 mt-6 justify-center sm:justify-end">
            <button onClick={() => rating && submitEval(rating, true)} disabled={submitting} className="w-full sm:w-auto px-10 py-3.5 rounded-2xl text-footnote font-sans-zh font-bold bg-kg-text text-kg-bg shadow-sm hover:shadow-md hover:bg-[var(--kg-text-2)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[140px] disabled:opacity-60 disabled:scale-100 disabled:shadow-none">
              {submitting ? (
                <svg className="w-5 h-5 animate-spin text-kg-bg flex-shrink-0" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : t.evaluation.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
