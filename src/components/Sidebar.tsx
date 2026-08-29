import { useNavigate, useLocation } from "react-router-dom";
import { useApp, Theme } from "@/store";
import svgPaths from "../../imports/svg-eva1h3yjak";
import imgProfile from "@/imports/MakeInput04ChatEntryCoreAskDesktopLightCanonical/a17783d944d839f9aa57da9d49d3095b102c7136.png";

const THEMES: { value: Theme; label: string; swatch: [string, string] }[] = [
  { value: "forest-cream", label: "Forest / Cream", swatch: ["#103a2a", "#f5f1ea"] },
  { value: "ivory-dark",   label: "Ivory / Dark",   swatch: ["#152a1c", "#0f1e17"] },
  { value: "forest-sage",  label: "Forest / Sage",  swatch: ["#103a2a", "#bfd5ba"] },
  { value: "cream-forest", label: "Cream / Forest", swatch: ["#f5f0e6", "#103a2a"] },
];

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
      className={`flex flex-col relative ${
        mobile ? "w-[280px] h-full rounded-r-[16px] overflow-hidden" : "w-[240px] h-full shrink-0"
      }`}
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Right border hairline */}
      <div className="absolute inset-0 pointer-events-none" style={{ borderRight: "1px solid var(--sidebar-border-right)" }} />

      <div className="flex flex-col flex-1 pb-4 pt-5 px-4 overflow-y-auto dark-scrollbar min-h-0">

        {/* ── Brand ── */}
        <div className="flex gap-[6px] items-center mb-4 shrink-0">
          {/* Brandmark — exact proportions from canonical import */}
          <div className="relative shrink-0" style={{ width: 42, height: 41 }}>
            <div className="absolute" style={{ top: "21.64%", right: "39.04%", bottom: "52.49%", left: "21.03%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.1616 14.6689">
                <path d={svgPaths.p3cc6ce80} fill="var(--sidebar-text)" />
              </svg>
            </div>
            <div className="absolute" style={{ top: "22.98%", right: "22.38%", bottom: "39.65%", left: "53.37%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0632 21.194">
                <path d={svgPaths.p20aa9980} fill="var(--sidebar-text)" />
              </svg>
            </div>
            <div className="absolute" style={{ top: "38.43%", right: "54.51%", bottom: "21.67%", left: "21%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.2035 22.6254">
                <path d={svgPaths.pf279fc0} fill="var(--sidebar-text)" />
              </svg>
            </div>
            <div className="absolute" style={{ top: "52.51%", right: "21%", bottom: "21.64%", left: "36.43%" }}>
              <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.6906 14.6568">
                <path d={svgPaths.p894e80} fill="var(--sidebar-text)" />
              </svg>
            </div>
          </div>
          {/* Wordmark */}
          <div className="relative shrink-0" style={{ width: 68, height: 24 }}>
            <svg className="absolute inset-[0_9.23%_17.93%_0]" fill="none" preserveAspectRatio="none" viewBox="0 0 102.575 19.6973">
              <path clipRule="evenodd" d={svgPaths.p372e8900} fill="var(--sidebar-text)" fillRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* ── Search ── */}
        <div
          className="flex gap-2 h-9 items-center overflow-clip pl-3 pr-2.5 rounded-[8px] shrink-0 w-full mb-3"
          style={{ background: "var(--sidebar-search-bg)", border: "1px solid var(--sidebar-search-border)" }}
        >
          <svg fill="none" viewBox="0 0 9 9" className="size-[9px] shrink-0">
            <circle cx="4.5" cy="4.5" fill="var(--sidebar-muted)" opacity="0.6" r="4.5" />
          </svg>
          <p className="flex-1 min-w-0 text-[13px] opacity-50 whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-muted)" }}>Search...</p>
          <div className="flex h-5 items-center justify-center overflow-clip rounded-[4px] shrink-0 w-[30px]" style={{ background: "var(--sidebar-kbd-bg, rgba(255,255,255,0.08))" }}>
            <p className="text-[9px] font-medium opacity-60" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--sidebar-muted)" }}>⌘K</p>
          </div>
        </div>

        {/* ── New conversation ── */}
        <button
          onClick={() => nav("/")}
          className="flex gap-[6px] h-9 items-center justify-center overflow-clip rounded-[8px] shrink-0 w-full mb-6 transition-colors"
          style={{ border: "1px solid var(--sidebar-new-btn-border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <p className="opacity-70 text-[15px]" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-text)" }}>+</p>
          <p className="opacity-70 text-[13px] font-medium" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--sidebar-text)" }}>New conversation</p>
        </button>

        {/* ── Recents ── */}
        <p className="font-semibold opacity-60 text-[10px] tracking-[0.8px] mb-2 shrink-0" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--sidebar-muted)" }}>RECENTS</p>

        <button
          onClick={() => nav("/chat")}
          className="flex gap-[10px] h-11 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full mb-0.5 transition-colors"
          style={{ background: isChat || isWork ? "var(--sidebar-active)" : "transparent" }}
          onMouseEnter={(e) => { if (!isChat && !isWork) e.currentTarget.style.background = "var(--sidebar-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isChat || isWork ? "var(--sidebar-active)" : "transparent"; }}
        >
          <svg fill="none" viewBox="0 0 8 8" className="size-2 shrink-0">
            <circle cx="4" cy="4" fill="#59C78C" r="4" />
          </svg>
          <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0 overflow-hidden">
            <p className="font-medium text-[13px] truncate w-full" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--sidebar-text)" }}>Investor meeting</p>
            <p className="font-normal opacity-55 text-[10px] whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-muted)" }}>Work · active</p>
          </div>
        </button>

        <NavItem label="Funding conversation" sub="Chat · today" dot={<svg fill="none" viewBox="0 0 8 8" className="size-2 shrink-0"><circle cx="4" cy="4" fill="var(--sidebar-muted)" opacity="0.4" r="4" /></svg>} badge={<svg fill="none" viewBox="0 0 6 6" className="size-1.5 shrink-0"><circle cx="3" cy="3" fill="#59C78C" r="3" /></svg>} onClick={() => {}} />
        <NavItem label="Weekly reflection" sub="Chat · yesterday" dot={<svg fill="none" viewBox="0 0 8 8" className="size-2 shrink-0"><circle cx="4" cy="4" fill="var(--sidebar-muted)" opacity="0.4" r="4" /></svg>} mb6 onClick={() => {}} />

        {/* ── Spaces ── */}
        <p className="font-semibold opacity-60 text-[10px] tracking-[0.8px] mb-2 shrink-0" style={{ fontFamily: "'Inter:Semi Bold', sans-serif", color: "var(--sidebar-muted)" }}>SPACES</p>

        <SpaceItem color="#59c78c" label="FullSpektrum" count="4" />
        <SpaceItem color="#737a8c" label="Personal admin" count="1" />

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* ── Divider ── */}
        <div className="h-px shrink-0 w-full mb-3" style={{ background: "var(--sidebar-divider)" }} />

        {/* ── My akilii ── */}
        <button
          className="flex gap-[10px] h-9 items-center overflow-clip pl-[10px] rounded-[6px] shrink-0 w-full transition-colors"
          style={{ color: "var(--sidebar-text)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg fill="none" viewBox="0 0 14 14" className="size-3.5 shrink-0" style={{ opacity: 0.6 }}>
            <g clipPath="url(#cl-user-sb)">
              <circle cx="7" cy="4" fill="var(--sidebar-muted)" r="3" />
              <circle cx="7" cy="13" fill="var(--sidebar-muted)" r="5" />
            </g>
            <defs><clipPath id="cl-user-sb"><rect fill="white" height="14" width="14" /></clipPath></defs>
          </svg>
          <p className="opacity-70 text-[13px] whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-text)" }}>My akilii</p>
        </button>

        {/* ── Settings ── */}
        <button
          className="flex gap-[10px] h-9 items-center overflow-clip pl-[10px] rounded-[6px] shrink-0 w-full transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span className="size-3.5 flex items-center justify-center opacity-60 text-[14px]" style={{ color: "var(--sidebar-muted)" }}>⚙</span>
          <p className="opacity-70 text-[13px] whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-text)" }}>Settings</p>
        </button>

        {/* ── Theme switcher ── */}
        <div className="flex gap-1.5 mt-2 mb-1 px-1">
          {THEMES.map((t) => (
            <button
              key={t.value}
              title={t.label}
              aria-label={`Switch to ${t.label} theme`}
              onClick={() => setTheme(t.value)}
              className="flex rounded-[5px] overflow-hidden shrink-0 transition-all"
              style={{
                width: 24,
                height: 16,
                outline: theme === t.value ? "2px solid var(--sidebar-text)" : "2px solid transparent",
                outlineOffset: 1,
                opacity: theme === t.value ? 1 : 0.6,
              }}
            >
              <div className="flex-1" style={{ background: t.swatch[0] }} />
              <div className="flex-1" style={{ background: t.swatch[1] }} />
            </button>
          ))}
        </div>

        {/* ── Profile ── */}
        <div className="flex gap-[10px] h-11 items-center overflow-clip pl-[6px] pr-[10px] rounded-[8px] shrink-0 w-full mt-1">
          <img
            src={imgProfile}
            alt="Alex Morgan"
            className="rounded-[14px] shrink-0 object-cover"
            style={{ width: 28, height: 28 }}
          />
          <p className="flex-1 font-medium opacity-85 text-[12px] truncate" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--sidebar-text)" }}>Alex Morgan</p>
          <svg fill="none" viewBox="0 0 12 12" className="size-3 shrink-0">
            <g opacity="0.7">
              <path d="M3 5L6 8L9 5" stroke="var(--sidebar-muted)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
}

