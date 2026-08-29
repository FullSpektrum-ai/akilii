import { useNavigate } from "react-router-dom";
import { useApp, type Task, type TaskStatus } from "@/store";

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
    <aside className="canonical-side-panel" style={{ background: "var(--ws-work-panel-bg)" }}>
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-icon">work</div>
          <div>
            <h2
              className="panel-title"
              style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}
            >
              Work session
            </h2>
            <p className="font-normal text-[12px] mt-1" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
              How akilii is structuring this session
            </p>
          </div>
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

      <div className="panel-stats">
        <div><strong>{completed}</strong><span>confirmed</span></div>
        <div><strong>{tasks.length - completed}</strong><span>open</span></div>
        <div><strong>1</strong><span>session</span></div>
      </div>

      <div className="panel-card outcome-card" style={{ background: "var(--ws-work-outcome-bg)", border: "1px solid var(--ws-border-alpha)" }}>
        <p className="font-semibold text-[11px] tracking-[0.6px] mb-1.5" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-heading)" }}>
          OUTCOME
        </p>
        <p className="font-normal text-[13px] leading-[1.4]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-heading)" }}>
          Six-slide meeting deck, confirmed opening ask and three follow-up actions.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 mt-4">
        <p className="font-semibold text-[11px] tracking-[0.6px] mb-2" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-secondary)" }}>
          TASKS · {completed}/{tasks.length}
        </p>
        <div>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      </div>

      <div className="panel-footer">
        <button
          onClick={() => navigate("/outcome")}
          className="w-full h-10 rounded-[10px] font-medium text-[13px] hover:opacity-90 transition-opacity"
          style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
        >
          Capture outcome
        </button>
      </div>
    </aside>
  );
}
