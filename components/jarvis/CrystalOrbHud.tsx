"use client";

import { AnimatePresence, motion } from "motion/react";
import type { OrbVisualState } from "@/lib/types";

const STATUS_CONFIG: Record<
  OrbVisualState,
  {
    label: string;
    accent: string;
    glow: string;
    pulse: number[];
    ringScale: number[];
    orbitDuration: number;
    beamDuration: number;
  }
> = {
  idle: {
    label: "Standby",
    accent: "from-cyan-300/50 via-sky-400/35 to-transparent",
    glow: "rgba(86, 208, 255, 0.34)",
    pulse: [1, 1.02, 1],
    ringScale: [0.9, 1.02, 0.9],
    orbitDuration: 22,
    beamDuration: 12,
  },
  listening: {
    label: "Listening",
    accent: "from-cyan-200/70 via-sky-300/55 to-transparent",
    glow: "rgba(110, 227, 255, 0.48)",
    pulse: [1, 1.05, 1],
    ringScale: [0.92, 1.12, 0.92],
    orbitDuration: 9,
    beamDuration: 6,
  },
  thinking: {
    label: "Thinking",
    accent: "from-cyan-300/70 via-blue-400/55 to-transparent",
    glow: "rgba(73, 179, 255, 0.56)",
    pulse: [1, 1.08, 0.98, 1],
    ringScale: [0.92, 1.18, 0.92],
    orbitDuration: 4.5,
    beamDuration: 2.8,
  },
  talking: {
    label: "Speaking",
    accent: "from-cyan-100/80 via-cyan-300/60 to-transparent",
    glow: "rgba(140, 239, 255, 0.62)",
    pulse: [1, 1.1, 1],
    ringScale: [0.92, 1.15, 0.92],
    orbitDuration: 6.5,
    beamDuration: 3.6,
  },
  offline: {
    label: "Offline",
    accent: "from-slate-400/40 via-slate-500/25 to-transparent",
    glow: "rgba(100, 116, 139, 0.28)",
    pulse: [1, 1.01, 1],
    ringScale: [0.96, 1.0, 0.96],
    orbitDuration: 36,
    beamDuration: 22,
  },
};

const ORBIT_POINTS = [
  { top: "10%", left: "50%" },
  { top: "23%", left: "79%" },
  { top: "50%", left: "90%" },
  { top: "77%", left: "79%" },
  { top: "90%", left: "50%" },
  { top: "77%", left: "21%" },
  { top: "50%", left: "10%" },
  { top: "23%", left: "21%" },
];

export default function CrystalOrbHud({ state }: { state: OrbVisualState }) {
  const config = STATUS_CONFIG[state];

  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-[10%] rounded-full blur-3xl"
        animate={{ opacity: [0.45, 0.92, 0.45], scale: config.pulse }}
        transition={{
          duration: state === "thinking" ? 2.2 : 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(circle, ${config.glow} 0%, rgba(19, 61, 107, 0.14) 48%, transparent 76%)`,
        }}
      />

      <motion.div
        className={`absolute inset-[5%] rounded-full bg-linear-to-br ${config.accent} opacity-40 blur-2xl`}
        animate={{ rotate: 360 }}
        transition={{
          duration: config.orbitDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="absolute inset-0 rounded-full border border-cyan-300/20 bg-[radial-gradient(circle_at_center,rgba(0,30,54,0.2),rgba(0,0,0,0.05)_58%,transparent_75%)] shadow-[inset_0_0_100px_rgba(40,167,255,0.08),0_0_70px_rgba(0,158,255,0.08)]" />

      <div
        className="absolute inset-[7%] rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(circle, transparent 38%, rgba(56, 189, 248, 0.18) 46%, rgba(125, 241, 255, 0.55) 54%, rgba(34, 211, 238, 0.28) 61%, transparent 70%)",
          filter: "blur(0.4px)",
        }}
      />
      <div
        className="absolute inset-[9%] rounded-full mix-blend-screen opacity-80"
        style={{
          background:
            "conic-gradient(from 40deg, rgba(56,189,248,0.05), rgba(165,243,252,0.45) 18%, rgba(8,145,178,0.08) 32%, rgba(125,241,255,0.4) 54%, rgba(14,116,144,0.08) 70%, rgba(186,230,253,0.42) 86%, rgba(56,189,248,0.05))",
          maskImage:
            "radial-gradient(circle, transparent 40%, black 48%, black 62%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 40%, black 48%, black 62%, transparent 70%)",
        }}
      />

      <motion.div
        className="absolute inset-[10%] rounded-full border border-cyan-200/20"
        animate={{ scale: config.ringScale, opacity: [0.2, 0.72, 0.2] }}
        transition={{
          duration: state === "thinking" ? 2.1 : 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-[18%] rounded-full border border-cyan-200/25"
        animate={{ rotate: 360 }}
        transition={{
          duration: config.orbitDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {ORBIT_POINTS.map((point, index) => (
          <motion.span
            key={index}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(125,241,255,0.9)]"
            style={{ top: point.top, left: point.left }}
            animate={{
              scale:
                state === "idle" || state === "offline"
                  ? [0.75, 1.05, 0.75]
                  : [0.85, 1.35, 0.85],
              opacity: state === "thinking" ? [0.3, 1, 0.45] : [0.35, 0.9, 0.35],
            }}
            transition={{
              duration: state === "thinking" ? 1.3 : 1.9,
              repeat: Infinity,
              delay: index * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-[19%] rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 180deg, transparent 0deg, rgba(163, 241, 255, 0.9) 54deg, transparent 120deg, transparent 360deg)",
          maskImage:
            "radial-gradient(circle, transparent 56%, black 57%, black 63%, transparent 64%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 56%, black 57%, black 63%, transparent 64%)",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: config.beamDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-[24%] rounded-full border border-cyan-100/10 bg-[linear-gradient(145deg,rgba(7,18,29,0.55),rgba(7,13,20,0.28))] backdrop-blur-[2px] shadow-[inset_0_0_40px_rgba(0,174,255,0.12)]"
        animate={{ scale: config.pulse }}
        transition={{
          duration: state === "thinking" ? 1.8 : 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(193,246,255,0.18),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(31,164,255,0.15),transparent_45%)]" />
        <div className="orb-scan" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-[0.6em] text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] sm:text-[14px]"
            >
              Jarvis
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={config.label}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                className="mt-3 font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] sm:mt-4 sm:text-3xl"
              >
                {config.label}
              </motion.div>
            </AnimatePresence>

            <motion.div
              animate={{ width: ["20%", "60%", "20%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mt-5 h-[2px] bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-40 sm:mt-6"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
