"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff, SendHorizontal, Volume2, VolumeX, RefreshCcw } from "lucide-react";
import { useChatScroll } from "@/hooks/useChatScroll";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODEL_META: Record<string, { label: string; tone: string }> = {
  groq: { label: "Groq", tone: "Fast routing" },
  llama: { label: "Llama 3.3", tone: "High reasoning" },
  "llama-3.3-70b-versatile": { label: "Llama 3.3 70B", tone: "High reasoning" },
  "llama-3.1-8b-instant": { label: "Llama 3.1 8B", tone: "Quick responses" },
};

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type ChatPaneProps = {
  messages: ChatMessage[];
  streamText: string;
  transcript: string;
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  toggleMic: () => void;
  toggleMute: () => void;
  clearChat: () => void;
  isListening: boolean;
  isThinking: boolean;
  isMuted: boolean;
  isOnline: boolean;
  streamModel: string;
};

export default function ChatPane({
  messages,
  streamText,
  transcript,
  input,
  setInput,
  sendMessage,
  toggleMic,
  toggleMute,
  clearChat,
  isListening,
  isThinking,
  isMuted,
  isOnline,
  streamModel,
}: ChatPaneProps) {
  const chatRef = useChatScroll([messages, streamText, transcript]);
  const activeModel = MODEL_META[streamModel] ?? MODEL_META.groq;

  return (
    <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <header className="title-drag flex items-center justify-between border-b border-slate-200/80 bg-white/50 px-6 py-3.5 backdrop-blur-2xl">
        <div className="title-no-drag flex items-center gap-2">
          <button
            type="button"
            onClick={clearChat}
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <RefreshCcw className="h-3 w-3 transition-transform group-hover:rotate-180" />
            Refresh Chat
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition",
              isMuted
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-cyan-200 bg-cyan-50 text-cyan-700",
            )}
          >
            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {isMuted ? "Muted" : "Voice On"}
          </button>
        </div>

        <div className="title-no-drag flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
            {activeModel.label} processing
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.2em] text-slate-400 sm:inline">
            {activeModel.tone}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-slate-500">
            Local
          </span>
        </div>
      </header>

      <section className="relative flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
          {messages.length === 0 && !streamText && (
            <div className="mx-auto mt-16 max-w-md text-center">
              <p className="font-[family-name:var(--font-display)] text-[11px] uppercase tracking-[0.35em] text-cyan-700">
                Conversation
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Ask for a search, a command, or a deep explanation. The orb will
                shift as Jarvis listens, thinks, and speaks.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.article
                key={message.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-[2rem] border px-6 py-4 shadow-sm backdrop-blur-xl",
                    message.role === "user"
                      ? "border-slate-800 bg-slate-900 text-slate-50"
                      : "border-cyan-100 bg-white/90 text-slate-800",
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em]",
                      message.role === "user" ? "text-white/40" : "text-cyan-700",
                    )}
                  >
                    <span>{message.role === "user" ? "USER" : "JARVIS"}</span>
                    {message.model && (
                      <span className="opacity-50">
                        • {MODEL_META[message.model]?.label ?? message.model}
                      </span>
                    )}
                    <span className="opacity-50">• {timeLabel(message.timestamp)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-wide">
                    {message.content}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {streamText && (
              <motion.article
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-[2rem] border border-cyan-200 bg-cyan-50/90 px-6 py-4 text-slate-800 shadow-[0_0_40px_rgba(8,145,178,0.08)]">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-700">
                    <span>JARVIS</span>
                    <span>• {activeModel.label}</span>
                    <span className="flex items-center gap-1">
                      • <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" /> LIVE
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-wide">
                    {streamText}
                    <span className="ml-1 inline-block h-4 w-[2.5px] animate-pulse bg-cyan-500 align-middle" />
                  </p>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
          <div ref={chatRef} />
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/60 px-4 py-4 backdrop-blur-2xl lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          <div className="rounded-3xl border border-white bg-white/80 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-end gap-3">
              <label className="sr-only" htmlFor="jarvis-message">
                Message
              </label>
              <input
                id="jarvis-message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={
                  isOnline
                    ? "Ask for a search, a command, or a deep explanation..."
                    : "Backend offline — design preview still works"
                }
                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white"
              />

              <button
                type="button"
                onClick={toggleMic}
                aria-label={isListening ? "Stop voice" : "Start voice"}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border transition",
                  isListening
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    : isThinking
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
                )}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isThinking}
                aria-label="Send message"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence>
              {(isListening || transcript) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 10 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex flex-col gap-1 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                        {isListening ? "Live Transcription" : "Processing Input"}
                      </span>
                      {isListening && (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-rose-500">
                            Rec
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {transcript || (isListening ? "Listening..." : "Preparing request...")}
                      {isListening && (
                        <span className="ml-1 inline-block h-3 w-[1.5px] animate-pulse bg-cyan-500" />
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <span className="flex items-center gap-2">
              <span className="text-cyan-600">+</span>
              Text is committed once, then streamed live in the preview
            </span>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  isOnline
                    ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    : "bg-rose-400",
                )}
              />
              {isOnline ? `${activeModel.label} active` : "Core offline"}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
