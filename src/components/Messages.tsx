import { useEffect, useRef } from "react";
import { Message } from "@/store";

interface MessagesProps {
  messages: Message[];
  embed?: boolean;
}

export default function Messages({ messages, embed }: MessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages[messages.length - 1]?.text]);

  const cls = embed
    ? "px-4 lg:px-8 py-6 flex flex-col gap-6"
    : "flex-1 overflow-y-auto min-h-0 px-4 lg:px-8 py-6 flex flex-col gap-6";

  return (
    <div className={cls}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[70%] px-4 py-3 rounded-[16px] rounded-br-[4px]"
          style={{ background: "var(--ws-msg-user-bg)" }}
        >
          <p
            className="font-normal text-[14px] leading-[1.5]"
            style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-msg-user-text)" }}
          >
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      {/* Akilii mark */}
      <div
        className="flex items-center justify-center size-8 rounded-full shrink-0 mt-0.5"
        style={{ background: "var(--ws-card-icon-bg)" }}
      >
        <svg fill="none" viewBox="0 0 16 16" className="size-4">
          <circle cx="8" cy="8" fill="var(--ws-card-icon-stroke)" opacity="0.7" r="6" />
          <circle cx="8" cy="8" fill="var(--ws-card-icon-stroke)" r="2.5" />
        </svg>
      </div>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-[16px] rounded-bl-[4px] ${message.streaming && !message.text ? "min-w-[40px] min-h-[40px]" : ""}`}
        style={{ background: "var(--ws-msg-asst-bg)", border: "1px solid var(--ws-msg-asst-border)" }}
      >
        {message.streaming && !message.text ? (
          <TypingIndicator />
        ) : (
          <p
            className={`font-normal text-[14px] leading-[1.5] ${message.streaming ? "streaming-cursor" : ""}`}
            style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-msg-asst-text)" }}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center h-5 px-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="size-1.5 rounded-full"
          style={{
            background: "var(--ws-secondary)",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
