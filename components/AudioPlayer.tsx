"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  text: string;
  scene?: string;
  className?: string;
}

export default function AudioPlayer({ text, scene, className = "" }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current.removeAttribute('src');
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioUrl && isMounted.current) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setStatus("idle");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, scene]);

  const stopAllPlayback = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch { /* intentional stop */ }
    }
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    if (isMounted.current) setStatus("idle");
  };

  const playLocalTTS = () => {
    if (!window.speechSynthesis) {
      if (isMounted.current) setStatus("error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    
    utterance.onstart = () => isMounted.current && setStatus("playing");
    utterance.onend = () => isMounted.current && setStatus("idle");
    utterance.onerror = () => isMounted.current && setStatus("error");
    
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = async () => {
    if (status === "playing") {
      stopAllPlayback();
      return;
    }

    stopAllPlayback();
    if (isMounted.current) setStatus("loading");

    try {
      let currentUrl = audioUrl;

      if (!currentUrl) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, scene }),
        });

        if (!res.ok) throw new Error(`TTS API failed: ${res.status}`);

        const blob = await res.blob();
        if (blob.size < 100) throw new Error("Audio blob too small");

        currentUrl = URL.createObjectURL(blob);
        if (isMounted.current) setAudioUrl(currentUrl);
      }

      if (!isMounted.current) return;

      const audio = new Audio(currentUrl);
      audioRef.current = audio;
      
      audio.onplay = () => isMounted.current && setStatus("playing");
      audio.onended = () => isMounted.current && setStatus("idle");
      audio.onerror = (e) => {
        console.error("[AudioPlayer] Audio element error:", e);
        if (isMounted.current) playLocalTTS();
      };
      
      try {
        await audio.play();
      } catch (playErr: unknown) {
        // AbortError is expected if we stopped playback intentionally
        if (playErr instanceof Error && playErr.name === "AbortError") {
          console.log("[AudioPlayer] Playback was aborted");
        } else {
          throw playErr;
        }
      }
    } catch (err) {
      console.warn("[AudioPlayer] Backend TTS failed, falling back to local:", err);
      if (isMounted.current) playLocalTTS();
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      disabled={status === "loading"}
      aria-label={status === "playing" ? "Stop" : "Listen"}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
        status === "playing"
          ? "bg-kg-blue text-white shadow-sm"
          : "bg-kg-bg-2 text-kg-text-3 hover:text-kg-blue hover:bg-kg-blue/10"
      } ${className}`}
    >
      {status === "loading" ? (
        <div className="w-3 h-3 border-2 border-kg-blue/30 border-t-kg-blue rounded-full animate-spin"></div>
      ) : status === "playing" ? (
        <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      ) : status === "error" ? (
        <svg aria-hidden="true" className="w-4 h-4 text-red-500 animate-[shake_0.5s_ease-in-out]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ) : (
        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
