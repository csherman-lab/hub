"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useHubStore } from "@/lib/store";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useStoreHydrated();
  const onboardingComplete = useHubStore((s) => s.onboardingComplete);
  const selectedAvatarId = useHubStore((s) => s.selectedAvatarId);

  useEffect(() => {
    if (!hydrated) return;
    if (onboardingComplete) return;
    if (pathname?.startsWith("/onboarding")) return;
    router.replace("/onboarding");
  }, [hydrated, onboardingComplete, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f5f7] dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-zinc-500">Loading Hub…</p>
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f5f7] p-6 text-center dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-zinc-500">Taking you to setup…</p>
        <a href="/onboarding" className="text-sm font-medium text-blue-500 hover:underline">
          Open setup manually →
        </a>
      </div>
    );
  }

  if (!selectedAvatarId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f5f7] p-6 text-center dark:bg-black">
        <p className="text-sm text-zinc-500">Choose an avatar to finish setup.</p>
        <a href="/onboarding" className="text-sm font-medium text-blue-500 hover:underline">
          Continue onboarding →
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
