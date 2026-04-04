"use client";
import { useState } from "react";
import { getI18n } from "@/lib/i18n";
import { UILanguage } from "@/lib/types";

interface Props {
  resId: string;
  inputText: string;
  inputScene: string;
  grammarCount: number;
  registerCount: number;
  pragmaticsCount: number;
  nativeVersion: string[];
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
  resId,
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
  const [step, setStep] = useState<1 | "saved" | 2 | "done">(1);
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

  const quickRateButtonClass: Record<Rating, string> = {
    accurate: "hover:bg-kg-success-bg hover:text-kg-success hover:border-kg-success/30",
    partial: "hover:bg-kg-blue-bg hover:text-kg-blue hover:border-kg-blue/30",
    inaccurate: "hover:bg-kg-layer1-bg hover:text-kg-layer1 hover:border-kg-layer1/30",
  };

  const textareaBaseClass =
    "w-full min-h-[96px] p-3.5 bg-kg-bg border border-kg-sep rounded-xl text-[14px] text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue focus:ring-1 focus:ring-kg-blue/30 transition-all disabled:opacity-60";

  const submitEval = async (currentRating: Rating, skipDetails = false) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resId,
          inputText,
          inputScene,
          grammarCount,
          registerCount,
          pragmaticsCount,
          nativeVersion: nativeVersion.join("\n"),
          summary,
          rating: currentRating,
          ...(skipDetails ? {} : { intentMismatch, userCorrection, feedbackNote }),
          lang,
        }),
      });

      if (!res.ok) {
        throw new Error(t.evaluation.submitFailed);
      }

      setStep(skipDetails ? "saved" : "done");
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
    submitEval(r, true);
  };

  const openDetails = () => {
    setStep(2);
    setSubmitError(null);
  };

  if (step === "done") {
    return (
      <div className="px-4 sm:px-6 py-6 text-center border-t border-kg-sep-2" aria-live="polite">
        <div className="mx-auto mb-3 w-8 h-8 rounded-full border border-kg-success/35 bg-kg-success-bg flex items-center justify-center text-kg-success">
          <IconCheck className="w-4 h-4" />
        </div>
        <p className="text-footnote text-kg-text-2 font-sans-zh font-medium">{t.evaluation.doneTitle}</p>
        <p className="mt-1 text-caption text-kg-text-3 font-sans-zh max-w-sm mx-auto leading-relaxed">{t.evaluation.doneSubline}</p>
      </div>
    );
  }

  if (step === "saved" && rating) {
    return (
      <div className="px-4 sm:px-6 py-5 flex flex-col gap-4 border-t border-kg-sep-2" aria-live="polite">
        <div className="flex items-center justify-center gap-2.5 text-center">
          <div className={`w-5 h-5 flex items-center justify-center rounded-full ${ratingToneClass[rating]}`}>
            {ratingIcon[rating]}
          </div>
          <span className="text-footnote font-sans-zh text-kg-text-2">{t.evaluation.savedTitle}</span>
          <span className={`px-2.5 py-1 text-caption font-sans-zh font-medium rounded-full border ${ratingToneClass[rating]}`}>
            {ratingLabel[rating]}
          </span>
        </div>

        <p className="text-footnote text-kg-text-2 font-sans-zh leading-relaxed text-center max-w-sm mx-auto">
          {t.evaluation.savedSubline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2">
          <button
            onClick={openDetails}
            disabled={submitting}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-footnote font-sans-zh font-medium bg-kg-blue/10 text-kg-blue hover:bg-kg-blue hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t.evaluation.addDetails}
          </button>
          <button
            onClick={() => setStep("done")}
            disabled={submitting}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-footnote font-sans-zh font-medium text-kg-text-3 hover:bg-kg-bg-2 hover:text-kg-text transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t.evaluation.finish}
          </button>
        </div>

        <p className="text-caption text-kg-text-4 font-sans-zh text-center max-w-xs mx-auto leading-relaxed">
          {t.evaluation.whyDetails}
        </p>
      </div>
    );
  }

  if (step === 2 && rating) {
    return (
      <div className="px-4 sm:px-6 py-5 flex flex-col gap-4 border-t border-kg-sep-2" aria-live="polite">
        <div className="flex items-center justify-center gap-2.5">
          <div className={`w-5 h-5 flex items-center justify-center rounded-full ${ratingToneClass[rating]}`}>
            {ratingIcon[rating]}
          </div>
          <span className="text-footnote font-sans-zh text-kg-text-2">{t.evaluation.yourRating}</span>
          <span className={`px-2.5 py-1 text-caption font-sans-zh font-medium rounded-full border ${ratingToneClass[rating]}`}>
            {ratingLabel[rating]}
          </span>
        </div>

        <p className="text-footnote text-kg-text-3 font-sans-zh text-center max-w-sm mx-auto leading-relaxed">
          {t.evaluation.detailIntro}
        </p>

        {submitError && (
          <div className="rounded-xl border border-kg-layer1-sep bg-kg-layer1-bg px-3.5 py-3 text-footnote text-kg-layer1-text font-sans-zh flex items-start gap-2">
            <IconAlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-kg-layer1" />
            <span>{submitError}</span>
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer px-3.5 py-3 hover:bg-kg-bg-2/50 rounded-xl border border-transparent hover:border-kg-sep/50 transition-colors">
          <input
            type="checkbox"
            checked={intentMismatch}
            onChange={(e) => setIntentMismatch(e.target.checked)}
            disabled={submitting}
            className="w-4 h-4 accent-(--kg-blue) cursor-pointer mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-footnote font-sans-zh text-kg-text-2">{t.evaluation.intentMismatch}</span>
            <span className="text-caption font-sans-zh text-kg-text-4">{t.evaluation.intentMismatchHint}</span>
          </div>
        </label>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 px-1">
            <label className="text-footnote font-sans-zh text-kg-text-3">{t.evaluation.betterExpressionLabel}</label>
            <span className="text-mono-label font-mono text-kg-text-4">{userCorrection.length}/2000</span>
          </div>
          <textarea
            value={userCorrection}
            onChange={(e) => setUserCorrection(e.target.value)}
            maxLength={2000}
            disabled={submitting}
            placeholder={t.evaluation.betterExpressionPlaceholder}
            className={`${textareaBaseClass} font-sans-jp`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 px-1">
            <label className="text-footnote font-sans-zh text-kg-text-3">{t.evaluation.feedbackLabel}</label>
            <span className="text-mono-label font-mono text-kg-text-4">{feedbackNote.length}/500</span>
          </div>
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            maxLength={500}
            disabled={submitting}
            placeholder={t.evaluation.feedbackPlaceholder}
            className={`${textareaBaseClass} min-h-21 font-sans-zh`}
          />
        </div>

        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={() => submitEval(rating, false)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-footnote font-sans-zh font-medium bg-kg-blue text-white hover:bg-kg-blue-hover active:bg-kg-blue-pressed disabled:opacity-60 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? t.evaluation.submitting : t.evaluation.submit}
          </button>
          <button
            onClick={() => setStep("saved")}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-footnote font-sans-zh text-kg-text-2 hover:bg-kg-bg-2 border border-transparent hover:border-kg-sep hover:text-kg-text disabled:opacity-60 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {t.evaluation.back}
          </button>
        </div>
      </div>
    );
  }

  // Step 1
  return (
    <div className="px-4 sm:px-6 py-6 flex flex-col items-center gap-4 border-t border-kg-sep-2">
      <div className="text-center space-y-1.5">
        <p className="text-footnote text-kg-text-2 font-sans-zh font-medium text-center max-w-sm leading-relaxed">
          {t.evaluation.question}
        </p>
        <p className="text-caption text-kg-text-3 font-sans-zh text-center max-w-sm leading-relaxed">
          {t.evaluation.quickHint}
        </p>
      </div>

      <div className="w-full max-w-xl flex flex-wrap justify-center gap-2">
        <button
          onClick={() => handleQuickRate("accurate")}
          disabled={submitting}
          className={`px-4 py-2 text-footnote font-sans-zh border border-kg-sep rounded-xl bg-kg-bg transition-colors cursor-pointer flex items-center justify-center gap-2 text-kg-text disabled:opacity-60 disabled:cursor-not-allowed ${quickRateButtonClass.accurate}`}
        >
          <IconCheck className="w-4 h-4" />
          <span>{t.evaluation.accurate}</span>
        </button>
        <button
          onClick={() => handleQuickRate("partial")}
          disabled={submitting}
          className={`px-4 py-2 text-footnote font-sans-zh border border-kg-sep rounded-xl bg-kg-bg transition-colors cursor-pointer flex items-center justify-center gap-2 text-kg-text disabled:opacity-60 disabled:cursor-not-allowed ${quickRateButtonClass.partial}`}
        >
          <IconMinus className="w-4 h-4" />
          <span>{t.evaluation.partial}</span>
        </button>
        <button
          onClick={() => handleQuickRate("inaccurate")}
          disabled={submitting}
          className={`px-4 py-2 text-footnote font-sans-zh border border-kg-sep rounded-xl bg-kg-bg transition-colors cursor-pointer flex items-center justify-center gap-2 text-kg-text disabled:opacity-60 disabled:cursor-not-allowed ${quickRateButtonClass.inaccurate}`}
        >
          <IconX className="w-4 h-4" />
          <span>{t.evaluation.inaccurate}</span>
        </button>
      </div>
      {submitError && (
        <div className="w-full rounded-xl border border-kg-layer1-sep bg-kg-layer1-bg px-3.5 py-3 text-footnote text-kg-layer1-text font-sans-zh flex items-start gap-2 max-w-sm">
          <IconAlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-kg-layer1" />
          <span>{submitError}</span>
        </div>
      )}
      <p className="text-caption text-kg-text-4 font-sans-zh leading-relaxed text-center max-w-sm">
        {t.evaluation.consent}
      </p>
    </div>
  );
}
