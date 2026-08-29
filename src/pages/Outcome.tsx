import { useNavigate, useOutletContext } from "react-router-dom";
import { useApp } from "@/store";
import TopBar from "@/components/TopBar";

const SUCCESS_LEVELS = [
  { value: 1, label: "Not this time", color: "#ef4444" },
  { value: 2, label: "Partial", color: "#f97316" },
  { value: 3, label: "Mostly", color: "#eab308" },
  { value: 4, label: "Yes", color: "#22c55e" },
  { value: 5, label: "Exceeded", color: "#103a2a" },
];

export default function Outcome() {
  const { tasks, outcomeSuccess, setOutcomeSuccess } = useApp();
  const navigate = useNavigate();
  const ctx = useOutletContext<{ openSidebar: () => void }>();
  const completedTasks = tasks.filter((t) => t.status === "complete");

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Outcome" subtitle="Capture what happened" mode="Chat" onMenuOpen={ctx?.openSidebar} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-8 py-10">
        <div className="w-full max-w-[600px] flex flex-col gap-8">
          {/* Outcome statement */}
          <div className="bg-[#e3eae1] border border-[#103a2a]/10 rounded-[14px] p-5">
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#103a2a] text-[11px] tracking-[0.6px] mb-2">INTENDED OUTCOME</p>
            <p className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[20px] leading-snug">
              Six-slide meeting deck, confirmed opening ask and three follow-up actions.
            </p>
          </div>

          {/* Tasks summary */}
          <div>
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#58615c] text-[11px] tracking-[0.6px] mb-3">
              COMPLETED · {completedTasks.length}/{tasks.length}
            </p>
            <div className="flex flex-col gap-2">
              {tasks.map((t) => (
                <div key={t.id} className={`flex items-center gap-3 p-3 rounded-[10px] ${t.status === "complete" ? "bg-[#faf8f4]" : "bg-transparent opacity-50"}`}>
                  <div className={`size-2 rounded-full shrink-0 ${t.status === "complete" ? "bg-[#22c55e]" : "bg-[#dad7ce]"}`} />
                  <p className={`font-['Inter:Regular',sans-serif] font-normal text-[13px] ${t.status === "complete" ? "text-[#171b18]" : "text-[#a0b2a8] line-through"}`}>
                    {t.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Success level */}
          <div>
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#58615c] text-[11px] tracking-[0.6px] mb-3">
              DID YOU ACHIEVE THE OUTCOME?
            </p>
            <div className="flex gap-2 flex-wrap">
              {SUCCESS_LEVELS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setOutcomeSuccess(s.value)}
                  className={`h-9 px-4 rounded-[10px] font-['Inter:Medium',sans-serif] font-medium text-[13px] border transition-all ${
                    outcomeSuccess === s.value
                      ? "border-transparent text-white"
                      : "border-[#dad7ce] text-[#58615c] hover:border-[#103a2a]/30 bg-[#faf8f4]"
                  }`}
                  style={outcomeSuccess === s.value ? { background: s.color } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA row */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/learn")}
              disabled={!outcomeSuccess}
              className={`flex-1 h-11 rounded-[11px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all ${
                outcomeSuccess
                  ? "bg-[#103a2a] text-[#f7f2e8] hover:bg-[#1a4a36]"
                  : "bg-[#dad7ce] text-[#a0b2a8] cursor-not-allowed"
              }`}
            >
              Review learning →
            </button>
            <button
              onClick={() => navigate("/")}
              className="h-11 px-5 rounded-[11px] border border-[#dad7ce] font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#58615c] hover:border-[#103a2a]/30 transition-all bg-[#faf8f4]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
