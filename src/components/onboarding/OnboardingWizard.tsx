"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Camera,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarPicker } from "@/components/avatar/AvatarPicker";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { GrokStatusBadge } from "@/components/ai/GrokStatusBadge";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

const STEPS = ["Brain", "Avatar", "Meet"];

function BrainKeyStep() {
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { grokStatus, setGrokStatus, connectConnector, disconnectConnector } =
    useHubStore();

  const checkGrok = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/ai/status");
      const data = await res.json();
      setGrokStatus({
        configured: !!data.configured,
        chat: !!data.chat,
        voice: !!data.voice,
      });
      if (data.configured && data.chat) {
        connectConnector("xai");
      } else {
        disconnectConnector("xai");
      }
    } catch {
      setGrokStatus({ configured: false, chat: false, voice: false });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkGrok();
  }, []);

  const handleSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/connect/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: "xai", apiKey: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not verify your key. Try again.");
        return;
      }
      connectConnector("xai");
      setKeyInput("");
      await checkGrok();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const connected = grokStatus?.configured && grokStatus?.chat;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/50">
          <Brain className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Give your agent a brain</h2>
          <p className="text-sm text-zinc-500">
            Paste your Grok API key — this powers chat and voice.
          </p>
        </div>
      </div>

      {checking ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-500">Checking connection…</span>
        </div>
      ) : connected ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Grok connected
            </p>
            <GrokStatusBadge className="mt-1" />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="text-sm font-medium">xAI API Key</label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setError(null);
            }}
            placeholder="xai-..."
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
            autoFocus
          />
          <p className="mt-2 text-xs text-zinc-500">
            Get a key at{" "}
            <a
              href="https://console.x.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              console.x.ai
            </a>
            . Stored securely on this device — no terminal needed.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <Button
            className="mt-4 w-full"
            onClick={handleSaveKey}
            disabled={!keyInput.trim() || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Connect Grok"
            )}
          </Button>
        </div>
      )}

      <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
        <p className="text-sm font-medium">Gmail, Calendar & more</p>
        <p className="mt-1 text-sm text-zinc-500">
          You&apos;ll connect those after setup — one tap each from Connectors.
        </p>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const {
    onboardingComplete,
    onboardingStep,
    selectedAvatarId,
    agentName,
    grokStatus,
    setOnboardingStep,
    setSelectedAvatar,
    setAgentName,
    completeOnboarding,
  } = useHubStore();

  const hydrated = useStoreHydrated();
  const avatar = getAvatarById(selectedAvatarId);
  const brainConnected = Boolean(grokStatus?.configured && grokStatus?.chat);

  useEffect(() => {
    if (!brainConnected) return;
    const { connectors, connectConnector } = useHubStore.getState();
    if (connectors.find((c) => c.id === "xai")?.status !== "connected") {
      connectConnector("xai");
    }
  }, [brainConnected]);

  useEffect(() => {
    if (!hydrated) return;
    if (onboardingComplete && selectedAvatarId && brainConnected) {
      router.replace("/dashboard");
      return;
    }
    if (onboardingComplete && (!selectedAvatarId || !brainConnected)) {
      useHubStore.setState({
        onboardingComplete: false,
        onboardingStep: !brainConnected ? 0 : 1,
      });
    }
  }, [
    hydrated,
    onboardingComplete,
    selectedAvatarId,
    brainConnected,
    router,
    setOnboardingStep,
  ]);

  const canContinue = () => {
    switch (onboardingStep) {
      case 0:
        return brainConnected;
      case 1:
        return !!selectedAvatarId;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (onboardingStep < STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      completeOnboarding();
      router.push("/dashboard");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Hub</h1>
        <p className="mt-2 text-zinc-500">
          Add a brain, pick an avatar — you&apos;re in.
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`h-1.5 w-16 rounded-full transition-colors ${
              i <= onboardingStep ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={onboardingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1"
        >
          {onboardingStep === 0 && <BrainKeyStep />}

          {onboardingStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/50">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Choose your agent</h2>
                  <p className="text-sm text-zinc-500">
                    Pick who you want to talk to — voice matches their look.
                  </p>
                </div>
              </div>
              <AvatarPicker
                selectedId={selectedAvatarId}
                onSelect={setSelectedAvatar}
              />
              <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                <Camera className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-2 text-sm font-medium">Create from your photo</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Coming soon — upload a photo to create a cartoon avatar of yourself
                </p>
              </div>
              {avatar && (
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Name your agent (optional)
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder={avatar.name}
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              )}
            </div>
          )}

          {onboardingStep === 2 && avatar && (
            <div className="flex flex-col items-center space-y-6 text-center">
              <h2 className="text-xl font-semibold">
                Meet {agentName || avatar.name}!
              </h2>
              <AvatarDisplay avatar={avatar} size="lg" emotion="happy" />
              <p className="max-w-md text-sm text-zinc-500">{avatar.personality}</p>
              <p className="text-sm text-zinc-500">
                Head to Connectors anytime to link Gmail, Calendar, and more.
              </p>
              <p className="text-sm font-medium">How would you like to start?</p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/dashboard/chat")}>
                  Text
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/dashboard/call/voice")}
                >
                  Call
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/dashboard/call/video")}
                >
                  Video
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={() =>
            onboardingStep > 0
              ? setOnboardingStep(onboardingStep - 1)
              : undefined
          }
          disabled={onboardingStep === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {onboardingStep < 2 ? (
          <Button onClick={handleNext} disabled={!canContinue()}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
