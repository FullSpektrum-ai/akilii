import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import StatusFooter from "@/components/StatusFooter";

const OUTCOMES = [
  {
    id: "followup",
    label: "Secure a follow-up meeting",
    desc: "The investor agrees to a second meeting within two weeks.",
  },
  {
    id: "thesis",
    label: "Validate the investment thesis",
    desc: "Leave with explicit confirmation that the thesis resonates.",
  },
  {
    id: "intro",
    label: "Ask for a specific introduction",
    desc: "Walk out with one warm introduction to a strategic partner.",
  },
];

export default function Discover() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Define outcome" subtitle="Set the goal for this session" mode="Home" />

      <div className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-8 gap-6">
        <div className="flex flex-col gap-2 items-center text-center max-w-[520px]">
          <p className="text-[24px]" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
            What&apos;s the goal for Thursday&apos;s meeting?
          </p>
          <p className="font-normal text-[14px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
            Akilii will structure the session around the outcome you choose.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[520px]">
          {OUTCOMES.map((o) => {
            const sel = selected === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className="flex items-start gap-4 p-4 rounded-[16px] text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: sel ? "var(--ws-work-outcome-bg)" : "var(--ws-card-bg)",
                  border: `1px solid ${sel ? "var(--ws-heading)" : "var(--ws-border)"}`,
                  outline: sel ? "2px solid var(--ws-heading)" : "none",
                  outlineOffset: 1,
                }}
              >
                <div
                  className="mt-0.5 size-4 rounded-full shrink-0 border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: sel ? "var(--ws-heading)" : "var(--ws-border)",
                    background: sel ? "var(--ws-heading)" : "transparent",
                  }}
                >
                  {sel && <div className="size-1.5 rounded-full" style={{ background: "var(--ws-send-text)" }} />}
                </div>
                <div>
                  <p className="font-semibold text-[14px] mb-0.5" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-text)" }}>
                    {o.label}
                  </p>
                  <p className="font-normal text-[13px] leading-[1.4]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
                    {o.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <button
            onClick={() => navigate("/chat")}
            className="mt-2 h-11 px-8 rounded-[12px] font-medium text-[14px] hover:opacity-90 transition-opacity"
            style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
          >
            Start session →
          </button>
        )}
      </div>

      <div className="hidden lg:block">
        <StatusFooter />
      </div>
    </div>
  );
}
