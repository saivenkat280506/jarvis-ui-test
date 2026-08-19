"use client";

import { cn } from "@/lib/utils";
import type { OrbVisualState } from "@/lib/types";

export default function OrbAura({ state }: { state: OrbVisualState }) {
  const busy = state === "listening" || state === "thinking" || state === "talking";

  return (
    <div className="pointer-events-none absolute inset-[-18%] z-0">
      <span className={cn("ripple", busy && "ripple-fast")} />
      <span className={cn("ripple ripple-delay", busy && "ripple-fast")} />
      <span
        className={cn(
          "absolute inset-[22%] rounded-full",
          "bg-[radial-gradient(circle,rgba(14,116,144,0.12)_0%,transparent_62%)]",
          "dark:bg-[radial-gradient(circle,rgba(20,140,168,0.16)_0%,transparent_64%)]",
        )}
      />
      <span className="orbit-spark">
        <span className="orbit-spark-dot" />
      </span>
    </div>
  );
}
