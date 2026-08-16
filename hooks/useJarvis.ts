"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentState, AgentStep, ChatMessage } from "@/lib/types";

function createMessage(
  role: ChatMessage["role"],
  content: string,
  model = "groq",
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
    model,
  };
}

function replyFor(prompt: string) {
  const q = prompt.toLowerCase();
  if (q.includes("time")) {
    return "It is just after eight, sir. The console is running in UI preview — no core is attached.";
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("jarvis")) {
    return "Good evening, sir. Consciousness interface is standing by.";
  }
  if (q.includes("open")) {
    return "I would open that for you once this design is wired to the live desktop. For now I am only the face.";
  }
  return `Understood, sir. "${prompt}" is noted. This sandbox is visual only — the orb, chat, and voice states are here so we can finish the light UI.`;
}

export function useJarvis() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamText, setStreamText] = useState("");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agentSteps] = useState<AgentStep[]>([]);
  const [agentVisible] = useState(false);
  const [streamModel] = useState("groq");
  const [isProcessing, setIsProcessing] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seededWelcomeRef = useRef(false);
  const listenDemoRef = useRef(false);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    if (seededWelcomeRef.current) return;
    seededWelcomeRef.current = true;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Good evening, sir. All systems are online.",
        timestamp: Date.now(),
        model: "groq",
      },
    ]);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const streamReply = useCallback(
    (full: string) => {
      setAgentState("talking");
      const words = full.split(" ");
      let i = 0;
      const tick = () => {
        i += 1;
        setStreamText(words.slice(0, i).join(" "));
        if (i < words.length) {
          later(38, tick);
          return;
        }
        later(280, () => {
          setMessages((prev) => [...prev, createMessage("assistant", full)]);
          setStreamText("");
          setIsProcessing(false);
          setAgentState("idle");
        });
      };
      later(160, tick);
    },
    [later],
  );

  const sendMessage = useCallback(
    (raw?: string) => {
      const trimmed = (raw ?? input).trim();
      if (!trimmed || isProcessing) return;

      clearTimers();
      setIsProcessing(true);
      setInput("");
      setTranscript("");
      setStreamText("");
      setMessages((prev) => [...prev, createMessage("user", trimmed)]);
      setAgentState("thinking");
      later(520, () => streamReply(replyFor(trimmed)));
    },
    [clearTimers, input, isProcessing, later, streamReply],
  );

  const toggleMic = useCallback(() => {
    clearTimers();

    if (agentState === "listening" || listenDemoRef.current) {
      listenDemoRef.current = false;
      setTranscript("");
      setAgentState("idle");
      return;
    }

    listenDemoRef.current = true;
    setAgentState("listening");
    setTranscript("");
    later(700, () => setTranscript("What time is it"));
    later(1600, () => setTranscript("What time is it right now"));
    later(2400, () => {
      listenDemoRef.current = false;
      const spoken = "What time is it right now?";
      setTranscript("");
      setMessages((prev) => [...prev, createMessage("user", spoken)]);
      setIsProcessing(true);
      setAgentState("thinking");
      later(480, () => streamReply(replyFor(spoken)));
    });
  }, [agentState, clearTimers, later, streamReply]);

  const toggleMute = useCallback(() => {
    setIsMuted((v) => !v);
  }, []);

  const clearChat = useCallback(() => {
    clearTimers();
    listenDemoRef.current = false;
    setMessages([]);
    setStreamText("");
    setTranscript("");
    setIsProcessing(false);
    setAgentState("idle");
  }, [clearTimers]);

  const stopAgent = useCallback(() => {
    clearTimers();
    setAgentState("idle");
    setIsProcessing(false);
  }, [clearTimers]);

  return {
    messages,
    input,
    setInput,
    streamText,
    agentState,
    isMuted,
    transcript,
    agentSteps,
    agentVisible,
    streamModel,
    isProcessing,
    backendStatus: "online" as const,
    latency: 12,
    isOnline: true,
    isListening: agentState === "listening",
    sendMessage,
    toggleMic,
    toggleMute,
    clearChat,
    stopAgent,
  };
}
