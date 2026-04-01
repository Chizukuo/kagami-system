"use client";
import { useState } from "react";
import { getI18n } from "@/lib/i18n";
import { UILanguage } from "@/lib/types";

interface Props {
  inputText: string;
  inputScene: string;
  grammarCount: number;
  registerCount: number;
  pragmaticsCount: number;
  nativeVersion: string;
  summary: string;
  lang: UILanguage;
}

type Rating = "accurate" | "partial" | "inaccurate";

// Flat icon components (minimal, linear style)
const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconMinus = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconX = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconAlertCircle = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default function EvaluationWidget({
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
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 2 optional fields
  const [intentMismatch, setIntentMismatch] = useState(false);
  const [userCorrection, setUserCorrection] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");

  const ratingLabel: Record<Rating, string> = {
    accurate: t.evaluation.accurate,
    partial: t.evaluation.partial,
    inaccurate: t.evaluation.inaccurate,
  };

  const ratingIcon = {
    accurate: <IconCheck />,
    partial: <IconMinus />,
    inaccurate: <IconX />,
  };

  const ratingToneClass: Record<Rating, string> = {
    accurate: "text-kg-success border-kg-success/35 bg-kg-success-bg",
    partial: "text-kg-blue border-kg-blue/35 bg-kg-blue-bg",
    inaccurate: "text-kg-layer1 border-kg-layer1-sep bg-kg-layer1-bg",
  };

  const submitEval = async (currentRating: Rating, skipDetails = false) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          inputScene,
          grammarCount,
          registerCount,
          pragmaticsCount,
          nativeVersion,
          summary,
          rating: currentRating,
          ...(skipDetails ? {} : { intentMismatch, userCorrection, feedbackNote }),
          lang,
        }),
      });

      if (!res.ok) {
        throw new Error(t.evaluation.submitFailed);
      }

      setStep("done");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError(t.evaluation.submitFailed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickRate = (r: Rating) => {
    setRating(r);
    // If "accurate" — likely no detail needed, but still show Step 2
    setStep(2);
  };

  if (step === "done") {
    return (
      <div className="mt-8 py-5 text-center border-t border-kg-sep-2" aria-live="polite">
        <div className="mx-auto mb-3 w-8 h-8 rounded-full border border-kg-success/35 bg-kg-success-bg flex items-center justify-center text-kg-success">
          <IconCheck className="w-4.5 h-4.5" />
        </div>
        <p className="text-[14px] text-kg-text-2 font-sans-zh font-medium">{t.evaluation.doneTitle}</p>
        <p className="mt-1 text-caption text-kg-text-4 font-sans-zh">{t.evaluation.doneSubline}</p>
      </div>
    );
  }

  if (step === 2 && rating) {
    return (
      <div className="mt-8 pt-6 border-t border-kg-sep-2 flex flex-col gap-4" aria-live="polite">
        <div className="flex items-center justify-center gap-3">
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${ratingToneClass[rating]}`}>
            {ratingIcon[rating]}
          </div>
          <span className="text-footnote font-sans-zh text-kg-text-3">{t.evaluation.yourRating}</span>
          <span className={`px-2.5 py-1 rounded-full border text-caption font-sans-zh font-medium ${ratingToneClass[rating]}`}>
            {ratingLabel[rating]}
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer self-start">
          <input
            type="checkbox"
            checked={intentMismatch}
            onChange={(e) => setIntentMismatch(e.target.checked)}
            disabled={submitting}
            className="w-4 h-4 accent-(--kg-blue) cursor-pointer"
          />
          <span className="text-[14px] font-sans-zh text-kg-text-2">{t.evaluation.intentMismatch}</span>
        </label>

        <div className="flex flex-col gap-1">
          <label className="text-footnote font-sans-zh text-kg-text-3">{t.evaluation.betterExpressionLabel}</label>
          <textarea
            value={userCorrection}
            onChange={(e) => setUserCorrection(e.target.value)}
            maxLength={2000}
            disabled={submitting}
            placeholder={t.evaluation.betterExpressionPlaceholder}
            className="w-full min-h-[80px] p-3 bg-kg-bg border border-kg-sep rounded-lg text-[14px] font-sans-jp text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue focus:shadow-focus transition-all disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-footnote font-sans-zh text-kg-text-3">{t.evaluation.feedbackLabel}</label>
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            maxLength={500}
            disabled={submitting}
            placeholder={t.evaluation.feedbackPlaceholder}
            className="w-full min-h-15 p-3 bg-kg-bg border border-kg-sep rounded-lg text-[14px] font-sans-zh text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue focus:shadow-focus transition-all disabled:opacity-60"
          />
        </div>

        {submitError && (
          <div className="rounded-lg border border-kg-layer1-sep bg-kg-layer1-bg px-3 py-2.5 text-footnote text-kg-layer1-text font-sans-zh flex items-start gap-2">
            <IconAlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-kg-layer1" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={() => submitEval(rating, !userCorrection && !feedbackNote && !intentMismatch)}
            disabled={submitting}
            className="min-w-32 px-5 py-2.5 rounded-lg text-footnote font-sans-zh font-medium bg-kg-blue text-white hover:bg-kg-blue-hover active:bg-kg-blue-pressed disabled:opacity-60 transition-all interaction-press cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? t.evaluation.submitting : t.evaluation.submit}
          </button>
          <button
            onClick={() => setStep(1)}
            disabled={submitting}
            className="min-w-24 px-5 py-2.5 rounded-lg text-footnote font-sans-zh text-kg-text-2 border border-kg-sep hover:bg-kg-bg-2 hover:text-kg-text disabled:opacity-60 transition-all interaction-press cursor-pointer disabled:cursor-not-allowed"
          >
            {t.evaluation.back}
          </button>
        </div>
      </div>
    );
  }

  // Step 1
  return (
    <div className="mt-8 pt-6 border-t border-kg-sep-2 flex flex-col items-center gap-4">
      <p className="text-[14px] text-kg-text-2 font-sans-zh font-medium">{t.evaluation.question}</p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => handleQuickRate("accurate")}
          className="px-3 py-2 rounded-lg text-footnote font-sans-zh border border-kg-sep hover:border-kg-success hover:bg-kg-success-bg transition-all interaction-press cursor-pointer flex items-center gap-2 text-kg-text hover:text-kg-success"
        >
          <IconCheck className="w-4 h-4" />
          <span>{t.evaluation.accurate}</span>
        </button>
        <button
          onClick={() => handleQuickRate("partial")}
          className="px-3 py-2 rounded-lg text-footnote font-sans-zh border border-kg-sep hover:border-kg-blue hover:bg-kg-blue-bg transition-all interaction-press cursor-pointer flex items-center gap-2 text-kg-text hover:text-kg-blue"
        >
          <IconMinus className="w-4 h-4" />
          <span>{t.evaluation.partial}</span>
        </button>
        <button
          onClick={() => handleQuickRate("inaccurate")}
          className="px-3 py-2 rounded-lg text-footnote font-sans-zh border border-kg-sep hover:border-kg-layer1 hover:bg-kg-layer1-bg transition-all interaction-press cursor-pointer flex items-center gap-2 text-kg-text hover:text-kg-layer1"
        >
          <IconX className="w-4 h-4" />
          <span>{t.evaluation.inaccurate}</span>
        </button>
      </div>
      <p className="text-mono-label text-kg-text-4 font-sans-zh leading-relaxed text-center max-w-xs">
        {t.evaluation.consent}
      </p>
    </div>
  );
}
