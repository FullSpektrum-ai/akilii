import { useNavigate, useOutletContext } from "react-router-dom";
import { useApp } from "@/store";
import TopBar from "@/components/TopBar";
import Messages from "@/components/Messages";
import Composer from "@/components/Composer";
import WorkPanel from "@/components/WorkPanel";

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

      <div className="hidden lg:flex flex-1 min-h-0 canonical-work-layout">
        <div className="canonical-chat-column">
          <Messages messages={messages} />
          <div className="canonical-input-zone">
            <Composer />
          </div>
        </div>
        <div className="canonical-divider" aria-hidden="true"><span /></div>
        <div className="flex h-full shrink-0">
          <WorkPanel onClose={() => navigate("/chat")} />
        </div>
      </div>

      <div className="flex lg:hidden flex-col flex-1 min-h-0 relative">
        <div className="flex-1 overflow-y-auto pb-[140px]">
          <Messages messages={messages} embed />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 z-10"
          style={{ background: "linear-gradient(to top, var(--ws-to), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-2">
          <Composer mobile />
        </div>
      </div>
    </div>
  );
}
