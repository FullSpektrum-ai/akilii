import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useApp, type Theme } from "@/store";
import { BrandMark, BrandWordmark, IconSettings } from "@/components/Icons";
import imgProfile from "@/imports/MakeInput04ChatEntryCoreAskDesktopLightCanonical/a17783d944d839f9aa57da9d49d3095b102c7136.png";

const THEMES: { value: Theme; label: string; swatch: [string, string] }[] = [
  { value: "forest-cream", label: "Forest on Cream", swatch: ["#103a2a", "#f5f1ea"] },
  { value: "ivory-dark", label: "Ivory on Dark", swatch: ["#152a1c", "#0f1e17"] },
  { value: "forest-sage", label: "Forest on Sage", swatch: ["#103a2a", "#bfd5ba"] },
  { value: "cream-forest", label: "Cream on Forest", swatch: ["#f5f0e6", "#103a2a"] },
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

  const route = location.pathname;

  return (
    <aside
      className={mobile ? "canonical-sidebar-mobile" : "canonical-sidebar"}
      style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
    >
      <div className="canonical-sidebar-border" />

      <div className="sidebar-brand">
        <button className="brand-mark" onClick={() => nav("/")} aria-label="Go home">
          <BrandMark className="sidebar-brandmark" />
        </button>
        <div className="brand-stack">
          <BrandWordmark className="sidebar-wordmark" />
          <div className="brand-version">v0.1 demo build</div>
        </div>
        <button className="sidebar-icon-btn" onClick={onClose} aria-label={mobile ? "Close menu" : "Collapse sidebar"}>
          <span aria-hidden="true">{mobile ? "×" : "‹"}</span>
        </button>
      </div>

      <label className="sidebar-search">
        <span>Search...</span>
      </label>

      <button className="new-chat-btn" onClick={() => nav("/")}>
        <span aria-hidden="true">+</span>
        <span>New chat</span>
      </button>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav" aria-label="Primary navigation">
        <SidebarRow active={route === "/"} label="Home" onClick={() => nav("/")} />
        <SidebarRow label="Support" onClick={() => nav("/chat")} />
        <SidebarRow active={route === "/work" || route === "/outcome" || route === "/learn"} label="Work" onClick={() => nav("/work")} />
      </nav>

      <div className="sidebar-divider" />

      <SectionTitle>Recent chats</SectionTitle>
      <div className="stack-tight">
        <ChatRow active={route === "/chat" || route === "/work"} title="Investor meeting prep" meta="Work · active" onClick={() => nav("/chat")} />
        <ChatRow title="PIP appeal support" meta="Chat · today" onClick={() => nav("/chat")} />
        <ChatRow title="Mindful reflections" meta="Chat · yesterday" onClick={() => nav("/chat")} />
      </div>

      <div className="sidebar-divider" />

      <SectionTitle>Development</SectionTitle>
      <button className="development-card" onClick={() => nav("/work")}>
        <div className="development-title">
          <span className="sidebar-node-dot" aria-hidden="true" />
          <span>Task Decomposition</span>
        </div>
        <div className="progress-dots" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => <span key={i} className={i < 3 ? "on" : ""} />)}
        </div>
        <div className="development-status">Session 2/5 · Active</div>
      </button>

      <div className="sidebar-divider" />

      <SectionTitle>Spaces</SectionTitle>
      <div className="stack-tight">
        <SidebarRow label="Management" onClick={() => nav("/work")} />
        <SidebarRow label="Personal growth" onClick={() => nav("/chat")} />
      </div>

      <div className="sidebar-spacer" />

      <div className="theme-rail" aria-label="Theme selector">
        {THEMES.map((t) => (
          <button
            key={t.value}
            title={t.label}
            aria-label={`Switch to ${t.label}`}
            onClick={() => setTheme(t.value)}
            className={theme === t.value ? "theme-swatch active" : "theme-swatch"}
          >
            <span style={{ background: t.swatch[0] }} />
            <span style={{ background: t.swatch[1] }} />
          </button>
        ))}
      </div>

      <button className="settings-row">
        <IconSettings className="settings-icon" />
        <span>Settings</span>
      </button>

      <button className="account-card">
        <img src={imgProfile} alt="" />
        <span>Alex Morgan</span>
        <span aria-hidden="true">⌄</span>
      </button>
    </aside>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="section-title">{children}</div>;
}

function SidebarRow({ active, label, onClick }: { active?: boolean; label: string; onClick: () => void }) {
  return (
    <button className={active ? "sidebar-row active" : "sidebar-row"} onClick={onClick}>
      <span className="row-icon" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function ChatRow({ active, title, meta, onClick }: { active?: boolean; title: string; meta: string; onClick: () => void }) {
  return (
    <button className={active ? "chat-row active" : "chat-row"} onClick={onClick}>
      <span className="chat-glyph" aria-hidden="true" />
      <span className="chat-copy">
        <span>{title}</span>
        <small>{meta}</small>
      </span>
    </button>
  );
}
