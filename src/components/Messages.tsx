import { useEffect, useRef } from "react";
import { Message } from "@/store";

interface MessagesProps {
  messages: Message[];
  /** embed=true: no flex-1/overflow, used when parent controls the scroll container */
  embed?: boolean;
}

export default function Messages({ messages, embed }: MessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
        <div className="max-w-[70%] bg-[#103a2a] text-[#f7f2e8] px-4 py-3 rounded-[16px] rounded-br-[4px]">
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[1.5]">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      <div className="flex items-center justify-center size-8 rounded-full bg-[#e3eae1] shrink-0 mt-0.5">
        <svg fill="none" viewBox="0 0 16 16" className="size-4">
          <circle cx="8" cy="8" fill="#103A2A" opacity="0.7" r="6" />
          <circle cx="8" cy="8" fill="#103A2A" r="2.5" />
        </svg>
      </div>
      <div className="max-w-[75%] bg-[#faf8f4] border border-[#dad7ce] px-4 py-3 rounded-[16px] rounded-bl-[4px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#171b18] text-[14px] leading-[1.5]">{message.text}</p>
      </div>
    </div>
  );
}
