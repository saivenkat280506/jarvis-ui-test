"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AgentStep } from "@/lib/types";

const STATUS_COLOR: Record<AgentStep["status"], string> = {
  running: "text-cyan-700",
  done: "text-emerald-600",
  stopped: "text-amber-600",
  error: "text-rose-600",
};

function AgentStepRow({
  stepData,
  isLatest,
}: {
  stepData: AgentStep;
  isLatest: boolean;
}) {
  const { step, total, action, result, status } = stepData;
  const isDone = action === "DONE" || action === "STOPPED";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-xs transition-all ${
        isLatest
          ? "border-cyan-200 bg-cyan-50"
          : "border-slate-200/80 bg-white/70"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold uppercase tracking-widest text-slate-400">
          {isDone ? "✓" : `Step ${step}${total ? `/${total}` : ""}`}
        </span>
        <span className={`font-bold uppercase tracking-wider ${STATUS_COLOR[status]}`}>
          {status}
        </span>
      </div>
      <code className="mt-1 break-all font-mono text-[11px] text-cyan-800">
        {action}
      </code>
      {result && result !== "executing..." && (
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
          {result}
        </p>
      )}
      {isLatest && status === "running" && result === "executing..." && (
        <div className="mt-1 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
              className="h-1 w-1 rounded-full bg-cyan-500"
            />
          ))}
          <span className="text-[10px] text-cyan-700">Executing…</span>
        </div>
      )}
    </motion.div>
  );
}

export default function AgentOverlay({
  steps,
  onStop,
  visible,
}: {
  steps: AgentStep[];
  onStop: () => void;
  visible: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  const latest = steps[steps.length - 1];
  const latestStatus = latest?.status ?? "running";
  const isComplete = latestStatus === "done" || latestStatus === "stopped";
  const task = steps[0]?.task ?? "";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="agent-overlay"
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto fixed right-6 bottom-28 z-50 flex max-h-[55vh] w-[380px] flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3">
            <div className="flex items-center gap-2">
              {!isComplete && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-cyan-500"
                />
              )}
              {isComplete && latestStatus === "done" && (
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              )}
              {isComplete && latestStatus === "stopped" && (
                <span className="h-2 w-2 rounded-full bg-amber-400" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
                Agent {isComplete ? (latestStatus === "done" ? "Done" : "Stopped") : "Running"}
              </span>
            </div>
            {!isComplete && (
              <button
                onClick={onStop}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 transition hover:bg-rose-100"
              >
                ■ Stop
              </button>
            )}
          </div>

          {task && (
            <div className="border-b border-slate-100 px-5 py-2">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Task</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600">{task}</p>
            </div>
          )}

          <div className="custom-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
            {steps.map((s, idx) => (
              <AgentStepRow
                key={`${s.step}-${idx}`}
                stepData={s}
                isLatest={idx === steps.length - 1}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
