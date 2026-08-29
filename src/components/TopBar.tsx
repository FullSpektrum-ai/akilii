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
    <header className="canonical-topbar">
      <div className="absolute inset-0 pointer-events-none" style={{ borderBottom: "0.5px solid var(--ws-topbar-bottom-border)" }} />

      <div className="topbar-inner">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            className="lg:hidden flex items-center justify-center size-11 rounded-lg transition-colors shrink-0 -ml-1"
            onClick={onMenuOpen}
            aria-label="Open navigation"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ws-border-alpha)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg fill="none" viewBox="0 0 18 12" className="w-[18px] h-3">
              <path d="M0 1h18M0 6h18M0 11h18" stroke="var(--ws-heading)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex flex-col gap-[4px] min-w-0">
            <h1
              className="topbar-title"
              style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="font-normal text-[13px] whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden xl:flex">
          <div
            className="drop-shadow-[0px_1px_2px_rgba(0,0,0,0.04)] flex gap-[6px] items-center px-3 py-[6px] relative rounded-full shrink-0"
            style={{ background: "var(--ws-pill-bg)" }}
          >
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: "1px solid var(--ws-pill-border)" }} />
            <div className="flex flex-col items-center justify-center overflow-clip size-[14px]">
              <svg fill="none" viewBox="0 0 13 13" className="size-[13px]">
                <g clipPath="url(#cl-tl)">
                  <path d={svgPaths.p32b4a500} stroke="var(--ws-pill-text)" strokeLinecap="round" strokeWidth="2" />
                </g>
                <defs><clipPath id="cl-tl"><rect fill="white" height="13" width="13" /></clipPath></defs>
              </svg>
            </div>
            <p className="font-medium text-[13px] whitespace-nowrap" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-pill-text)" }}>
              Private and protected
            </p>
          </div>
        </div>

        <div className="topbar-controls">
          <span className="status-pill">Online</span>
          <ExperiencePicker mode={mode} />
        </div>
      </div>
    </header>
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
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-11 flex gap-[6px] items-center pl-3 pr-[10px] min-w-[96px] rounded-lg transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ws-border-alpha)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <p className="font-semibold opacity-85 text-[13px] whitespace-nowrap" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-text)" }}>
          {mode}
        </p>
        <svg fill="none" viewBox="0 0 12 12" className="size-3 shrink-0">
          <g opacity="0.7">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--ws-secondary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          </g>
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+4px)] right-0 z-30 rounded-[12px] shadow-[0px_4px_16px_rgba(0,0,0,0.18)] overflow-hidden min-w-[160px]"
          role="listbox"
          style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-border)" }}
        >
          {modes.map((m) => (
            <button
              key={m.value}
              role="option"
              aria-selected={mode === m.value}
              onClick={() => choose(m.value)}
              className="w-full flex flex-col gap-0.5 px-4 py-2.5 text-left transition-colors"
              style={{ background: mode === m.value ? "var(--ws-border-alpha)" : "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ws-border-alpha)")}
              onMouseLeave={(e) => { e.currentTarget.style.background = mode === m.value ? "var(--ws-border-alpha)" : "transparent"; }}
            >
              <p
                className="font-semibold text-[13px]"
                style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: mode === m.value ? "var(--ws-heading)" : "var(--ws-text)" }}
              >
                {m.label}
              </p>
              <p className="font-normal text-[11px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
                {m.sub}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
