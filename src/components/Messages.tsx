import { useEffect, useRef } from "react";
import type { Message } from "@/store";

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
    ? "canonical-thread px-4 lg:px-6 py-6 flex flex-col gap-5"
    : "canonical-thread flex-1 overflow-y-auto min-h-0 px-4 lg:px-6 py-6 flex flex-col gap-5";

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
      <div className="message-align user-align">
        <div className="message-meta user-meta">
          <span>You</span>
          <span>10:24 AM</span>
        </div>
        <div
          className="user-bubble"
          style={{ background: "var(--ws-msg-user-bg)" }}
        >
          <p
            className="font-normal text-[14px] leading-[1.5]"
            style={{ fontFamily: "'Inter:Regular', sans-serif", color: "var(--ws-msg-user-text)" }}
          >
            {message.text}
          </p>
        </div>
        <div className="message-actions user-actions" aria-hidden="true">
          <span>copy</span>
          <span>edit</span>
        </div>
      </div>
    );
  }

  return (
    <div className="message-align assistant-align">
      <div
        className="assistant-avatar"
        style={{ background: "var(--ws-card-icon-bg)" }}
      >
        <span>a</span>
      </div>
      <div className="assistant-message-core">
        <div className="message-meta">
          <span>akilii</span>
          <span>10:25 AM</span>
        </div>
        <div
          className={`assistant-card ${message.streaming && !message.text ? "min-w-[40px] min-h-[40px]" : ""}`}
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
        <div className="message-actions" aria-hidden="true">
          <span>like</span>
          <span>no</span>
          <span>copy</span>
        </div>
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
