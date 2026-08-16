"use client";

import dynamic from "next/dynamic";
import { Cpu, Globe, Maximize2, Minimize2, Volume2 } from "lucide-react";
import type { OrbVisualState } from "@/lib/types";
import StatCard from "@/components/jarvis/StatCard";
import CrystalOrbHud from "@/components/jarvis/CrystalOrbHud";
import { cn } from "@/lib/utils";

const CrystalOrb = dynamic(() => import("@/components/jarvis/CrystalOrb"), {
  ssr: false,
});

const PREVIEW_STATES: { id: OrbVisualState; label: string }[] = [
  { id: "idle", label: "Standby" },
  { id: "listening", label: "Listen" },
  { id: "thinking", label: "Think" },
  { id: "talking", label: "Speak" },
];

type ConsciousnessRailProps = {
  orbState: OrbVisualState;
  routerLabel: string;
  modeLabel: string;
  voiceLabel: string;
  latencyLabel: string;
  routerActive: boolean;
  modeActive: boolean;
  voiceActive: boolean;
  latencyActive: boolean;
  preview: OrbVisualState | null;
  onPreview: (state: OrbVisualState | null) => void;
  compact?: boolean;
  onToggleLayout?: () => void;
};

export default function ConsciousnessRail({
  orbState,
  routerLabel,
  modeLabel,
  voiceLabel,
  latencyLabel,
  routerActive,
  modeActive,
  voiceActive,
  latencyActive,
  preview,
  onPreview,
  compact = false,
  onToggleLayout,
}: ConsciousnessRailProps) {
  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-y-auto border-slate-200/80 bg-white/55 p-6 backdrop-blur-2xl custom-scrollbar",
        compact
          ? "w-full max-w-[560px] rounded-[28px] border-white/80 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
          : "w-[300px] border-r xl:w-[420px]",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-[family-name:var(--font-display)] text-[11px] uppercase tracking-[0.35em] text-cyan-700">
            JARVIS CORE
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Consciousness Interface
          </h1>
        </div>
        {onToggleLayout && (
          <button
            type="button"
            onClick={onToggleLayout}
            className="mt-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 hover:border-cyan-200 hover:text-cyan-700"
            aria-label={compact ? "Open console" : "Orb focus"}
          >
            {compact ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            {compact ? "Console" : "Focus"}
          </button>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center py-4">
        <div className="relative aspect-square w-full max-w-[420px]">
          <div className="orb-well" />
          <CrystalOrb state={orbState} />
          <CrystalOrbHud state={orbState} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Globe className="h-4 w-4" />}
          label="Router"
          value={routerLabel}
          active={routerActive}
        />
        <StatCard
          icon={<Cpu className="h-4 w-4" />}
          label="Mode"
          value={modeLabel}
          active={modeActive}
        />
        <StatCard
          icon={<Volume2 className="h-4 w-4" />}
          label="Voice"
          value={voiceLabel}
          active={voiceActive}
        />
        <StatCard
          icon={<span className="text-cyan-600">+</span>}
          label="Latency"
          value={latencyLabel}
          active={latencyActive}
        />
      </div>

      <div className="mt-4 mb-2 flex flex-wrap items-center gap-1.5 pl-12">
        <span className="mr-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.22em] text-slate-400">
          Preview
        </span>
        {PREVIEW_STATES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPreview(preview === item.id ? null : item.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition",
              preview === item.id
                ? "border-cyan-400 bg-cyan-50 text-cyan-800"
                : "border-slate-200 bg-white/70 text-slate-500 hover:border-cyan-200 hover:text-cyan-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
