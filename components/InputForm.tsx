"use client";

import { useEffect, useState } from "react";

interface Props {
  onSubmit: (text: string, scene: string) => void;
  isLoading: boolean;
  externalText?: string;
  externalScene?: string;
}

export default function InputForm({ onSubmit, isLoading, externalText, externalScene }: Props) {
  const [text, setText] = useState("");
  const [scene, setScene] = useState("");

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
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="text" className="text-subhead font-medium font-sans-zh text-kg-text-2">日语文本</label>
          <span className={`text-caption font-mono tracking-wider transition-colors ${text.length > 1800 ? 'text-kg-layer2' : text.length > 1500 ? 'text-kg-text-4' : 'text-kg-text-4'}`}>
            {text.length} / 2000
          </span>
        </div>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          disabled={isLoading}
          placeholder="请输入要诊断的日语文本"
          aria-label="诊断日语文本"
          className={`w-full min-h-35 p-4 bg-kg-bg border border-kg-sep rounded-xl outline-none focus:ring-0 focus:border-kg-blue focus:shadow-focus transition-all resize-none shadow-sm font-sans-zh text-subhead text-kg-text placeholder-kg-text-3 ${isLoading ? 'opacity-50 pointer-events-none bg-kg-bg-2' : ''}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="scene" className="text-subhead font-medium font-sans-zh text-kg-text-2">场景（上下文）</label>
          <span className={`text-caption font-mono tracking-wider transition-colors ${scene.length > 180 ? 'text-kg-layer2' : scene.length > 150 ? 'text-kg-text-4' : 'text-kg-text-4'}`}>
            {scene.length} / 200
          </span>
        </div>
        <input
          id="scene"
          type="text"
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          maxLength={200}
          disabled={isLoading}
          placeholder="请输入使用场景或上下文"
          aria-label="使用场景"
          className={`w-full p-4 bg-kg-bg border border-kg-sep rounded-xl outline-none focus:ring-0 focus:border-kg-blue focus:shadow-focus transition-all shadow-sm font-sans-zh text-subhead text-kg-text placeholder-kg-text-3 ${isLoading ? 'opacity-50 pointer-events-none bg-kg-bg-2' : ''}`}
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        aria-label={isLoading ? "分析中" : "診断する"}
        className="mt-4 w-full min-h-touch py-4 bg-kg-blue text-subhead sm:text-headline text-white font-medium rounded-xl shadow-md hover:bg-kg-blue-hover active:bg-kg-blue-pressed disabled:bg-kg-text-4 disabled:cursor-not-allowed interaction-press flex items-center justify-center space-x-2 group"
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-sans-jp">分析中...</span>
          </>
        ) : (
          <span className="font-sans-jp">診断する</span>
        )}
      </button>
    </form>
  );
}
