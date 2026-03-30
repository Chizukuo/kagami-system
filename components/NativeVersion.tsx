"use client";

interface Props {
  nativeVersion: string;
}

export default function NativeVersion({ nativeVersion }: Props) {
  return (
    <div className="mt-6 bg-kg-bg-2 border border-kg-sep rounded-xl p-6 shadow-sm interaction-lift">
      <span className="inline-block bg-[var(--kg-text)] text-kg-bg text-[11px] font-bold px-3 py-1.5 rounded-full mb-4 font-sans-jp">
        母語者版本
      </span>
      <p className="text-[20px] font-bold text-kg-text mb-4 whitespace-pre-wrap leading-[1.8] font-sans-jp">
        {nativeVersion}
      </p>
      <div className="border-t border-kg-sep pt-3">
        <p className="text-[13px] text-kg-text-3 font-sans-jp">
          以上は母語者が自然に言う表現です
        </p>
      </div>
    </div>
  );
}
