"use client";

import { useChatScroll } from "@/hooks/useChatScroll";
import { Message, MessageContent, MessageAvatar } from "@/components/ui/message";
import { Response } from "@/components/ui/response";
import {
  TranscriptViewerAudio,
  TranscriptViewerContainer,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  TranscriptViewerWords,
} from "@/components/ui/transcript-viewer";
import { SendHorizontal, PauseIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SearchBriefing, { SearchBriefingData } from "@/components/SearchBriefing";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  type: "text" | "voice";
  content: string;
  time: string;
  isStreaming?: boolean;
  audioSrc?: string;
  alignment?: any;
  briefing?: SearchBriefingData;
}

export interface ChatAreaProps {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  sendMessage: (text: string) => void;
  streamingText?: string;
  speechTranscript?: string;
  agentState?: string;
  isBackendOnline?: boolean;
  toggleMic?: () => void;
}

export default function ChatArea({ 
  messages, 
  inputText, 
  setInputText, 
  sendMessage,
  streamingText,
  speechTranscript,
  agentState,
  isBackendOnline = true,
}: ChatAreaProps) {
  const scrollRef = useChatScroll([messages, streamingText, speechTranscript]);
  const isOffline = agentState === "offline" || !isBackendOnline;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-transparent">
      {isOffline && (
        <div className="mx-3 mt-3 rounded-2xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-center font-jetbrains text-[11px] text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Backend offline — Jarvis cannot listen, speak, or run tasks until the server is back.
        </div>
      )}
      {/* MESSAGES VIEWPORT */}
      <div 
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 scrollbar-hide"
      >
        <div className="flex flex-col gap-1 pb-4">
          <div className="flex items-center gap-2 px-0 py-2">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">Log</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className="msg-enter">
              <Message 
                from={msg.role === "assistant" ? "assistant" : "user"}
                className={msg.role === "assistant" ? "justify-start" : "justify-end"}
              >
                {msg.role === "assistant" && (
                  <MessageAvatar 
                    name="JV" 
                    className="mb-1 hidden self-end bg-white shadow-sm ring-1 ring-white ring-offset-1 dark:bg-zinc-800 dark:ring-zinc-700" 
                  />
                )}
                
                {msg.role === "assistant" && msg.audioSrc && msg.content.length > 180 ? (
                  /* BIG PARAGRAPH TRANSCRIPT VIEWER */
                  <div className="max-w-[85%] w-full">
                    <TranscriptViewerContainer
                      audioSrc={msg.audioSrc}
                      audioType="audio/mpeg"
                      alignment={msg.alignment || { characters: [], characterStartTimesSeconds: [], characterEndTimesSeconds: [] }}
                      className="bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-700/40 shadow-sm rounded-2xl p-4 backdrop-blur-md"
                    >
                      <TranscriptViewerAudio className="sr-only" />
                      <div className="mb-4">
                         <TranscriptViewerWords className="text-sm !leading-relaxed text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <TranscriptViewerPlayPauseButton className="h-8 w-8 rounded-full shrink-0">
                          {({ isPlaying }) => isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                        </TranscriptViewerPlayPauseButton>
                        <TranscriptViewerScrubBar className="flex-1" />
                      </div>
                    </TranscriptViewerContainer>
                    {msg.briefing && <SearchBriefing briefing={msg.briefing} />}
                    <span className="text-[9px] mt-1.5 opacity-40 font-jetbrains px-2">
                       {msg.time}
                    </span>
                  </div>
                ) : (
                  <MessageContent 
                    variant="contained" 
                    className={cn(
                      "font-inter leading-relaxed text-[14px] shadow-sm",
                      msg.role === "assistant" 
                        ? "rounded-2xl rounded-bl-none bg-white/90 dark:bg-cyan-950/25 border border-cyan-100/80 dark:border-cyan-500/20" 
                        : "rounded-2xl rounded-br-none bg-slate-900 text-slate-50 dark:bg-cyan-950/50 dark:text-cyan-50 dark:border dark:border-cyan-400/25"
                    )}
                  >
                    {msg.isStreaming && msg.role === "assistant" ? (
                      <Response>
                        {streamingText || msg.content}
                      </Response>
                    ) : (
                      msg.content
                    )}
                    {msg.role === "assistant" && msg.briefing && (
                      <SearchBriefing briefing={msg.briefing} />
                    )}
                    <span className={cn(
                      "text-[9px] mt-1.5 opacity-40 font-jetbrains",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}>
                      {msg.time}
                    </span>
                  </MessageContent>
                )}
              </Message>
            </div>
          ))}

          {/* LIVE TRANSCRIPTION BUBBLE (Google STT Style) */}
          {speechTranscript && (
            <div className="msg-enter">
              <Message from="user" className="justify-end opacity-70">
                <MessageContent 
                  variant="contained" 
                  className="rounded-2xl rounded-br-none bg-primary/40 text-primary-foreground dark:bg-sky-950/20 dark:text-cyan-200/70 font-inter text-[14px] italic border border-white/10 dark:border-cyan-500/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    {speechTranscript}
                  </div>
                </MessageContent>
              </Message>
            </div>
          )}
        </div>
      </div>

      {/* INPUT AREA - High Fidelity Floating Design */}
      <div className="w-full shrink-0 px-3 pb-3 pt-2">
        {agentState === "listening" && !speechTranscript && (
          <div className="mx-auto mb-2 w-fit rounded-full border border-primary/10 bg-primary/5 px-3 py-1 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-medium tracking-tight text-primary/70 uppercase">
              Listening
            </span>
          </div>
        )}

        <div className="flex w-full items-center gap-2 rounded-2xl border border-white/50 bg-white/70 p-1.5 shadow-sm backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-900/70">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isOffline && sendMessage(inputText)}
            disabled={isOffline}
            placeholder={isOffline ? "Offline..." : "Message Jarvis..."}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
          <Button
            onClick={() => sendMessage(inputText)}
            disabled={isOffline || !inputText.trim()}
            className="h-9 w-9 shrink-0 rounded-xl bg-primary p-0 text-primary-foreground shadow-sm hover:bg-cyan-800 disabled:opacity-30 dark:hover:bg-cyan-300"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
