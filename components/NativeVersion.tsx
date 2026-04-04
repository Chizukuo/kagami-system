"use client";

import { getI18n } from "@/lib/i18n";
import { UILanguage } from "@/lib/types";

interface Props {
  nativeVersion: string[];
  lang: UILanguage;
}

export default function NativeVersion({ nativeVersion, lang }: Props) {
  const t = getI18n(lang);

  const lines = nativeVersion.length > 0 ? nativeVersion : [""];

  return (
    <div className="my-10 relative px-6 py-10 md:px-10 md:py-14 bg-kg-bg border-y border-kg-sep-2 text-center shadow-sm">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kg-bg px-4">
        <span className="text-mono-label uppercase tracking-widest font-mono text-kg-blue font-bold">
          {t.result.nativeTarget}
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {lines.map((line, index) => (
          <p
            key={`${index}-${line.slice(0, 16)}`}
            className="text-3xl md:text-4xl lg:text-[40px] text-kg-text whitespace-pre-wrap leading-[1.7] font-display-jp tracking-wide"
            style={{ fontWeight: 300 }}
          >
            {line}
          </p>
        ))}
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <div className="w-10 h-px bg-kg-sep mb-5"></div>
        <p className="text-callout font-display italic text-kg-text-3 tracking-wide">
          {t.result.nativeSubline}
        </p>
      </div>
    </div>
  );
}
