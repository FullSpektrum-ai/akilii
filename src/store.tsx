import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type MessageRole = "user" | "assistant";
export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  streaming?: boolean;
}

export type TaskStatus = "complete" | "active" | "blocked" | "ready";
export interface Task {
  id: string;
  label: string;
  status: TaskStatus;
}

export type Theme = "forest-cream" | "ivory-dark" | "forest-sage" | "cream-forest";
export type RuntimeMode = "demo" | "real";

export interface AppState {
  theme: Theme;
  messages: Message[];
  tasks: Task[];
  outcomeSuccess: number | null;
  learningApproved: boolean | null;
  sidebarOpen: boolean;
  isStreaming: boolean;
  runtimeMode: RuntimeMode;
  setTheme: (t: Theme) => void;
  setRuntimeMode: (m: RuntimeMode) => void;
  sendMessage: (text: string) => Promise<void>;
  addMessage: (msg: Omit<Message, "id">) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setOutcomeSuccess: (n: number) => void;
  approveLearning: () => void;
  dismissLearning: () => void;
  setSidebarOpen: (v: boolean) => void;
}

const initial: Message[] = [
  { id: "1", role: "user", text: "I need to prepare for an investor meeting on Thursday." },
  {
    id: "2",
    role: "assistant",
    text: "Let's define the meeting outcome first. Is the priority to secure a follow-up, validate the thesis, or ask for a specific introduction?",
  },
  { id: "3", role: "user", text: "Secure a follow-up and make the investment thesis clear." },
  {
    id: "4",
    role: "assistant",
    text: "Good. I'll structure the work around a concise opening ask, approved evidence and three follow-up actions.",
  },
];

const initialTasks: Task[] = [
  { id: "t1", label: "Confirm the meeting outcome", status: "complete" },
  { id: "t2", label: "Draft the six-slide narrative", status: "active" },
  { id: "t3", label: "Validate revenue evidence", status: "blocked" },
  { id: "t4", label: "Prepare the opening ask", status: "ready" },
];

const deterministicReplies = [
  "That's a good angle. Let's make sure the evidence supports it clearly before Thursday.",
  "I can help structure that. Which part would you like to nail down first — the narrative or the numbers?",
  "Understood. I'll keep the opening ask concise and tie it directly to the follow-up outcome.",
  "Worth noting: investors at this stage respond better to traction than to projection. Shall we lead with that?",
];
let replyIdx = 0;

export function getNextReply(): string {
  return deterministicReplies[replyIdx++ % deterministicReplies.length];
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("forest-cream");
  const [messages, setMessages] = useState<Message[]>(initial);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [outcomeSuccess, setOutcomeSuccess] = useState<number | null>(null);
  const [learningApproved, setLearningApproved] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>("demo");

  function addMessage(msg: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: String(Date.now()) }]);
  }

  function setTaskStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: String(Date.now()), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = String(Date.now() + 1);
    const pending: Message = { id: assistantId, role: "assistant", text: "", streaming: true };
    setMessages((prev) => [...prev, pending]);
    setIsStreaming(true);

    try {
      if (runtimeMode === "demo") {
        await new Promise((resolve) => setTimeout(resolve, 650));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: getNextReply(), streaming: false } : m
          )
        );
        return;
      }

      const history = messages
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.text }));

      const chatEndpoint = import.meta.env.VITE_CHAT_ENDPOINT || "https://xmesqilkgeaoqrxbooqe.supabase.co/functions/v1/chat";
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("API error");

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                accumulated += parsed.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, text: accumulated } : m
                  )
                );
              }
            } catch { /* skip malformed */ }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m
          )
        );
      } else {
        const json = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: json.text || getNextReply(), streaming: false } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: getNextReply(), streaming: false } : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, runtimeMode]);

  return (
    <Ctx.Provider
      value={{
        theme,
        messages,
        tasks,
        outcomeSuccess,
        learningApproved,
        sidebarOpen,
        isStreaming,
        runtimeMode,
        setTheme,
        setRuntimeMode,
        sendMessage,
        addMessage,
        setTaskStatus,
        setOutcomeSuccess,
        approveLearning: () => setLearningApproved(true),
        dismissLearning: () => setLearningApproved(false),
        setSidebarOpen,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
