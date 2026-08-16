"use client";

import { useEffect, useMemo, useState } from "react";
import ConsciousnessRail from "@/components/jarvis/ConsciousnessRail";
import ChatPane from "@/components/jarvis/ChatPane";
import AgentOverlay from "@/components/jarvis/AgentOverlay";
import { useJarvis } from "@/hooks/useJarvis";
import { mapAgentToOrb, type OrbVisualState } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function JarvisShell() {
  const jarvis = useJarvis();
  const [layout, setLayout] = useState<"console" | "focus">("console");

  const [preview, setPreview] = useState<OrbVisualState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "focus") setLayout("focus");
    const nextPreview = params.get("preview");
    if (
      nextPreview === "idle" ||
      nextPreview === "listening" ||
      nextPreview === "thinking" ||
      nextPreview === "talking" ||
      nextPreview === "offline"
    ) {
      setPreview(nextPreview);
    }
  }, []);

  const liveOrb = mapAgentToOrb(jarvis.agentState, Boolean(jarvis.streamText));
  const orbState = preview ?? liveOrb;

  const modeLabel = useMemo(() => {
    if (orbState === "offline") return "OFFLINE";
    return orbState.toUpperCase();
  }, [orbState]);

  const latencyLabel = jarvis.streamText ? "Paced stream" : "Live stream";

  return (
    <div className="relative h-screen w-full overflow-hidden text-slate-900">
      <div className="grid-veil absolute inset-0" />
      <div className="noise" />

      <AgentOverlay
        steps={jarvis.agentSteps}
        onStop={jarvis.stopAgent}
        visible={jarvis.agentVisible}
      />

      <div
        className={cn(
          "relative flex h-full",
          layout === "focus" && "items-center justify-center px-6 py-10",
        )}
      >
        <ConsciousnessRail
          orbState={orbState}
          routerLabel="Groq"
          modeLabel={modeLabel}
          voiceLabel={jarvis.isMuted ? "Muted" : "Jarvis Neural"}
          latencyLabel={latencyLabel}
          routerActive={jarvis.streamModel === "groq"}
          modeActive={orbState !== "idle" && orbState !== "offline"}
          voiceActive={!jarvis.isMuted}
          latencyActive={Boolean(jarvis.streamText)}
          preview={preview}
          onPreview={setPreview}
          compact={layout === "focus"}
          onToggleLayout={() =>
            setLayout((v) => (v === "console" ? "focus" : "console"))
          }
        />

        {layout === "console" && (
          <ChatPane
            messages={jarvis.messages}
            streamText={jarvis.streamText}
            transcript={jarvis.transcript}
            input={jarvis.input}
            setInput={jarvis.setInput}
            sendMessage={() => void jarvis.sendMessage()}
            toggleMic={() => void jarvis.toggleMic()}
            toggleMute={() => void jarvis.toggleMute()}
            clearChat={() => void jarvis.clearChat()}
            isListening={jarvis.isListening}
            isThinking={jarvis.isProcessing || jarvis.agentState === "thinking"}
            isMuted={jarvis.isMuted}
            streamModel={jarvis.streamModel}
          />
        )}
      </div>
    </div>
  );
}
