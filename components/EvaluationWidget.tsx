"use client";
import { useState } from "react";

interface Props {
  inputText: string;
  inputScene: string;
  grammarCount: number;
  registerCount: number;
  pragmaticsCount: number;
  nativeVersion: string;
  summary: string;
}

type Rating = "accurate" | "partial" | "inaccurate";

export default function EvaluationWidget({
  inputText,
  inputScene,
  grammarCount,
  registerCount,
  pragmaticsCount,
  nativeVersion,
  summary,
}: Props) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 2 optional fields
  const [intentMismatch, setIntentMismatch] = useState(false);
  const [userCorrection, setUserCorrection] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");

  const submitEval = async (currentRating: Rating, skipDetails = false) => {
    setSubmitting(true);
    try {
      await fetch("/api/evaluate", {
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
        }),
      });
    } catch {
      // Silent fail — evaluation is non-critical
    }
    setSubmitting(false);
    setStep("done");
  };

  const handleQuickRate = (r: Rating) => {
    setRating(r);
    // If "accurate" — likely no detail needed, but still show Step 2
    setStep(2);
  };

  if (step === "done") {
    return (
      <div className="mt-8 py-4 text-center">
        <p className="text-[14px] text-kg-text-3 font-sans-zh">感谢您的反馈！</p>
      </div>
    );
  }

  if (step === 2 && rating) {
    return (
      <div className="mt-8 pt-6 border-t border-kg-sep-2 flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[13px] font-sans-zh text-kg-text-3">您的评分：</span>
          <span className="text-[13px] font-sans-zh font-bold text-kg-text">
            {rating === "accurate" ? "👍 准确" : rating === "partial" ? "🤏 部分准确" : "👎 不准确"}
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer self-start">
          <input
            type="checkbox"
            checked={intentMismatch}
            onChange={(e) => setIntentMismatch(e.target.checked)}
            className="w-4 h-4 accent-[var(--kg-blue)] cursor-pointer"
          />
          <span className="text-[14px] font-sans-zh text-kg-text-2">母语版本没有表达我想说的意思</span>
        </label>

        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-sans-zh text-kg-text-3">您认为更自然的表达是？（选填）</label>
          <textarea
            value={userCorrection}
            onChange={(e) => setUserCorrection(e.target.value)}
            maxLength={2000}
            placeholder="用日语写出您认为更自然的版本..."
            className="w-full min-h-[80px] p-3 bg-kg-bg border border-kg-sep rounded-lg text-[14px] font-sans-jp text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-sans-zh text-kg-text-3">其他反馈（选填）</label>
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            maxLength={500}
            placeholder="例如：第二个语体问题我觉得诊断错了..."
            className="w-full min-h-[60px] p-3 bg-kg-bg border border-kg-sep rounded-lg text-[14px] font-sans-zh text-kg-text placeholder-kg-text-4 resize-y outline-none focus:border-kg-blue transition-colors"
          />
        </div>

        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={() => submitEval(rating)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-[13px] font-sans-zh font-medium bg-kg-blue text-white hover:bg-kg-blue-hover disabled:opacity-50 transition-colors cursor-pointer"
          >
            {submitting ? "提交中..." : "提交反馈"}
          </button>
          <button
            onClick={() => submitEval(rating, true)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-[13px] font-sans-zh text-kg-text-3 border border-kg-sep hover:bg-kg-bg-2 disabled:opacity-50 transition-colors cursor-pointer"
          >
            跳过
          </button>
        </div>
      </div>
    );
  }

  // Step 1
  return (
    <div className="mt-8 pt-6 border-t border-kg-sep-2 flex flex-col items-center gap-4">
      <p className="text-[14px] text-kg-text-2 font-sans-zh font-medium">这个诊断准确吗？</p>
      <div className="flex gap-3">
        <button
          onClick={() => handleQuickRate("accurate")}
          className="px-4 py-2 rounded-lg text-[13px] font-sans-zh border border-kg-sep hover:border-kg-success hover:bg-kg-success-bg transition-colors cursor-pointer"
        >
          👍 准确
        </button>
        <button
          onClick={() => handleQuickRate("partial")}
          className="px-4 py-2 rounded-lg text-[13px] font-sans-zh border border-kg-sep hover:border-kg-blue hover:bg-kg-blue-bg transition-colors cursor-pointer"
        >
          🤏 部分准确
        </button>
        <button
          onClick={() => handleQuickRate("inaccurate")}
          className="px-4 py-2 rounded-lg text-[13px] font-sans-zh border border-kg-sep hover:border-kg-layer1 hover:bg-kg-layer1-bg transition-colors cursor-pointer"
        >
          👎 不准确
        </button>
      </div>
      <p className="text-[11px] text-kg-text-4 font-sans-zh leading-relaxed text-center max-w-xs">
        提交即表示同意将输入文本和诊断结果匿名用于学术研究
      </p>
    </div>
  );
}
