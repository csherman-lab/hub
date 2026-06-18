import { OnboardingGuard } from "@/components/layout/OnboardingGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
