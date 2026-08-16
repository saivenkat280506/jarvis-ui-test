"use client";

import TopBar from "@/components/TopBar";
import LeftPanel from "@/components/LeftPanel";
import ChatArea from "@/components/ChatArea";
import QuickActions from "@/components/QuickActions";
import AgentStepTracker from "@/components/AgentStepTracker";
import SettingsSheet from "@/components/SettingsSheet";
import { useJarvis } from "@/hooks/useJarvis";
import { useTheme } from "@/hooks/useTheme";

export default function JarvisWorkspace() {
  const jarvis = useJarvis();
  const { theme, setTheme, toggleTheme } = useTheme();

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
        onSettingsClick={() => jarvis.setSettingsOpen(true)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col gap-4">
        <TopBar
          onSettingsClick={() => jarvis.setSettingsOpen(true)}
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

      <SettingsSheet
        open={jarvis.settingsOpen}
        onOpenChange={jarvis.setSettingsOpen}
        theme={theme}
        onThemeChange={setTheme}
      />
    </main>
  );
}
