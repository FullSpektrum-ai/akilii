import { useNavigate, useOutletContext } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Composer from "@/components/Composer";
import StatusFooter from "@/components/StatusFooter";
import { useApp, getNextReply } from "@/store";
import svgPaths from "../../imports/svg-eva1h3yjak";

function SuggestionCard({
  title, sub, icon, onClick,
}: {
  title: string; sub: string; icon: React.ReactNode; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05),0px_3px_4px_rgba(0,0,0,0.08)] relative rounded-[16px] text-left hover:scale-[1.015] transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 shrink-0"
      style={{ width: 260, outlineColor: "var(--ws-heading)" }}
    >
      <div className="absolute inset-0 rounded-[16px] pointer-events-none" style={{ background: "var(--ws-card-bg)" }} />
      <div className="absolute inset-0 rounded-[16px] pointer-events-none" style={{ border: "1px solid var(--ws-border)" }} />
      <div className="absolute inset-0 rounded-[16px] pointer-events-none shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.03),inset_0px_1px_0px_0px_rgba(255,255,255,0.5)]" />
      <div className="flex gap-3 items-center p-4 relative">
        <div
          className="flex flex-col items-center justify-center rounded-[10px] shrink-0 size-9"
          style={{ background: "var(--ws-card-icon-bg)" }}
        >
          <div className="flex flex-col items-center justify-center overflow-clip size-[18px]">
            {icon}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0 overflow-hidden">
          <p className="font-semibold text-[14px] w-full" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-heading)" }}>
            {title}
          </p>
          <p className="font-normal text-[13px] w-full" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
            {sub}
          </p>
        </div>
      </div>
    </button>
  );
}

function AbstractPromptIllustration() {
  return (
    <div className="relative shrink-0 size-[132px]">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 132 132">
        <circle cx="66" cy="66" fill="var(--ws-heading)" opacity="0.08" r="66" />
        <circle cx="66" cy="66" opacity="0.35" r="47.5" stroke="var(--ws-heading)" />
        <circle cx="66" cy="66" opacity="0.45" r="31.5" stroke="var(--ws-heading)" />
        <circle cx="66" cy="66" opacity="0.55" r="19.5" stroke="var(--ws-heading)" />
        <circle cx="32" cy="32" fill="var(--ws-heading)" opacity="0.6" r="5" />
        <circle cx="100" cy="32" fill="var(--ws-heading)" opacity="0.6" r="5" />
        <circle cx="32" cy="100" fill="var(--ws-heading)" opacity="0.6" r="5" />
        <circle cx="100" cy="100" fill="var(--ws-heading)" opacity="0.6" r="5" />
        <g opacity="0.35">
          <path d={svgPaths.p3c296cf2} stroke="var(--ws-heading)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <g opacity="0.25">
          <path d={svgPaths.p33d34780} stroke="var(--ws-heading)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <circle cx="66" cy="66" fill="var(--ws-heading)" opacity="0.85" r="6" />
      </svg>
    </div>
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
      icon: (
        <svg fill="none" viewBox="0 0 17 17" className="size-[17px]">
          <g clipPath="url(#cl-clock)">
            <path d={svgPaths.p1ef09180} stroke="var(--ws-card-icon-stroke)" strokeLinecap="round" strokeWidth="2" />
          </g>
          <defs><clipPath id="cl-clock"><rect fill="white" height="17" width="17" /></clipPath></defs>
        </svg>
      ),
    },
    {
      title: "Start fresh: Weekly review",
      sub: "Routine session · Highly structured",
      onClick: () => navigate("/discover"),
      icon: (
        <svg fill="none" viewBox="0 0 17 17" className="size-[17px]">
          <path d={svgPaths.p1bacbbc0} stroke="var(--ws-card-icon-stroke)" strokeLinecap="round" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: "Explore: Something new",
      sub: "Open-ended · Explore freely",
      onClick: () => navigate("/discover"),
      icon: (
        <svg fill="none" viewBox="0 0 17 17" className="size-[17px]">
          <g clipPath="url(#cl-compass)">
            <path d={svgPaths.p9f8bf20} stroke="var(--ws-card-icon-stroke)" strokeLinecap="round" strokeWidth="2" />
          </g>
          <defs><clipPath id="cl-compass"><rect fill="white" height="17" width="17" /></clipPath></defs>
        </svg>
      ),
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
              <p className="text-[32px] leading-normal w-full" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
                What would you like to work on?
              </p>
              <p className="font-normal text-[15px] leading-[1.5] w-full" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
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
        <div className="flex-1 overflow-y-auto pb-[160px]">
          <div className="flex flex-col gap-5 items-center px-5 pt-8 pb-4">
            <AbstractPromptIllustration />
            <div className="flex flex-col gap-2 items-center text-center w-full">
              <p className="text-[26px] leading-normal w-full" style={{ fontFamily: "'DM Serif Display:Regular', sans-serif", color: "var(--ws-heading)" }}>
                What would you like to work on?
              </p>
              <p className="font-normal text-[14px] leading-[1.5] w-full" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-secondary)" }}>
                akilii adapts support based on what you&apos;ve confirmed works for you
              </p>
            </div>
          </div>
          <div
            className="flex gap-3 overflow-x-auto px-5 py-2 scrollbar-none"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {cards.map((c) => (
              <div key={c.title} style={{ scrollSnapAlign: "start" }}>
                <SuggestionCard {...c} />
              </div>
            ))}
            <div className="shrink-0 w-1" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 z-10"
          style={{ background: "linear-gradient(to top, var(--ws-to), transparent)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-2">
          <Composer onSend={handleSend} mobile />
        </div>
      </div>

      {/* Help trigger */}
      <div className="absolute bottom-10 right-4 hidden lg:block pointer-events-none">
        <div className="relative size-11 pointer-events-auto">
          <button
            className="absolute flex items-center justify-center left-1 rounded-[18px] size-9 top-1 drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)] hover:opacity-80 transition-opacity"
            style={{ background: "var(--ws-work-task-active)" }}
          >
            <div className="absolute inset-0 rounded-[18px] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)] pointer-events-none" />
            <p className="font-semibold text-lg text-center leading-none" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--ws-send-text)" }}>?</p>
          </button>
        </div>
      </div>
    </div>
  );
}
