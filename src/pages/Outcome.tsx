import { useNavigate } from "react-router-dom";
import { useApp } from "@/store";
import TopBar from "@/components/TopBar";
import StatusFooter from "@/components/StatusFooter";

const SUCCESS_LEVELS = [
  { value: 1, label: "Not this time", sub: "The meeting didn't land as hoped." },
  { value: 2, label: "Partial",       sub: "Some things went well, others didn't." },
  { value: 3, label: "Mostly",        sub: "Clear progress and a solid result." },
  { value: 4, label: "Yes",           sub: "Exceeded expectations on most fronts." },
  { value: 5, label: "Exceeded",      sub: "Everything clicked — a complete success." },
];

export default function Outcome() {
  const navigate = useNavigate();
  const { outcomeSuccess, setOutcomeSuccess, tasks } = useApp();
  const done = tasks.filter((t) => t.status === "complete").length;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Capture outcome" subtitle="How did the investor meeting go?" mode="Work" />

      <div className="flex-1 overflow-y-auto flex flex-col items-center py-12 px-8 gap-6">
        <div className="flex flex-col gap-2 items-center text-center max-w-[480px]">
          <p className="text-[22px]" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
            How did Thursday go?
          </p>
          <p className="font-normal text-[14px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
            {done} of {tasks.length} tasks completed · Select an outcome level
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[480px]">
          {SUCCESS_LEVELS.map((l) => {
            const sel = outcomeSuccess === l.value;
            return (
              <button
                key={l.value}
                onClick={() => setOutcomeSuccess(l.value)}
                className="flex items-center gap-4 p-4 rounded-[16px] text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: sel ? "var(--ws-work-outcome-bg)" : "var(--ws-card-bg)",
                  border: `1px solid ${sel ? "var(--ws-heading)" : "var(--ws-border)"}`,
                  outline: sel ? `2px solid var(--ws-heading)` : "none",
                  outlineOffset: 1,
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full shrink-0 size-10 font-semibold text-[15px]"
                  style={{
                    background: sel ? "var(--ws-heading)" : "var(--ws-card-icon-bg)",
                    color: sel ? "var(--ws-send-text)" : "var(--ws-secondary)",
                    fontFamily: "'Inter:Semi Bold', sans-serif",
                  }}
                >
                  {l.value}
                </div>
                <div>
                  <p className="font-semibold text-[14px]" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-text)" }}>
                    {l.label}
                  </p>
                  <p className="font-normal text-[13px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
                    {l.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {outcomeSuccess !== null && (
          <button
            onClick={() => navigate("/learn")}
            className="mt-2 h-11 px-8 rounded-[12px] font-medium text-[14px] hover:opacity-90 transition-opacity"
            style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
          >
            Review learning →
          </button>
        )}
      </div>

      <div className="hidden lg:block">
        <StatusFooter />
      </div>
    </div>
  );
}
