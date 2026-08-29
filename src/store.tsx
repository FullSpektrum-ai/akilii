import { createContext, useContext, useState, ReactNode } from "react";

export type MessageRole = "user" | "assistant";
export interface Message {
  id: string;
  role: MessageRole;
  text: string;
}

export type TaskStatus = "complete" | "active" | "blocked" | "ready";
export interface Task {
  id: string;
  label: string;
  status: TaskStatus;
}

export type Theme = "light" | "dark";

export interface AppState {
  theme: Theme;
  messages: Message[];
  tasks: Task[];
  outcomeSuccess: number | null;
  learningApproved: boolean | null;
  sidebarOpen: boolean;
  setTheme: (t: Theme) => void;
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

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [messages, setMessages] = useState<Message[]>(initial);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [outcomeSuccess, setOutcomeSuccess] = useState<number | null>(null);
  const [learningApproved, setLearningApproved] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function addMessage(msg: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: String(Date.now()) }]);
  }

  function setTaskStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  return (
    <Ctx.Provider
      value={{
        theme,
        messages,
        tasks,
        outcomeSuccess,
        learningApproved,
        sidebarOpen,
        setTheme,
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
