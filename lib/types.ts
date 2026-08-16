export type AgentState =
  | "idle"
  | "idle_listening"
  | "thinking"
  | "listening"
  | "talking"
  | "transcribing"
  | "offline"
  | null;

export type OrbVisualState =
  | "idle"
  | "listening"
  | "thinking"
  | "talking"
  | "offline";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  model?: string;
  isStreaming?: boolean;
}

export interface AgentStep {
  step: number;
  total?: number;
  action: string;
  result?: string;
  status: "running" | "done" | "stopped" | "error";
  task?: string;
}

export function mapAgentToOrb(
  state: AgentState,
  speaking = false,
): OrbVisualState {
  if (state === "offline") return "offline";
  if (speaking || state === "talking") return "talking";
  if (state === "listening" || state === "idle_listening") return "listening";
  if (state === "thinking" || state === "transcribing") return "thinking";
  return "idle";
}
