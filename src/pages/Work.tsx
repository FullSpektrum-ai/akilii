import { useNavigate, useOutletContext } from "react-router-dom";
import { useApp } from "@/store";
import TopBar from "@/components/TopBar";
import Messages from "@/components/Messages";
import Composer from "@/components/Composer";
import WorkPanel from "@/components/WorkPanel";
import StatusFooter from "@/components/StatusFooter";

export default function Work() {
  const { messages } = useApp();
  const navigate = useNavigate();
  const ctx = useOutletContext<{ openSidebar: () => void }>();

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Investor meeting"
        subtitle="Work · active · Thursday"
        mode="Work"
        onMenuOpen={ctx?.openSidebar}
      />

      {/* Desktop: chat + work panel side by side */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-w-0 h-full">
          <Messages messages={messages} />
          <div className="flex justify-center py-4 px-4">
            <Composer />
          </div>
          <StatusFooter />
        </div>
        <div className="flex h-full">
          <WorkPanel onClose={() => navigate("/chat")} />
        </div>
      </div>

      {/* Mobile: stacked, no work panel, floating composer */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 relative">
        <div className="flex-1 overflow-y-auto pb-[140px]">
          <Messages messages={messages} embed />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-10"
          style={{ background: "linear-gradient(to top, var(--ws-to), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-2">
          <Composer mobile />
        </div>
      </div>
    </div>
  );
}
