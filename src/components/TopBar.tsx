import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import svgPaths from "../../imports/svg-eva1h3yjak";

type Mode = "Home" | "Chat" | "Work";

interface TopBarProps {
  title: string;
  subtitle?: string;
  mode: Mode;
  onMenuOpen?: () => void;
}

export default function TopBar({ title, subtitle, mode, onMenuOpen }: TopBarProps) {
  return (
    <div className="relative shrink-0 w-full">
      {/* bottom border hairline */}
      <div className="absolute inset-0 border-b border-[#dad7ce] border-b-[0.5px] pointer-events-none" />

      <div className="flex items-center justify-between pb-5 pt-6 px-8">

        {/* Left: hamburger (mobile only) + title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            className="lg:hidden flex items-center justify-center size-11 rounded-lg hover:bg-black/5 transition-colors shrink-0 -ml-1"
            onClick={onMenuOpen}
            aria-label="Open navigation"
          >
            <svg fill="none" viewBox="0 0 18 12" className="w-[18px] h-3">
              <path d="M0 1h18M0 6h18M0 11h18" stroke="#103A2A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex flex-col gap-[4px] min-w-0">
            <h1 className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[28px] leading-none whitespace-nowrap">{title}</h1>
            {subtitle && (
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[13px] whitespace-nowrap">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: Private and protected pill */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
          <div className="bg-[#f7f2e8] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.04)] flex gap-[6px] items-center px-3 py-[6px] relative rounded-full shrink-0">
            <div className="absolute inset-0 border border-[#dad7ce] rounded-full pointer-events-none" />
            {/* Lock icon */}
            <div className="flex flex-col items-center justify-center overflow-clip size-[14px]">
              <svg fill="none" viewBox="0 0 13 13" className="size-[13px]">
                <g clipPath="url(#cl-tl)">
                  <path d={svgPaths.p32b4a500} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
                </g>
                <defs><clipPath id="cl-tl"><rect fill="white" height="13" width="13" /></clipPath></defs>
              </svg>
            </div>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#103a2a] text-[13px] whitespace-nowrap">Private and protected</p>
          </div>
        </div>

        {/* Right: Experience mode picker dropdown */}
        <div className="flex-1 flex justify-end">
          <ExperiencePicker mode={mode} />
        </div>
      </div>
    </div>
  );
}

function ExperiencePicker({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function choose(m: Mode) {
    setOpen(false);
    if (m === "Home") navigate("/");
    else if (m === "Chat") navigate("/chat");
    else navigate("/work");
  }

  const modes: { value: Mode; label: string; sub: string }[] = [
    { value: "Home", label: "Home", sub: "New session" },
    { value: "Chat", label: "Chat", sub: "Conversation" },
    { value: "Work", label: "Work", sub: "Tasks + chat" },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-11 flex gap-[6px] items-center pl-3 pr-[10px] min-w-[96px] hover:bg-black/4 rounded-lg transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold opacity-85 text-[#171b18] text-[13px] whitespace-nowrap">{mode}</p>
        <svg fill="none" viewBox="0 0 12 12" className="size-3 shrink-0">
          <g opacity="0.7">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#58615C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          </g>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-[calc(100%+4px)] right-0 z-30 bg-white border border-[#dad7ce] rounded-[12px] shadow-[0px_4px_16px_rgba(0,0,0,0.12)] overflow-hidden min-w-[160px]"
          role="listbox"
        >
          {modes.map((m) => (
            <button
              key={m.value}
              role="option"
              aria-selected={mode === m.value}
              onClick={() => choose(m.value)}
              className={`w-full flex flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-[#f5f1ea] transition-colors ${
                mode === m.value ? "bg-[#f5f1ea]" : ""
              }`}
            >
              <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[13px] ${mode === m.value ? "text-[#103a2a]" : "text-[#171b18]"}`}>
                {m.label}
              </p>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[11px]">{m.sub}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
