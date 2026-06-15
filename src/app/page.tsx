"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHubStore } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();
  const onboardingComplete = useHubStore((s) => s.onboardingComplete);

  useEffect(() => {
    router.replace(onboardingComplete ? "/dashboard" : "/onboarding");
  }, [onboardingComplete, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}
