import { Outlet } from "react-router-dom";
import { useApp } from "@/store";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import OrganicPattern from "./OrganicPattern";

export default function AppShell() {
  const { theme, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div
      className={`flex h-full w-full overflow-hidden`}
      data-theme={theme}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile nav overlay — reused across all routes */}
      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main workspace */}
      <div
        className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden"
        style={{
          background: theme === "dark"
            ? "linear-gradient(to bottom, #0f1e17, #0a1510)"
            : "linear-gradient(to bottom, #fcfaf7, #f5f1ea)",
        }}
      >
        {/* Organic pattern at 24% opacity — matches imported design */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.24 }}>
          <OrganicPattern />
        </div>

        {/* Inset shadow from sidebar edge */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_3px_0px_8px_0px_rgba(0,0,0,0.03),inset_0px_3px_12px_0px_rgba(0,0,0,0.06)]" />

        <div className="relative flex flex-col h-full">
          <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
        </div>
      </div>
    </div>
  );
}
