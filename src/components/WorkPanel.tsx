import { useNavigate } from "react-router-dom";
import { useApp, Task, TaskStatus } from "@/store";

const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; dotColor: string }> = {
  complete: { label: "Complete", color: "#22c55e", dotColor: "#22c55e" },
  active:   { label: "Active",   color: "var(--ws-heading)", dotColor: "var(--ws-heading)" },
  blocked:  { label: "Blocked",  color: "#ef4444", dotColor: "#ef4444" },
  ready:    { label: "Ready",    color: "var(--ws-secondary)", dotColor: "var(--ws-secondary)" },
};

function TaskRow({ task }: { task: Task }) {
  const { setTaskStatus } = useApp();
  const s = STATUS_LABELS[task.status];

  return (
    <div className="flex items-start gap-3 py-3 last:border-0" style={{ borderBottom: "1px solid var(--ws-border-alpha)" }}>
      <div className="size-2 rounded-full mt-1.5 shrink-0" style={{ background: s.dotColor }} />
      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-[13px]"
          style={{
            fontFamily: "'Inter:Medium', sans-serif",
            color: task.status === "complete" ? "var(--ws-secondary)" : "var(--ws-text)",
            textDecoration: task.status === "complete" ? "line-through" : "none",
          }}
        >
          {task.label}
        </p>
        <p className="font-normal text-[11px] mt-0.5" style={{ fontFamily: "'Inter:Regular', sans-serif", color: s.color }}>
          {s.label}
        </p>
      </div>
      {task.status === "active" && (
        <button
          onClick={() => setTaskStatus(task.id, "complete")}
          className="shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-medium hover:opacity-80 transition-opacity"
          style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
        >
          Done
        </button>
      )}
      {task.status === "ready" && (
        <button
          onClick={() => setTaskStatus(task.id, "active")}
          className="shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-medium hover:opacity-80 transition-opacity"
          style={{ border: "1px solid var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-heading)" }}
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
    <div className="w-[320px] shrink-0 flex flex-col h-full" style={{ background: "var(--ws-work-panel-bg)", borderLeft: "1px solid var(--ws-border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--ws-border-alpha)" }}>
        <div>
          <h2
            className="text-[18px] leading-none"
            style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}
          >
            Work session
          </h2>
          <p className="font-normal text-[12px] mt-1" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
            Investor meeting · Thursday
          </p>
        </div>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg transition-colors"
          aria-label="Close work panel"
          style={{ color: "var(--ws-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ws-border-alpha)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg fill="none" viewBox="0 0 14 14" className="size-3.5">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Outcome */}
      <div className="mx-5 mt-4 p-3.5 rounded-[12px]" style={{ background: "var(--ws-work-outcome-bg)", border: "1px solid var(--ws-border-alpha)" }}>
        <p className="font-semibold text-[11px] tracking-[0.6px] mb-1.5" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-heading)" }}>
          OUTCOME
        </p>
        <p className="font-normal text-[13px] leading-[1.4]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-heading)" }}>
          Six-slide meeting deck, confirmed opening ask and three follow-up actions.
        </p>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 mt-4">
        <p className="font-semibold text-[11px] tracking-[0.6px] mb-2" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-secondary)" }}>
          TASKS · {completed}/{tasks.length}
        </p>
        <div>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5" style={{ borderTop: "1px solid var(--ws-border-alpha)" }}>
        <button
          onClick={() => navigate("/outcome")}
          className="w-full h-10 rounded-[10px] font-medium text-[13px] hover:opacity-90 transition-opacity"
          style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
        >
          Capture outcome →
        </button>
      </div>
    </div>
  );
}
