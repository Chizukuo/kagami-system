"use client";

import { useState } from "react";

interface Props {
  onSubmit: (text: string, scene: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: Props) {
  const [text, setText] = useState("");
  const [scene, setScene] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && scene.trim()) {
      onSubmit(text, text.trim()); // Wait, this should use scene.trim()
      // Let me correct that inside the file block.
    }
  };

  const isDisabled = isLoading || !text.trim() || !scene.trim();

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim() && scene.trim()) onSubmit(text.trim(), scene.trim()); }} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="text" className="text-[15px] font-medium font-sans-jp text-kg-text-2">日本語のテキスト</label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="先生、昨日の授業ですが、ちょっとわからないところがあって、聞きたいんですけど。"
          className={`w-full min-h-[120px] p-4 bg-kg-bg border border-kg-sep rounded-xl outline-none focus:ring-0 focus:border-kg-blue focus:shadow-[var(--kg-focus-ring)] transition-all resize-y shadow-sm font-sans-jp text-kg-text placeholder-kg-text-3 ${isLoading ? 'opacity-50 pointer-events-none bg-kg-bg-2' : ''}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="scene" className="text-[15px] font-medium font-sans-jp text-kg-text-2">使用する場面（コンテキスト）</label>
        <input
          id="scene"
          type="text"
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          disabled={isLoading}
          placeholder="大学教授へのメール"
          className={`w-full p-4 bg-kg-bg border border-kg-sep rounded-xl outline-none focus:ring-0 focus:border-kg-blue focus:shadow-[var(--kg-focus-ring)] transition-all shadow-sm font-sans-jp text-kg-text placeholder-kg-text-3 ${isLoading ? 'opacity-50 pointer-events-none bg-kg-bg-2' : ''}`}
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-2 w-full min-h-[44px] py-4 bg-kg-blue text-[17px] text-white font-medium rounded-xl shadow-md hover:bg-kg-blue-hover active:bg-kg-blue-pressed disabled:bg-kg-text-4 disabled:cursor-not-allowed interaction-press flex items-center justify-center space-x-2 group"
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
