import { useNavigate } from "react-router-dom";
import { useApp } from "@/store";
import TopBar from "@/components/TopBar";
import StatusFooter from "@/components/StatusFooter";

const LEARNING_ITEMS = [
  "Lead with traction data before projections — investors at this stage respond better to evidence.",
  "Keep the opening ask to one sentence. Compound asks create confusion.",
  "The six-slide structure worked. Reuse it for future meetings with minor variations.",
];

export default function Learn() {
  const { learningApproved, approveLearning, dismissLearning } = useApp();
  const navigate = useNavigate();

  if (learningApproved === true) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Learning saved" subtitle="Your next session will reflect this" mode="Work" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div
            className="flex items-center justify-center rounded-full size-16"
            style={{ background: "var(--ws-work-outcome-bg)" }}
          >
            <svg fill="none" viewBox="0 0 24 24" className="size-8">
              <path d="M5 12l5 5L20 7" stroke="var(--ws-heading)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center max-w-sm">
            <p className="text-[22px] mb-2" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
              Learning captured
            </p>
            <p className="font-normal text-[14px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
              Akilii will apply these patterns in future sessions. No external data was written.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="h-11 px-8 rounded-[12px] font-medium text-[14px] hover:opacity-90 transition-opacity"
            style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
          >
            Back to home
          </button>
        </div>
        <div className="hidden lg:block"><StatusFooter /></div>
      </div>
    );
  }

  if (learningApproved === false) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Not saved" subtitle="Memory unchanged" mode="Work" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center max-w-sm">
            <p className="text-[22px] mb-2" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
              No changes made
            </p>
            <p className="font-normal text-[14px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
              Your session learning was not saved. Your memory profile is unchanged.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="h-11 px-8 rounded-[12px] font-medium text-[14px] hover:opacity-90 transition-opacity"
            style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
          >
            Back to home
          </button>
        </div>
        <div className="hidden lg:block"><StatusFooter /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Review learning" subtitle="Approve to update your akilii memory" mode="Work" />

      <div className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-8 gap-6">
        <div className="w-full max-w-[520px] flex flex-col gap-4">
          <div>
            <p className="text-[22px] mb-1" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
              From today&apos;s session
            </p>
            <p className="font-normal text-[13px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
              Akilii identified these patterns. Approve to add them to your memory profile.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {LEARNING_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex gap-3 p-4 rounded-[14px]"
                style={{ background: "var(--ws-card-bg)", border: "1px solid var(--ws-border)" }}
              >
                <div
                  className="flex items-center justify-center rounded-full shrink-0 size-6 mt-0.5"
                  style={{ background: "var(--ws-card-icon-bg)" }}
                >
                  <p className="text-[11px] font-semibold" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-heading)" }}>
                    {i + 1}
                  </p>
                </div>
                <p className="font-normal text-[13px] leading-[1.5]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-text)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-[14px] text-[12px]"
            style={{ background: "var(--ws-work-outcome-bg)", border: "1px solid var(--ws-border-alpha)" }}
          >
            <p className="font-semibold text-[11px] tracking-[0.5px] mb-1" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-heading)" }}>
              PRIVACY NOTE
            </p>
            <p className="font-normal text-[12px] leading-[1.5]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
              Approving stores these patterns locally in your akilii profile. No external write occurs without your explicit confirmation.
            </p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={approveLearning}
              className="flex-1 h-11 rounded-[12px] font-medium text-[14px] hover:opacity-90 transition-opacity"
              style={{ background: "var(--ws-work-task-active)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-send-text)" }}
            >
              Approve and save
            </button>
            <button
              onClick={() => { dismissLearning(); navigate("/"); }}
              className="h-11 px-6 rounded-[12px] font-medium text-[14px] hover:opacity-70 transition-opacity"
              style={{ border: "1px solid var(--ws-border)", fontFamily: "'Inter:Medium', sans-serif", color: "var(--ws-secondary)" }}
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block"><StatusFooter /></div>
    </div>
  );
}
