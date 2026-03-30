"use client";

interface Props {
  nativeVersion: string;
}

export default function NativeVersion({ nativeVersion }: Props) {
  return (
    <div className="my-10 relative px-6 py-10 md:px-10 md:py-14 bg-white border-y border-kg-sep-2 text-center shadow-sm">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kg-bg px-4">
        <span className="text-[11px] uppercase tracking-widest font-mono text-kg-blue font-bold">
          Native Target
        </span>
      </div>
      
      <p className="text-3xl md:text-4xl lg:text-[40px] text-kg-text whitespace-pre-wrap leading-[1.7] font-display-jp tracking-wide" style={{ fontWeight: 300 }}>
        {nativeVersion}
      </p>
      
      <div className="mt-8 flex flex-col items-center">
        <div className="w-10 h-[1px] bg-kg-sep mb-5"></div>
        <p className="text-[16px] font-display italic text-kg-text-3 tracking-wide">
          As expressed by a native speaker.
        </p>
      </div>
    </div>
  );
}
