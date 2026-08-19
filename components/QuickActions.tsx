"use client";

import { MessageSquareDashed, ShieldAlert, Zap, Trash2, Cpu } from "lucide-react";

interface QuickActionsProps {
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
}

export default function QuickActions({ onSendMessage, onClearChat }: QuickActionsProps) {
  const actions = [
    {
      label: "Introduce",
      icon: MessageSquareDashed,
      action: () => onSendMessage("Hello Jarvis, introduce yourself in one short sentence."),
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Time",
      icon: Cpu,
      action: () => onSendMessage("What time is it right now?"),
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Notepad",
      icon: Zap,
      action: () => onSendMessage("Open notepad."),
      color: "text-violet-500 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      label: "Joke",
      icon: ShieldAlert,
      action: () => onSendMessage("Tell me a short witty joke."),
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Clear",
      icon: Trash2,
      action: onClearChat,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  return (
    <div className="w-full flex-shrink-0 border-b border-border/20 bg-white/40 px-3 py-3 backdrop-blur-sm dark:bg-zinc-900/40">
      <div className="mb-2 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
          Suggested
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={act.action}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-white/80 bg-white/50 px-2 py-1.5 text-left shadow-sm outline-none transition-all hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98] dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <div className={`shrink-0 rounded-md p-1 ${act.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${act.color}`} />
              </div>
              <span className="truncate text-[11px] font-medium leading-tight text-zinc-700 dark:text-zinc-300">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
