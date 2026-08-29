import { useNavigate } from "react-router-dom";
import { useApp, Task, TaskStatus } from "@/store";

const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  complete: { label: "Complete", color: "text-[#22c55e]", dot: "bg-[#22c55e]" },
  active: { label: "Active", color: "text-[#103a2a]", dot: "bg-[#103a2a]" },
  blocked: { label: "Blocked", color: "text-[#ef4444]", dot: "bg-[#ef4444]" },
  ready: { label: "Ready", color: "text-[#a0b2a8]", dot: "bg-[#a0b2a8]" },
};

function TaskRow({ task }: { task: Task }) {
  const { setTaskStatus } = useApp();
  const s = STATUS_LABELS[task.status];

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#dad7ce]/50 last:border-0">
      <div className={`size-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-['Inter:Medium',sans-serif] font-medium text-[13px] ${task.status === "complete" ? "line-through text-[#a0b2a8]" : "text-[#171b18]"}`}>
          {task.label}
        </p>
        <p className={`font-['Inter:Regular',sans-serif] font-normal text-[11px] mt-0.5 ${s.color}`}>{s.label}</p>
      </div>
      {task.status === "active" && (
        <button
          onClick={() => setTaskStatus(task.id, "complete")}
          className="shrink-0 h-7 px-2.5 rounded-lg bg-[#103a2a] text-[#f7f2e8] text-[11px] font-['Inter:Medium',sans-serif] font-medium hover:bg-[#1a4a36] transition-colors"
        >
          Done
        </button>
      )}
      {task.status === "ready" && (
        <button
          onClick={() => setTaskStatus(task.id, "active")}
          className="shrink-0 h-7 px-2.5 rounded-lg border border-[#103a2a] text-[#103a2a] text-[11px] font-['Inter:Medium',sans-serif] font-medium hover:bg-[#103a2a]/5 transition-colors"
        >
          Start
        </button>
      )}
    </div>
  );
}

export default function WorkPanel({ onClose }: { onClose: () => void }) {
  const { tasks } = useApp();
  const navigate = useNavigate();
  const completed = tasks.filter((t) => t.status === "complete").length;

  return (
    <div className="w-[320px] shrink-0 border-l border-[#dad7ce] bg-[#faf8f4] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#dad7ce]/50">
        <div>
          <h2 className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[18px] leading-none">Work session</h2>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[12px] mt-1">Investor meeting · Thursday</p>
        </div>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-[#58615c]"
          aria-label="Close work panel"
        >
          <svg fill="none" viewBox="0 0 14 14" className="size-3.5">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Outcome */}
      <div className="mx-5 mt-4 p-3.5 rounded-[12px] bg-[#e3eae1] border border-[#103a2a]/10">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#103a2a] text-[11px] tracking-[0.6px] mb-1.5">OUTCOME</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#103a2a] text-[13px] leading-[1.4]">
          Six-slide meeting deck, confirmed opening ask and three follow-up actions.
        </p>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 mt-4">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#58615c] text-[11px] tracking-[0.6px] mb-2">
          TASKS · {completed}/{tasks.length}
        </p>
        <div>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5 border-t border-[#dad7ce]/50">
        <button
          onClick={() => navigate("/outcome")}
          className="w-full h-10 rounded-[10px] bg-[#103a2a] text-[#f7f2e8] font-['Inter:Medium',sans-serif] font-medium text-[13px] hover:bg-[#1a4a36] transition-colors"
        >
          Capture outcome →
        </button>
      </div>
    </div>
  );
}
