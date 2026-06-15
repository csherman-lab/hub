"use client";

import { useHubStore } from "@/lib/store";
import { getAvatarById } from "@/lib/avatars";
import { AvatarPicker } from "@/components/avatar/AvatarPicker";
import { Button } from "@/components/ui/Button";

export function SettingsView() {
  const {
    selectedAvatarId,
    agentName,
    proactivity,
    autonomy,
    setSelectedAvatar,
    setAgentName,
    setProactivity,
    setAutonomy,
    resetHub,
  } = useHubStore();

  const avatar = getAvatarById(selectedAvatarId);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage your agent, behavior, and account.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium">Agent name</h2>
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder={avatar?.name}
          className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-medium">Change avatar</h2>
        <p className="mb-4 text-sm text-zinc-500">
          One avatar at a time. Switching replaces your current agent.
        </p>
        <AvatarPicker
          selectedId={selectedAvatarId}
          onSelect={setSelectedAvatar}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-medium">Behavior</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-500">Proactivity</label>
            <select
              value={proactivity}
              onChange={(e) =>
                setProactivity(
                  e.target.value as "proactive" | "balanced" | "reactive",
                )
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="proactive">Proactive</option>
              <option value="balanced">Balanced</option>
              <option value="reactive">Reactive</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-500">Autonomy</label>
            <select
              value={autonomy}
              onChange={(e) =>
                setAutonomy(
                  e.target.value as "suggest" | "balanced" | "autopilot",
                )
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="suggest">Suggest only</option>
              <option value="balanced">Balanced</option>
              <option value="autopilot">Autopilot</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
        <h2 className="font-medium text-red-700 dark:text-red-400">Danger zone</h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Reset all Hub data and start onboarding over.
        </p>
        <Button
          variant="danger"
          size="sm"
          className="mt-4"
          onClick={() => {
            resetHub();
            window.location.href = "/onboarding";
          }}
        >
          Reset Hub
        </Button>
      </section>
    </div>
  );
}
