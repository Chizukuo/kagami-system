"use client";

import { useEffect, useState } from "react";
import { getI18n } from "@/lib/i18n";
import { UILanguage } from "@/lib/types";

interface Props {
  onSubmit: (text: string, scene: string) => void;
  isLoading: boolean;
  externalText?: string;
  externalScene?: string;
  lang: UILanguage;
}

export default function InputForm({ onSubmit, isLoading, externalText, externalScene, lang }: Props) {
  const [text, setText] = useState("");
  const [scene, setScene] = useState("");
  const t = getI18n(lang);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalText !== undefined) setText(externalText);
  }, [externalText]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalScene !== undefined) setScene(externalScene);
  }, [externalScene]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && scene.trim()) {
      onSubmit(text.trim(), scene.trim());
    }
  };

  const isDisabled = isLoading || !text.trim() || !scene.trim();

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
      <div className={`bg-kg-bg border border-kg-sep rounded-2xl overflow-hidden transition-shadow shadow-sm focus-within:border-kg-blue focus-within:shadow-focus focus-within:ring-1 focus-within:ring-kg-blue ${isLoading ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>

        <div className="relative flex flex-col">
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            disabled={isLoading}
            placeholder={t.input.textPlaceholder}
            aria-label={t.input.textAria}
            className={`w-full min-h-[180px] p-5 pb-8 outline-none resize-none ${lang === 'zh' ? 'font-sans-zh' : 'font-sans-jp'} text-body antialiased text-kg-text placeholder-kg-text-4 bg-transparent leading-[1.625] tracking-[0.01em]`}
          />
          <div className={`absolute bottom-3 right-4 transition-opacity duration-300 ${text.length > 0 ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
            <span className={`text-[13px] leading-none font-mono antialiased transition-colors ${text.length > 1800 ? 'text-kg-layer2 font-medium' : 'text-kg-text-4'}`}>
              {text.length} / 2000
            </span>
          </div>
        </div>

        <div className="h-px bg-kg-sep ml-5" />

        <div className="flex items-center relative group gap-3">
          <label htmlFor="scene" className={`pl-5 py-4 text-subhead font-medium ${lang === 'zh' ? 'font-sans-zh' : 'font-sans-jp'} tracking-tight text-kg-text-2 shrink-0 whitespace-nowrap select-none transition-colors group-focus-within:text-kg-blue`}>
            {t.input.sceneLabel}
          </label>
          <input
            id="scene"
            type="text"
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            maxLength={200}
            disabled={isLoading}
            placeholder={t.input.scenePlaceholder}
            aria-label={t.input.sceneAria}
            className={`w-full py-4 pr-5 outline-none bg-transparent ${lang === 'zh' ? 'font-sans-zh' : 'font-sans-jp'} text-body antialiased text-kg-text placeholder-kg-text-4 leading-normal tracking-[0.01em]`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        aria-label={isLoading ? t.loading : t.input.submit}
        className="mt-2 w-full min-h-touch py-4 bg-kg-blue text-headline text-white font-medium antialiased rounded-2xl shadow-sm hover:shadow-md hover:bg-kg-blue-hover active:bg-kg-blue-pressed active:scale-[0.98] disabled:bg-kg-text-4 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin text-white flex-shrink-0 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
             <span className={lang === 'zh' ? 'font-sans-zh' : 'font-sans-jp'}>
               {t.input.submitting}
             </span>
          </>
        ) : (
          <span className={`${lang === 'zh' ? 'font-sans-zh' : 'font-sans-jp'} animate-[fade-in_0.3s_ease-out_forwards]`}>{t.input.submit}</span>
        )}
      </button>
    </form>
  );
}
