import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/store";
import svgPaths from "../../imports/svg-eva1h3yjak";

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-[14px] shrink-0 size-7 bg-[#2a5a3e]"
      style={{ fontSize: 10, fontFamily: "'Inter:Medium', sans-serif", fontWeight: 500, color: "#f7f2e8" }}
    >
      {initials}
    </div>
  );
}

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useApp();

  function nav(path: string) {
    navigate(path);
    onClose?.();
  }

  const isChat = location.pathname === "/chat";
  const isWork = location.pathname === "/work";

  return (
    <div
      className={`bg-[#103a2a] flex flex-col relative ${
        mobile ? "w-[280px] h-full rounded-r-[16px] overflow-hidden" : "w-[240px] h-full shrink-0"
      }`}
    >
      {/* Right border hairline */}
      <div className="absolute inset-0 border-r border-[#1f3a2b] pointer-events-none" />

      <div className="flex flex-col flex-1 pb-4 pt-5 px-4 overflow-y-auto dark-scrollbar min-h-0">

        {/* ── Brand ── */}
        <div className="flex gap-[6px] items-center mb-4 shrink-0">
          {/* Brandmark — exact proportions from import: 42×41 display of 58×56.714 viewBox */}
          <div className="relative shrink-0" style={{ width: 42, height: 41 }}>
            <div className="absolute" style={{ top: "21.64%", right: "39.04%", bottom: "52.49%", left: "21.03%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.1616 14.6689">
                <path d={svgPaths.p3cc6ce80} fill="#F7F2E8" />
              </svg>
            </div>
            <div className="absolute" style={{ top: "22.98%", right: "22.38%", bottom: "39.65%", left: "53.37%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0632 21.194">
                <path d={svgPaths.p20aa9980} fill="#F7F2E8" />
              </svg>
            </div>
            <div className="absolute" style={{ top: "38.43%", right: "54.51%", bottom: "21.67%", left: "21%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.2035 22.6254">
                <path d={svgPaths.pf279fc0} fill="#F7F2E8" />
              </svg>
            </div>
            <div className="absolute" style={{ top: "52.51%", right: "21%", bottom: "21.64%", left: "36.43%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.6906 14.6568">
                <path d={svgPaths.p894e80} fill="#F7F2E8" />
              </svg>
            </div>
          </div>
          {/* Wordmark */}
          <div className="relative shrink-0" style={{ width: 68, height: 24 }}>
            <svg className="absolute inset-[0_9.23%_17.93%_0]" fill="none" preserveAspectRatio="none" viewBox="0 0 102.575 19.6973">
              <path clipRule="evenodd" d={svgPaths.p372e8900} fill="#F7F2E8" fillRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.08)] flex gap-2 h-9 items-center overflow-clip pl-3 pr-2.5 rounded-[8px] shrink-0 w-full mb-3">
          <svg fill="none" viewBox="0 0 9 9" className="size-[9px] shrink-0">
            <circle cx="4.5" cy="4.5" fill="#A0B2A8" opacity="0.6" r="4.5" />
          </svg>
          <p className="font-['Inter:Regular',sans-serif] font-normal opacity-50 text-[#a0b2a8] text-[13px] whitespace-nowrap flex-1">Search...</p>
          <div className="bg-[rgba(255,255,255,0.08)] flex h-5 items-center justify-center overflow-clip rounded shrink-0 w-[30px]">
            <p className="font-['Inter:Medium',sans-serif] font-medium opacity-60 text-[#a0b2a8] text-[9px] whitespace-nowrap">⌘K</p>
          </div>
        </div>

        {/* ── New conversation ── */}
        <button
          onClick={() => nav("/")}
          className="border border-[rgba(255,255,255,0.12)] flex gap-[6px] h-9 items-center justify-center overflow-clip rounded-[8px] shrink-0 w-full mb-6 hover:bg-white/5 transition-colors"
        >
          <p className="font-['Inter:Regular',sans-serif] font-normal opacity-70 text-[#f7f2e8] text-[15px]">+</p>
          <p className="font-['Inter:Medium',sans-serif] font-medium opacity-70 text-[#f7f2e8] text-[13px]">New conversation</p>
        </button>

        {/* ── Recents ── */}
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold opacity-60 text-[#a0b2a8] text-[10px] tracking-[0.8px] mb-2 shrink-0">RECENTS</p>

        <button
          onClick={() => nav("/chat")}
          className={`flex gap-[10px] h-11 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full mb-0.5 hover:bg-white/5 transition-colors ${
            isChat || isWork ? "bg-[rgba(255,255,255,0.06)]" : ""
          }`}
        >
          <svg fill="none" viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" fill="#59C78C" r="4" />
          </svg>
          <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0 overflow-hidden">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f7f2e8] text-[13px] truncate w-full">Investor meeting</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal opacity-55 text-[#a0b2a8] text-[10px] whitespace-nowrap">Work · active</p>
          </div>
        </button>

        <button className="flex gap-[10px] h-11 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full mb-0.5 hover:bg-white/5 transition-colors">
          <svg fill="none" viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" fill="#A0B2A8" opacity="0.4" r="4" />
          </svg>
          <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0 overflow-hidden">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f7f2e8] text-[13px] truncate w-full">Funding conversation</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal opacity-55 text-[#a0b2a8] text-[10px] whitespace-nowrap">Chat · today</p>
          </div>
          <svg fill="none" viewBox="0 0 6 6" className="size-1.5 shrink-0">
            <circle cx="3" cy="3" fill="#59C78C" r="3" />
          </svg>
        </button>

        <button className="flex gap-[10px] h-11 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full mb-6 hover:bg-white/5 transition-colors">
          <svg fill="none" viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" fill="#A0B2A8" opacity="0.4" r="4" />
          </svg>
          <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0 overflow-hidden">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f7f2e8] text-[13px] truncate w-full">Weekly reflection</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal opacity-55 text-[#a0b2a8] text-[10px] whitespace-nowrap">Chat · yesterday</p>
          </div>
        </button>

        {/* ── Spaces ── */}
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold opacity-60 text-[#a0b2a8] text-[10px] tracking-[0.8px] mb-2 shrink-0">SPACES</p>

        <button className="flex gap-[10px] h-9 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full mb-0.5 hover:bg-white/5 transition-colors">
          <div className="bg-[#59c78c] rounded shrink-0 size-3.5" />
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f7f2e8] text-[13px] flex-1 text-left truncate">FullSpektrum</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal opacity-40 text-[#a0b2a8] text-[11px] whitespace-nowrap">4</p>
        </button>

        <button className="flex gap-[10px] h-9 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full hover:bg-white/5 transition-colors">
          <div className="bg-[#737a8c] rounded shrink-0 size-3.5" />
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[#f7f2e8] text-[13px] flex-1 text-left truncate">Personal admin</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal opacity-40 text-[#a0b2a8] text-[11px] whitespace-nowrap">1</p>
        </button>

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* ── Divider ── */}
        <div className="bg-[rgba(255,255,255,0.06)] h-px shrink-0 w-full mt-3 mb-3" />

        {/* ── My akilii ── */}
        <button className="flex gap-[10px] h-9 items-center overflow-clip pl-[10px] rounded-[6px] shrink-0 w-full hover:bg-white/5 transition-colors">
          <svg fill="none" viewBox="0 0 14 14" className="size-3.5 shrink-0">
            <g clipPath="url(#cl-user-sb)">
              <circle cx="7" cy="4" fill="#A0B2A8" opacity="0.6" r="3" />
              <circle cx="7" cy="13" fill="#A0B2A8" opacity="0.6" r="5" />
            </g>
            <defs><clipPath id="cl-user-sb"><rect fill="white" height="14" width="14" /></clipPath></defs>
          </svg>
          <p className="font-['Inter:Regular',sans-serif] font-normal opacity-70 text-[#f7f2e8] text-[13px] whitespace-nowrap">My akilii</p>
        </button>

        {/* ── Settings + theme ── */}
        <div className="flex items-center justify-between">
          <button className="flex gap-[10px] h-9 items-center overflow-clip pl-[10px] rounded-[6px] shrink-0 hover:bg-white/5 transition-colors">
            <div className="overflow-clip relative shrink-0 size-[14px]">
              <div className="absolute left-[7px] top-[7px] -translate-x-1/2 -translate-y-1/2 opacity-60 text-[#a0b2a8] text-[14px] text-center leading-none">
                ⚙
              </div>
            </div>
            <p className="font-['Inter:Regular',sans-serif] font-normal opacity-70 text-[#f7f2e8] text-[13px] whitespace-nowrap">Settings</p>
          </button>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 px-3 rounded-[6px] flex items-center gap-1 hover:bg-white/5 transition-colors"
            title="Toggle theme"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <p className="font-['Inter:Regular',sans-serif] font-normal opacity-50 text-[#a0b2a8] text-[11px] whitespace-nowrap">
              {theme === "light" ? "Dark" : "Light"}
            </p>
          </button>
        </div>

        {/* ── Profile ── */}
        <div className="flex gap-[10px] h-11 items-center overflow-clip pl-[6px] pr-[10px] rounded-[8px] shrink-0 w-full mt-2">
          <Avatar name="Alex Morgan" />
          <p className="font-['Inter:Medium',sans-serif] font-medium opacity-85 text-[#f7f2e8] text-[12px] flex-1 truncate">Alex Morgan</p>
          <svg fill="none" viewBox="0 0 12 12" className="size-3 shrink-0">
            <g opacity="0.7">
              <path d="M3 5L6 8L9 5" stroke="#58615C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
}
