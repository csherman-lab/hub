import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatView } from "@/components/chat/ChatView";

export default function ChatPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
            Loading chat…
          </div>
        }
      >
        <ChatView />
      </Suspense>
    </AppShell>
  );
}
