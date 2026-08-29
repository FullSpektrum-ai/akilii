import { useNavigate, useOutletContext } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Composer from "@/components/Composer";
import { AbstractPromptIllustration, IconClock, IconRotateCcw, IconCompass } from "@/components/Icons";
import { useApp, getNextReply } from "@/store";
import StatusFooter from "@/components/StatusFooter";

function SuggestionCard({
  title,
  sub,
  onClick,
  icon,
}: {
  title: string;
  sub: string;
  onClick?: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05),0px_3px_4px_rgba(0,0,0,0.08)] relative rounded-[16px] text-left hover:scale-[1.015] transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#103a2a] shrink-0"
      style={{ width: 260 }}
    >
      <div className="absolute inset-0 rounded-[16px] bg-[#faf8f4] pointer-events-none" />
      <div className="absolute inset-0 rounded-[16px] border border-[#dad7ce] pointer-events-none" />
      <div className="absolute inset-0 rounded-[16px] shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.03),inset_0px_1px_0px_0px_rgba(255,255,255,0.5)] pointer-events-none" />
      <div className="flex gap-3 items-center p-4 relative">
        <div className="bg-[#e3eae1] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-9">
          <div className="flex flex-col items-center justify-center overflow-clip size-[18px]">
            {icon}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0 overflow-hidden">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#103a2a] text-[14px] w-full">{title}</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[13px] w-full">{sub}</p>
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { addMessage } = useApp();
  const ctx = useOutletContext<{ openSidebar: () => void }>();

  function handleSend(text: string) {
    addMessage({ role: "user", text });
    setTimeout(() => addMessage({ role: "assistant", text: getNextReply() }), 600);
    navigate("/chat");
  }

  const cards = [
    {
      title: "Continue: Investor meeting",
      sub: "Recent context · 2 hours ago",
      onClick: () => navigate("/chat"),
      icon: <IconClock />,
    },
    {
      title: "Start fresh: Weekly review",
      sub: "Routine session · Highly structured",
      onClick: () => navigate("/discover"),
      icon: <IconRotateCcw />,
    },
    {
      title: "Explore: Something new",
      sub: "Open-ended · Explore freely",
      onClick: () => navigate("/discover"),
      icon: <IconCompass />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="New conversation"
        subtitle="Start a support session tailored to your needs"
        mode="Home"
        onMenuOpen={ctx?.openSidebar}
      />

      {/* ── Desktop ── */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0">
        <div className="flex flex-1 flex-col items-center justify-between min-h-0 pb-6 pt-12 px-12 overflow-y-auto">
          <div className="flex flex-col gap-6 items-center w-full">
            <AbstractPromptIllustration />
            <div className="flex flex-col gap-3 items-center text-center w-[640px] max-w-full">
              <p className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[32px] leading-normal w-full">
                What would you like to work on?
              </p>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[15px] leading-[1.5] w-full">
                akilii adapts support based on what you&apos;ve confirmed works for you
              </p>
            </div>
            <div className="flex gap-4 items-center justify-center pt-6 w-full flex-wrap">
              {cards.map((c) => (
                <SuggestionCard key={c.title} {...c} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center w-full mt-8">
            <Composer onSend={handleSend} />
          </div>
        </div>
        <StatusFooter />
      </div>

      {/* ── Mobile ── */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 relative overflow-hidden">
        {/* Scrollable center content with bottom padding for floating composer */}
        <div className="flex-1 overflow-y-auto pb-[160px]">
          <div className="flex flex-col gap-5 items-center px-5 pt-8 pb-4">
            <AbstractPromptIllustration />
            <div className="flex flex-col gap-2 items-center text-center w-full">
              <p className="font-['DM_Serif_Display:Regular',sans-serif] text-[#103a2a] text-[26px] leading-normal w-full">
                What would you like to work on?
              </p>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#58615c] text-[14px] leading-[1.5] w-full">
                akilii adapts support based on what you&apos;ve confirmed works for you
              </p>
            </div>
          </div>

          {/* Horizontal scroll strip for suggestion cards */}
          <div className="flex gap-3 overflow-x-auto px-5 py-2 scrollbar-none" style={{ scrollSnapType: "x mandatory" }}>
            {cards.map((c) => (
              <div key={c.title} style={{ scrollSnapAlign: "start" }}>
                <SuggestionCard {...c} />
              </div>
            ))}
            {/* trailing spacer so last card doesn't clip */}
            <div className="shrink-0 w-1" />
          </div>
        </div>

        {/* Fade + floating composer */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#f5f1ea] to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-2">
          <Composer onSend={handleSend} mobile />
        </div>
      </div>

      {/* Help trigger — desktop only */}
      <div className="absolute bottom-10 right-4 hidden lg:block pointer-events-none">
        <div className="relative size-11 pointer-events-auto">
          <button className="absolute bg-[#103a2a] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center left-1 rounded-[18px] size-9 top-1 hover:bg-[#1a4a36] transition-colors">
            <div className="absolute inset-0 rounded-[18px] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)] pointer-events-none" />
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#f7f2e8] text-lg text-center leading-none">?</p>
          </button>
        </div>
      </div>
    </div>
  );
}
