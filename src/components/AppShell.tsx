import { Outlet } from "react-router-dom";
import { useApp } from "@/store";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import imgOrganicPattern from "@/imports/MakeInput04ChatEntryCoreAskDesktopLightCanonical/2a317bb0941a4446636bd1a2bd99eb7bf66d6da6.png";

export default function AppShell() {
  const { theme, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="akilii-shell flex h-full w-full overflow-hidden" data-theme={theme}>
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar />
      </div>

      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="akilii-workspace flex-1 min-w-0 h-full flex flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(to bottom, var(--ws-from), var(--ws-to))" }}
      >
        <div
          className="absolute inset-0 pointer-events-none akilii-pattern"
          style={{ opacity: "var(--ws-pattern-opacity, 0.24)" }}
        >
          <img
            src={imgOrganicPattern}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none akilii-workspace-overlay"
          style={{ background: "linear-gradient(to bottom, var(--ws-overlay-from), var(--ws-overlay-to))" }}
        />

        <div className="absolute inset-0 pointer-events-none shadow-[inset_3px_0px_8px_0px_rgba(0,0,0,0.03),inset_0px_3px_12px_0px_rgba(0,0,0,0.06)]" />

        <div className="relative flex flex-col h-full">
          <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
        </div>
      </div>
    </div>
  );
}
