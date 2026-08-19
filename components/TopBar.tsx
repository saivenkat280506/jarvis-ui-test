"use client";

import { RotateCcw, Moon, Sun } from "lucide-react";
import type { Theme } from "@/hooks/useTheme";
import { useBackendStatus, BackendStatus } from "@/hooks/useBackendStatus";

interface TopBarProps {
  onRefreshChat: () => void;
  backendStatus?: BackendStatus;
  backendLatency?: number | null;
  theme?: Theme;
  onToggleTheme?: () => void;
}

const iconBtn =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/60 bg-white/40 shadow-sm outline-none transition-all hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 dark:border-zinc-700/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/80";

export default function TopBar({
  onRefreshChat,
  backendStatus: backendStatusProp,
  backendLatency: _backendLatency,
  theme = "light",
  onToggleTheme,
}: TopBarProps) {
  const polled = useBackendStatus(backendStatusProp ? 60000 : 5000);
  const status = backendStatusProp ?? polled.status;

  const isOnline = status === "online";
  const isChecking = status === "checking";
  const isOffline = status === "offline";

  return (
    <header className="relative z-50 flex h-12 w-full shrink-0 items-center gap-2 rounded-2xl px-2.5 shadow-sm glass">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              isChecking ? "bg-amber-400 animate-pulse" : isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="truncate text-[10px] font-bold tracking-[0.14em] text-zinc-900 uppercase dark:text-zinc-100">
            {isOffline ? "Offline" : "Core"}
          </span>
        </div>

        <button
          onClick={onRefreshChat}
          className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-zinc-200/60 bg-zinc-100 px-2 text-[9px] font-jetbrains tracking-wide text-zinc-600 uppercase shadow-sm outline-none hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 dark:border-zinc-700/60 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <RotateCcw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        className={iconBtn}
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        data-testid="theme-toggle"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-cyan-200" />
        ) : (
          <Moon className="h-4 w-4 text-cyan-800" />
        )}
      </button>
    </header>
  );
}
