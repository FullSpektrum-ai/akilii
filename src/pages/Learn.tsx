import { useNavigate, useOutletContext } from "react-router-dom";
import { useApp } from "@/store";
import TopBar from "@/components/TopBar";

export default function Learn() {
  const { learningApproved, approveLearning, dismissLearning } = useApp();
  const navigate = useNavigate();
  const ctx = useOutletContext<{ openSidebar: () => void }>();

  if (learningApproved === true) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Learning" subtitle="Memory updated" mode="Chat" onMenuOpen={ctx?.openSidebar} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-6">
          <div className="size-16 rounded-full bg-[#e3eae1] flex items-center justify-center">
            <svg fill="none" viewBox="0 0 24 24" className="size-8">
              <path d="M5 12l5 5L19 7" stroke="#103A2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center max-w-[480px]">
            <h2 className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[26px] mb-3">Learning approved</h2>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[15px] leading-[1.5]">
              akilii will apply this pattern in future sessions. You can review or withdraw memory at any time in Settings.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="h-11 px-8 rounded-[11px] bg-[#103a2a] text-[#f7f2e8] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1a4a36] transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (learningApproved === false) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Learning" subtitle="Memory unchanged" mode="Chat" onMenuOpen={ctx?.openSidebar} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-6">
          <div className="text-center max-w-[480px]">
            <h2 className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[26px] mb-3">Memory unchanged</h2>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[15px] leading-[1.5]">
              akilii did not record anything from this session. No durable changes were made.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="h-11 px-8 rounded-[11px] bg-[#103a2a] text-[#f7f2e8] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1a4a36] transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Learning" subtitle="akilii noticed a pattern" mode="Chat" onMenuOpen={ctx?.openSidebar} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-8 py-10">
        <div className="w-full max-w-[580px] flex flex-col gap-8">
          {/* Consent header */}
          <div className="bg-[#faf8f4] border border-[#dad7ce] rounded-[14px] p-5">
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#58615c] text-[11px] tracking-[0.6px] mb-3">PROPOSED LEARNING</p>
            <p className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[22px] leading-snug mb-3">
              Begin complex work with one concrete, verifiable next step.
            </p>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[14px] leading-[1.5]">
              In this session you moved fastest after we anchored on a single, confirmable outcome before drafting anything. akilii would like to apply this as a default pattern for future work sessions.
            </p>
          </div>

          {/* What this means */}
          <div>
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#58615c] text-[11px] tracking-[0.6px] mb-3">WHAT THIS MEANS</p>
            <ul className="flex flex-col gap-2.5">
              {[
                "akilii will open future Work sessions with a single clarifying question.",
                "Nothing else is recorded from this conversation.",
                "You can review or withdraw this learning at any time from Settings.",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <div className="size-1.5 rounded-full bg-[#103a2a] mt-2 shrink-0" />
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#171b18] text-[14px] leading-[1.5]">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Action row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={approveLearning}
              className="flex-1 h-11 rounded-[11px] bg-[#103a2a] text-[#f7f2e8] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1a4a36] transition-colors"
            >
              Approve
            </button>
            <button
              className="flex-1 h-11 rounded-[11px] border border-[#103a2a] text-[#103a2a] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#103a2a]/5 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => { dismissLearning(); navigate("/"); }}
              className="flex-1 h-11 rounded-[11px] border border-[#dad7ce] text-[#58615c] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:border-[#103a2a]/30 transition-colors bg-[#faf8f4]"
            >
              Not now
            </button>
          </div>

          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#a0b2a8] text-[12px] text-center">
            No durable memory is recorded until you approve.
          </p>
        </div>
      </div>
    </div>
  );
}
