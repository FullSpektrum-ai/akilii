import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import TopBar from "@/components/TopBar";

const OUTCOMES = [
  { id: "followup", label: "Secure a follow-up meeting", desc: "The investor agrees to a second meeting within two weeks." },
  { id: "thesis", label: "Validate the investment thesis", desc: "Leave with explicit confirmation that the thesis resonates." },
  { id: "intro", label: "Ask for a specific introduction", desc: "Walk out with one warm introduction to a strategic partner." },
];

export default function Discover() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const ctx = useOutletContext<{ openSidebar: () => void }>();

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Discover" subtitle="Define your outcome before we begin" mode="Chat" onMenuOpen={ctx?.openSidebar} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-[560px] flex flex-col gap-6">
          <div>
            <h2 className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[26px] leading-tight mb-2">
              What is the outcome of your investor meeting?
            </h2>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[15px] leading-[1.5]">
              Selecting a clear outcome helps akilii structure the session.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {OUTCOMES.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className={`text-left p-4 rounded-[14px] border transition-all ${
                  selected === o.id
                    ? "border-[#103a2a] bg-[#e3eae1]"
                    : "border-[#dad7ce] bg-[#faf8f4] hover:border-[#103a2a]/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${selected === o.id ? "border-[#103a2a]" : "border-[#dad7ce]"}`}>
                    {selected === o.id && <div className="size-2 rounded-full bg-[#103a2a]" />}
                  </div>
                  <div>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#103a2a] text-[14px]">{o.label}</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[13px] mt-0.5">{o.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => selected && navigate("/chat")}
            disabled={!selected}
            className={`h-11 rounded-[11px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all ${
              selected
                ? "bg-[#103a2a] text-[#f7f2e8] hover:bg-[#1a4a36]"
                : "bg-[#dad7ce] text-[#a0b2a8] cursor-not-allowed"
            }`}
          >
            Begin session →
          </button>
        </div>
      </div>
    </div>
  );
}
