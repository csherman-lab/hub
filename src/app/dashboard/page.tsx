import { AppShell } from "@/components/layout/AppShell";
import { HomeView } from "@/components/dashboard/HomeView";

export default function DashboardPage() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}
