import { useOutletContext } from "react-router-dom";
import { useApp, getNextReply } from "@/store";
import TopBar from "@/components/TopBar";
import Messages from "@/components/Messages";
import Composer from "@/components/Composer";
import StatusFooter from "@/components/StatusFooter";

export default function Chat() {
  const { messages, addMessage } = useApp();
  const ctx = useOutletContext<{ openSidebar: () => void }>();

  function handleSend(text: string) {
    addMessage({ role: "user", text });
    setTimeout(() => addMessage({ role: "assistant", text: getNextReply() }), 700);
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Investor meeting"
        subtitle="Work · active · Thursday"
        mode="Chat"
        onMenuOpen={ctx?.openSidebar}
      />

      {/* Desktop layout: messages fill, composer inline, footer below */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0">
        <Messages messages={messages} />
        <div className="flex justify-center py-4 px-4">
          <Composer onSend={handleSend} />
        </div>
        <StatusFooter />
      </div>

      {/* Mobile layout: messages fill, floating composer + fade */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 relative">
        {/* Scrollable messages with bottom padding for composer */}
        <div className="flex-1 overflow-y-auto pb-[140px]">
          <Messages messages={messages} embed />
        </div>
        {/* Content fade gradient above composer */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f5f1ea] to-transparent z-10" />
        {/* Floating composer */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-2">
          <Composer onSend={handleSend} mobile />
        </div>
      </div>
    </div>
  );
}
