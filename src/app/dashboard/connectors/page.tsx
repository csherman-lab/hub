import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ConnectorsView } from "@/components/connectors/ConnectorsView";

export default function ConnectorsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <ConnectorsView />
      </Suspense>
    </AppShell>
  );
}
