"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useHubStore } from "@/lib/store";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingComplete = useHubStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (!onboardingComplete && !pathname?.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [onboardingComplete, pathname, router]);

  if (!onboardingComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
