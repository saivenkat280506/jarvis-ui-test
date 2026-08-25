"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AgentState } from "@/components/ui/orb";
import { Waveform } from "@/components/ui/waveform";
import { Mic, MicOff, Settings2, WifiOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mapAgentToOrb } from "@/lib/types";
import CrystalOrbHud from "@/components/jarvis/CrystalOrbHud";

const CrystalOrb = dynamic(() => import("@/components/jarvis/CrystalOrb"), {
  ssr: false,
});

interface LeftPanelProps {
  agentState: AgentState;
  isListening: boolean;
  isBackendOnline?: boolean;
  toggleMic: () => void;
  speechTranscript: string;
}

export default function LeftPanel({ 
  agentState, 
  isListening,
  isBackendOnline = true,
  toggleMic,
  speechTranscript,
}: LeftPanelProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const isOffline = agentState === "offline" || !isBackendOnline;
  const isActive = !isOffline && agentState !== "idle";

  const waveformData = isActive
    ? Array.from({ length: 40 }, (_, i) => {
        const base = agentState === "talking" ? 0.58 : 0.32;
        const variance = agentState === "talking" ? 0.36 : 0.18;
        const wave = Math.abs(Math.sin(i * 0.55 + (agentState === "talking" ? 1.2 : 0.4)));
        return base + variance * wave;
      })
    : [];

  const statusLabel = isOffline
    ? "Backend Offline"
    : agentState === "idle_listening"
    ? "Voice Call Active"
    : "System Active";

  const statusDot = isOffline ? "bg-red-500" : "bg-emerald-500 animate-pulse";

  return (
    <aside className="relative flex h-full w-[80%] min-w-0 flex-col overflow-hidden rounded-3xl p-6 shadow-sm glass">
      <div className="orb-grid pointer-events-none absolute inset-0 rounded-3xl" />
      <div className="relative z-10 flex items-center">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", statusDot)} />
          <span className={cn(
            "text-[11px] font-bold tracking-widest uppercase",
            isOffline ? "text-red-500/80" : "text-muted-foreground"
          )}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-[min(68%,78vh)] orb-float">
          <div className="orb-stage">
            <CrystalOrb state={mapAgentToOrb(agentState)} />
          </div>
          <CrystalOrbHud state={mapAgentToOrb(agentState)} />
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[200px] flex-col items-center gap-3 pb-1">
        <div className="flex h-8 w-40 items-center justify-center">
          <Waveform
            data={waveformData}
            barWidth={2}
            barGap={2}
            barRadius={8}
            fadeEdges={true}
            height={28}
            className="h-full w-full opacity-60"
            barColor={isDark ? "#22d3ee" : "#0e7490"}
          />
        </div>
        {(speechTranscript || agentState === "thinking" || agentState === "transcribing") && (
          <div className="p-3 bg-white/40 dark:bg-zinc-800/40 border border-white/60 dark:border-zinc-700/60 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <p className="text-[13px] text-foreground leading-snug line-clamp-2 italic font-inter opacity-80">
              {speechTranscript ? `"${speechTranscript.trim()}"` : (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                  {agentState === "transcribing" ? "Transcribing..." : "Processing..."}
                </span>
              )}
            </p>
          </div>
        )}

        {(() => {
          const stateConfig = {
            idle: { label: "Voice Mode", color: "bg-primary hover:bg-cyan-800 dark:hover:bg-cyan-300", icon: Mic },
            idle_listening: { label: "On Call", color: "bg-emerald-600 hover:bg-emerald-700", icon: Mic },
            listening: { label: "Listening", color: "bg-emerald-500 hover:bg-emerald-600 animate-pulse", icon: Mic },
            transcribing: { label: "Transcribing", color: "bg-purple-500 hover:bg-purple-600", icon: Zap },
            thinking: { label: "Thinking", color: "bg-amber-500 hover:bg-amber-600 animate-pulse", icon: Settings2 },
            talking: { label: "Speaking", color: "bg-blue-500 hover:bg-blue-600", icon: Mic },
            offline: { label: "Backend Offline", color: "bg-red-500/80 hover:bg-red-600/80", icon: WifiOff },
          };
          const config = stateConfig[agentState as keyof typeof stateConfig] || stateConfig.idle;
          const inSession = agentState !== "idle" && agentState !== "offline";
          const Icon = inSession ? MicOff : config.icon;
          const label = agentState === "idle" ? "Voice Mode" : config.label;

          return (
            <Button 
              onClick={toggleMic}
              disabled={isOffline}
              className={cn(
                "h-9 w-[168px] rounded-xl gap-2 border-none px-3 text-xs shadow-sm font-medium text-white dark:text-slate-950",
                inSession || isOffline ? config.color : "bg-primary hover:bg-cyan-800 dark:hover:bg-cyan-300",
                isOffline && "opacity-80 cursor-not-allowed"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", agentState === "listening" && "animate-pulse")} />
              <span>{label}</span>
            </Button>
          );
        })()}
      </div>
    </aside>
  );
}
