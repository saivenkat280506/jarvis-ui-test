"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JARVIS_BACKEND } from "@/lib/backend";
import type { AgentState, AgentStep, ChatMessage } from "@/lib/types";
import { useBackendStatus } from "@/hooks/useBackendStatus";

const WS_URL = JARVIS_BACKEND.replace(/^http/, "ws") + "/ws";

function createMessage(
  role: ChatMessage["role"],
  content: string,
  model?: string,
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
    ...(model ? { model } : {}),
  };
}

function extractPayloads(buffer: string) {
  const frames = buffer.split("\n\n");
  const remainder = frames.pop() || "";
  const payloads: Array<Record<string, unknown>> = [];

  for (const frame of frames) {
    const line = frame.split("\n").find((entry) => entry.startsWith("data: "));
    if (!line) continue;
    try {
      payloads.push(JSON.parse(line.slice(6)));
    } catch {
      // wait for the next clean chunk
    }
  }

  return { payloads, remainder };
}

export function useJarvis() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamText, setStreamText] = useState("");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [agentVisible, setAgentVisible] = useState(false);
  const [streamModel, setStreamModel] = useState("groq");
  const [isProcessing, setIsProcessing] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatAbortRef = useRef<AbortController | null>(null);
  const wasOfflineRef = useRef(false);
  const hideAgentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seededWelcomeRef = useRef(false);

  const { status: backendStatus, latency, isOnline } = useBackendStatus(5000);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === message.role && last?.content === message.content) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const resetToOffline = useCallback(() => {
    setAgentState("offline");
    setStreamText("");
    setTranscript("");
  }, []);

  const resetToIdle = useCallback(() => {
    setAgentState("idle");
    setStreamText("");
    setTranscript("");
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

  useEffect(() => {
    fetch(`${JARVIS_BACKEND}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.muted === "boolean") setIsMuted(data.muted);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (backendStatus === "offline") {
      if (!wasOfflineRef.current) {
        wasOfflineRef.current = true;
        resetToOffline();
      }
    } else if (backendStatus === "online") {
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setAgentState((s) => (s === "offline" ? "idle" : s));
      }
    }
  }, [backendStatus, resetToOffline]);

  useEffect(() => {
    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connectWs();
      }, 3000);
    };

    const connectWs = () => {
      if (
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setAgentState((s) => (s === "offline" ? "idle" : s));
      };

      ws.onmessage = (event) => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (typeof data.state === "string") {
          setAgentState(data.state as AgentState);
        }

        if (data.type === "chat" && typeof data.text === "string") {
          appendMessage(
            createMessage(
              (data.role as ChatMessage["role"]) || "assistant",
              data.text,
              "groq",
            ),
          );
        }

        if (data.type === "system_ready") {
          setAgentState("idle");
          setTranscript("");
        }

        if (data.type === "wake_word_detected") {
          setAgentState("listening");
          setTranscript("● Listening...");
        }

        if (data.type === "transcript_chunk" && typeof data.text === "string") {
          setAgentState("listening");
          setTranscript(data.text);
        }

        if (
          (data.type === "transcript" || data.type === "partial_transcript") &&
          typeof data.text === "string"
        ) {
          setTranscript(
            typeof data.countdown === "number" && data.countdown > 0
              ? `${data.text} … (sending in ${data.countdown}s)`
              : data.text,
          );
        }

        if (data.type === "transcript_final" && typeof data.text === "string") {
          setTranscript("");
          appendMessage(createMessage("user", data.text));
        }

        if (data.type === "user_message" && typeof data.text === "string") {
          setTranscript("");
          appendMessage(createMessage("user", data.text));
          setAgentState("thinking");
        }

        if (data.type === "transcript_clear") {
          setTranscript("");
        }

        if (data.type === "reset_complete") {
          setMessages([]);
          setStreamText("");
          setTranscript("");
          setAgentState((data.state as AgentState) || "idle");
        }

        if (data.type === "agent_step") {
          setAgentVisible(true);
          const step: AgentStep = {
            step: Number(data.step) || 0,
            total: typeof data.total === "number" ? data.total : undefined,
            action: String(data.action ?? data.action_name ?? "working"),
            result: typeof data.result === "string" ? data.result : undefined,
            status:
              data.status === "done" ||
              data.status === "stopped" ||
              data.status === "error"
                ? data.status
                : "running",
            task: typeof data.task === "string" ? data.task : undefined,
          };
          setAgentSteps((prev) => {
            const last = prev[prev.length - 1];
            if (
              last &&
              last.step === step.step &&
              last.action === step.action &&
              step.result &&
              step.result !== "executing..."
            ) {
              return [...prev.slice(0, -1), step];
            }
            return [...prev, step];
          });
          if (step.status === "done" || step.status === "stopped") {
            if (hideAgentTimerRef.current) clearTimeout(hideAgentTimerRef.current);
            hideAgentTimerRef.current = setTimeout(() => {
              setAgentVisible(false);
              setTimeout(() => setAgentSteps([]), 400);
            }, 3000);
          }
        }
      };

      ws.onclose = () => {
        resetToOffline();
        scheduleReconnect();
      };

      ws.onerror = () => ws.close();
    };

    connectWs();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (hideAgentTimerRef.current) clearTimeout(hideAgentTimerRef.current);
      wsRef.current?.close();
    };
  }, [appendMessage, resetToOffline]);

  const consumeAssistantStream = useCallback(
    async (response: Response) => {
      if (!response.ok) {
        throw new Error(`server_error_${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Missing response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let activeModelName = streamModel;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { payloads, remainder } = extractPayloads(buffer);
        buffer = remainder;

        for (const payload of payloads) {
          if (typeof payload.model === "string") {
            activeModelName = payload.model;
            setStreamModel(payload.model);
          }
          if (payload.error) {
            setStreamText("");
            setTranscript("");
            throw new Error(String(payload.error));
          }
          if (payload.text !== undefined) {
            assistantText = String(payload.text);
            setStreamText(assistantText);
            setAgentState("talking");
          }
          if (payload.done) {
            if (assistantText) {
              appendMessage(
                createMessage("assistant", assistantText, activeModelName),
              );
            }
            setStreamText("");
            setTranscript("");
            setAgentState("idle");
          }
        }
      }

      setStreamText("");
      setAgentState((s) => (s === "thinking" || s === "talking" ? "idle" : s));
    },
    [appendMessage, streamModel],
  );

  const sendMessage = useCallback(
    async (raw?: string) => {
      const trimmed = (raw ?? input).trim();
      if (!trimmed || isProcessing) return;

      setIsProcessing(true);
      appendMessage(createMessage("user", trimmed));
      setInput("");
      setTranscript("");
      setStreamText("");
      setAgentState("thinking");

      if (!isOnline) {
        appendMessage(
          createMessage(
            "assistant",
            "Core is offline, sir. I can show the interface, but I cannot complete that request until the backend is running.",
            "groq",
          ),
        );
        setAgentState("offline");
        setIsProcessing(false);
        return;
      }

      chatAbortRef.current?.abort();
      const controller = new AbortController();
      chatAbortRef.current = controller;

      try {
        const response = await fetch(`${JARVIS_BACKEND}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: trimmed,
            id: `req_${Date.now()}`,
          }),
          signal: controller.signal,
        });
        await consumeAssistantStream(response);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error && err.message.startsWith("server_error")
            ? "I encountered an issue with the link to my brain, sir."
            : "Slight hiccup there, sir. I couldn't complete that request.";
        appendMessage(createMessage("assistant", message, "groq"));
        setAgentState(isOnline ? "idle" : "offline");
        setStreamText("");
      } finally {
        if (chatAbortRef.current === controller) chatAbortRef.current = null;
        setIsProcessing(false);
      }
    },
    [appendMessage, consumeAssistantStream, input, isOnline, isProcessing],
  );

  const toggleMic = useCallback(async () => {
    if (!isOnline) {
      resetToOffline();
      return;
    }

    const inVoiceSession =
      agentState !== "idle" && agentState !== "offline" && agentState !== null;

    try {
      if (inVoiceSession) {
        await fetch(`${JARVIS_BACKEND}/stop-trigger`, { method: "POST" });
        resetToIdle();
        return;
      }
      const response = await fetch(`${JARVIS_BACKEND}/listen-trigger`, {
        method: "POST",
      });
      if (response.ok) {
        setAgentState("listening");
      } else {
        throw new Error("listen failed");
      }
    } catch {
      resetToOffline();
    }
  }, [agentState, isOnline, resetToIdle, resetToOffline]);

  const toggleMute = useCallback(async () => {
    try {
      const response = await fetch(`${JARVIS_BACKEND}/toggle-mute`, {
        method: "POST",
      });
      const data = await response.json();
      if (typeof data?.muted === "boolean") setIsMuted(data.muted);
    } catch {
      // keep local mute state
    }
  }, []);

  const clearChat = useCallback(async () => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setMessages([]);
    setStreamText("");
    setTranscript("");
    setAgentState(isOnline ? "idle" : "offline");
    setAgentSteps([]);
    setAgentVisible(false);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: "stop" }));
    }

    if (!isOnline) return;

    try {
      await fetch(`${JARVIS_BACKEND}/reset`, { method: "POST" });
    } catch {
      resetToOffline();
    }
  }, [isOnline, resetToOffline]);

  const stopAgent = useCallback(async () => {
    try {
      await fetch(`${JARVIS_BACKEND}/agent/stop`, { method: "POST" });
    } catch {
      // overlay will time out
    }
  }, []);

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
    backendStatus,
    latency,
    isOnline,
    isListening: agentState === "listening" || agentState === "idle_listening",
    sendMessage,
    toggleMic,
    toggleMute,
    clearChat,
    stopAgent,
  };
}