function NavItem({
  label, sub, dot, badge, mb6 = false, onClick,
}: {
  label: string; sub: string; dot?: React.ReactNode; badge?: React.ReactNode; mb6?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex gap-[10px] h-11 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full transition-colors ${mb6 ? "mb-6" : "mb-0.5"}`}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {dot}
      <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0 overflow-hidden">
        <p className="font-medium text-[13px] truncate w-full" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--sidebar-text)" }}>{label}</p>
        <p className="font-normal opacity-55 text-[10px] whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-muted)" }}>{sub}</p>
      </div>
      {badge}
    </button>
  );
}

function SpaceItem({ color, label, count }: { color: string; label: string; count: string }) {
  return (
    <button
      className="flex gap-[10px] h-9 items-center overflow-clip px-[10px] rounded-[6px] shrink-0 w-full mb-0.5 transition-colors"
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="rounded shrink-0 size-3.5" style={{ background: color }} />
      <p className="font-medium text-[13px] flex-1 text-left truncate" style={{ fontFamily: "'Inter:Medium', sans-serif", color: "var(--sidebar-text)" }}>{label}</p>
      <p className="font-normal opacity-40 text-[11px] whitespace-nowrap" style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--sidebar-muted)" }}>{count}</p>
    </button>
  );
}
