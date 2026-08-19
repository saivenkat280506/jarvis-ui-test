"use client";

import TopBar from "@/components/TopBar";
import LeftPanel from "@/components/LeftPanel";
import ChatArea from "@/components/ChatArea";
import QuickActions from "@/components/QuickActions";
import AgentStepTracker from "@/components/AgentStepTracker";
import { useJarvis } from "@/hooks/useJarvis";
import { useTheme } from "@/hooks/useTheme";

export default function JarvisWorkspace() {
  const jarvis = useJarvis();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative flex h-screen w-screen overflow-hidden bg-background p-4 gap-4">
      <div className="grid-veil absolute inset-0" />
      <div className="noise" />

      <LeftPanel
        agentState={jarvis.agentState}
        isListening={jarvis.isListening}
        isBackendOnline={jarvis.isBackendOnline}
        toggleMic={jarvis.toggleMic}
        speechTranscript={jarvis.speechTranscript}
      />

      <div className="relative flex h-full w-[20%] min-w-0 flex-col gap-3">
        <TopBar
          onRefreshChat={jarvis.clearChat}
          backendStatus={jarvis.backendStatus}
          backendLatency={jarvis.backendLatency}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="flex min-h-0 flex-1 gap-4">
          <div className="glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl">
            <QuickActions
              onSendMessage={jarvis.sendMessage}
              onClearChat={jarvis.clearChat}
            />
            <AgentStepTracker logs={jarvis.actionLogs} />
            <ChatArea
              messages={jarvis.messages}
              inputText={jarvis.inputText}
              setInputText={jarvis.setInputText}
              sendMessage={jarvis.sendMessage}
              streamingText={jarvis.streamingText}
              speechTranscript={jarvis.speechTranscript}
              agentState={jarvis.agentState ?? undefined}
              isBackendOnline={jarvis.isBackendOnline}
              toggleMic={jarvis.toggleMic}
            />
          </div>
        </div>
      </div>

    </main>
  );
}
