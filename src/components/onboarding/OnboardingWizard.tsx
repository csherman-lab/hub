"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Mail,
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AvatarPicker } from "@/components/avatar/AvatarPicker";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { getAvatarById } from "@/lib/avatars";
import { useHubStore } from "@/lib/store";
import type { AutonomyLevel, ProactivityMode } from "@/types";

const GOALS = [
  { id: "email", label: "Email & calendar", icon: Mail },
  { id: "research", label: "Research", icon: Search },
  { id: "writing", label: "Writing & drafts", icon: Sparkles },
  { id: "slack", label: "Work (Slack)", icon: MessageSquare },
  { id: "life", label: "Personal life", icon: Sparkles },
  { id: "everything", label: "Everything", icon: Check },
];

const STEPS = ["Goals", "Avatar", "Behavior", "Connect", "Meet"];

export function OnboardingWizard() {
  const router = useRouter();
  const {
    onboardingComplete,
    onboardingStep,
    goals,
    selectedAvatarId,
    agentName,
    proactivity,
    autonomy,
    apiKeys,
    setOnboardingStep,
    setGoals,
    setSelectedAvatar,
    setAgentName,
    setProactivity,
    setAutonomy,
    setApiKey,
    completeOnboarding,
  } = useHubStore();

  const [localKey, setLocalKey] = useState(apiKeys.openai || "");
  const avatar = getAvatarById(selectedAvatarId);

  useEffect(() => {
    if (onboardingComplete) {
      router.replace("/dashboard");
    }
  }, [onboardingComplete, router]);

  const toggleGoal = (id: string) => {
    if (id === "everything") {
      setGoals(GOALS.map((g) => g.id));
      return;
    }
    setGoals(
      goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id],
    );
  };

  const canContinue = () => {
    switch (onboardingStep) {
      case 0:
        return goals.length > 0;
      case 1:
        return !!selectedAvatarId;
      case 2:
        return true;
      case 3:
        return !!localKey.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (onboardingStep === 3) {
      setApiKey("openai", localKey);
    }
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
          Set up your personal agent in a few minutes
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`h-1.5 w-12 rounded-full transition-colors ${
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
          {onboardingStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                What should your agent help you with?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleGoal(id)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      goals.includes(id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardingStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Choose your agent</h2>
              <AvatarPicker
                selectedId={selectedAvatarId}
                onSelect={setSelectedAvatar}
              />
              <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                <Camera className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-2 text-sm font-medium">Create from your photo</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Coming soon — upload a photo or scan your face to create a
                  cartoon avatar of yourself
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

          {onboardingStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">How should they behave?</h2>

              <div>
                <p className="mb-3 text-sm font-medium text-zinc-600">
                  Proactivity
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ["proactive", "Reach out with reminders and check-ins"],
                      ["balanced", "Mix of proactive and on-demand"],
                      ["reactive", "Only respond when I ask"],
                    ] as [ProactivityMode, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProactivity(value)}
                      className={`w-full rounded-xl border-2 p-4 text-left text-sm ${
                        proactivity === value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-zinc-600">
                  When sending emails or booking meetings
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ["suggest", "Suggest only — I approve everything"],
                      ["balanced", "Ask before sending or scheduling"],
                      ["autopilot", "Handle it automatically"],
                    ] as [AutonomyLevel, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAutonomy(value)}
                      className={`w-full rounded-xl border-2 p-4 text-left text-sm ${
                        autonomy === value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Connect your keys & apps</h2>
              <p className="text-sm text-zinc-500">
                Hub uses your API keys to run your agent. Keys are stored locally
                in this draft — production will encrypt them server-side.
              </p>

              <div>
                <label className="text-sm font-medium">
                  OpenAI API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Powers chat, voice, and vision. Get one at platform.openai.com
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-sm font-medium">Recommended next</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-500">
                  <li>• Gmail — read, draft, and send email</li>
                  <li>• Google Calendar — schedule meetings</li>
                  <li>• Web Search — research topics</li>
                </ul>
                <p className="mt-2 text-xs text-zinc-400">
                  You can add these from Connections after setup.
                </p>
              </div>
            </div>
          )}

          {onboardingStep === 4 && avatar && (
            <div className="flex flex-col items-center space-y-6 text-center">
              <h2 className="text-xl font-semibold">
                Meet {agentName || avatar.name}!
              </h2>
              <AvatarDisplay avatar={avatar} size="lg" emotion="happy" />
              <p className="max-w-md text-sm text-zinc-500">{avatar.personality}</p>
              <p className="text-sm font-medium">
                How would you like to start?
              </p>
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

        {onboardingStep < 4 ? (
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
