"use client";

import { useState } from "react";
import { getI18n } from "@/lib/i18n";
import { UILanguage, NativeVersion as NativeVersionType } from "@/lib/types";
import AudioPlayer from "./AudioPlayer";

interface Props {
  nativeVersions: NativeVersionType[];
  lang: UILanguage;
  scene?: string;
}

export default function NativeVersion({ nativeVersions, lang, scene }: Props) {
  const t = getI18n(lang);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!nativeVersions || nativeVersions.length === 0) return null;

  const safeIndex = Math.min(activeIndex, nativeVersions.length - 1);
  const current = nativeVersions[safeIndex];
  const fullText = current.sentences.join("");

  return (
    <div className="my-10 relative px-6 py-10 md:px-10 md:py-14 bg-kg-bg border-y border-kg-sep-2 text-center shadow-sm">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kg-bg px-4 flex items-center gap-3">
        <span className="text-mono-label uppercase tracking-widest font-mono text-kg-blue font-bold">
          {t.result.nativeTarget}
        </span>
      </div>
      
      <div className="flex flex-col gap-6 relative group" role="tabpanel" aria-labelledby={`native-tab-${activeIndex}`}>
        <div className="flex flex-col gap-3">
          {current.sentences.map((line, index) => (
            <p
              key={`${index}-${line.slice(0, 16)}`}
              className="text-3xl md:text-4xl lg:text-[40px] text-kg-text whitespace-pre-wrap leading-[1.7] font-display-jp tracking-wide"
              style={{ fontWeight: 300 }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Minimal Controls */}
        <div className="mt-4 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
             {nativeVersions.length > 1 && (
               <div className="flex p-1 bg-kg-bg-2 rounded-lg border border-kg-sep-2" role="tablist" aria-label="Version variations">
                 {nativeVersions.map((v, i) => (
                   <button
                     key={i}
                     id={`native-tab-${i}`}
                     role="tab"
                     aria-selected={i === activeIndex}
                     onClick={() => setActiveIndex(i)}
                     className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-all ${
                       i === activeIndex
                         ? "bg-white text-kg-blue shadow-sm"
                         : "text-kg-text-4 hover:text-kg-text-2"
                     }`}
                   >
                     {v.label}
                   </button>
                 ))}
               </div>
             )}
             <AudioPlayer text={fullText} scene={scene} className="bg-white border border-kg-sep-2 shadow-sm" />
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-px bg-kg-sep mb-5"></div>
            <p className="text-callout font-display italic text-kg-text-3 tracking-wide">
              {t.result.nativeSubline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
