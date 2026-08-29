import { useState, useRef, KeyboardEvent } from "react";
import svgPaths from "../../imports/svg-eva1h3yjak";
import { useApp } from "@/store";

interface ComposerProps {
  onSend?: (text: string) => void;
  placeholder?: string;
  mobile?: boolean;
}

export default function Composer({
  onSend,
  placeholder = "Ask akilii anything or select a suggestion above...",
  mobile,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming, sendMessage } = useApp();

  async function handleSend() {
    const text = value.trim();
    if (!text || isStreaming) return;
    setValue("");
    if (textRef.current) textRef.current.style.height = "auto";
    if (onSend) {
      onSend(text);
    } else {
      await sendMessage(text);
    }
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  const box = (
    <div
      className="canonical-composer-box"
    >
      <div
        className="absolute inset-0 rounded-[16px] pointer-events-none"
        style={{ background: `linear-gradient(to bottom, var(--ws-composer-from), var(--ws-composer-to))` }}
      />
      <div className="absolute inset-0 rounded-[16px] pointer-events-none" style={{ border: "1px solid var(--ws-composer-border)" }} />
      <div className="absolute inset-0 rounded-[16px] pointer-events-none shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />

      <div className="composer-inner">
        <div className="composer-hit">
          <button className="composer-icon" aria-label="Attach file">
            <svg fill="none" viewBox="0 0 19 19" className="size-full">
              <path d={svgPaths.p33ad2900} stroke="var(--ws-secondary)" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <textarea
          ref={textRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={1}
          disabled={isStreaming}
          className="composer-input flex-1 min-w-px resize-none bg-transparent text-[14px] outline-none leading-normal not-italic"
          style={{
            fontFamily: "'Inter:Regular', sans-serif",
            fontWeight: 400,
            padding: "8px 0",
            color: "var(--ws-composer-text)",
            opacity: isStreaming ? 0.6 : 1,
          }}
          aria-label="Message input"
        />

        <div className="composer-actions">
          <div className="composer-hit">
            <button className="composer-icon" aria-label="Voice input">
              <svg fill="none" viewBox="0 0 19 19" className="size-full">
                <path d={svgPaths.p11c25c80} stroke="var(--ws-secondary)" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={isStreaming || !value.trim()}
            className="flex items-center justify-center rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08),0px_2px_6px_0px_rgba(8,38,20,0.3)] size-11 relative transition-opacity"
            style={{ opacity: isStreaming || !value.trim() ? 0.4 : 1 }}
            aria-label="Send message"
          >
            <div className="absolute inset-0 rounded-[16px] pointer-events-none" style={{ background: "var(--ws-send-bg)" }} />
            <div className="absolute inset-0 rounded-[16px] pointer-events-none shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]" />
            <div className="flex flex-col items-center justify-center overflow-clip relative size-[16px]">
              {isStreaming ? (
                <div className="size-2.5 rounded-sm" style={{ background: "var(--ws-send-text)" }} />
              ) : (
                <svg fill="none" viewBox="0 0 15 15" className="size-[15px]">
                  <path d={svgPaths.p3827d880} stroke="var(--ws-send-text)" strokeLinecap="round" strokeWidth="2" />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div className="mobile-composer-wrap">
        <div className="flex flex-col gap-2 w-full">
          {box}
        </div>
      </div>
    );
  }

  return (
    <div className="canonical-composer-wrap">
      {box}
    </div>
  );
}
