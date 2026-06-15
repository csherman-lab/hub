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
    theme,
    setSelectedAvatar,
    setAgentName,
    setProactivity,
    setAutonomy,
    setTheme,
    resetHub,
    memories,
    removeMemory,
  } = useHubStore();

  const avatar = getAvatarById(selectedAvatarId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your agent, appearance, and behavior.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--hub-border)] bg-white p-5 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">Appearance</h2>
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                theme === t
                  ? "bg-white shadow-sm dark:bg-zinc-700"
                  : "text-zinc-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--hub-border)] bg-white p-5 dark:bg-zinc-900">
        <h2 className="font-medium">Agent name</h2>
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder={avatar?.name}
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </section>

      <section className="rounded-2xl border border-[var(--hub-border)] bg-white p-5 dark:bg-zinc-900">
        <h2 className="mb-2 font-medium">Change avatar</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Tap an avatar to select and hear their voice.
        </p>
        <AvatarPicker selectedId={selectedAvatarId} onSelect={setSelectedAvatar} />
      </section>

      <section className="rounded-2xl border border-[var(--hub-border)] bg-white p-5 dark:bg-zinc-900">
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
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
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
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="suggest">Suggest only</option>
              <option value="balanced">Balanced</option>
              <option value="autopilot">Autopilot</option>
            </select>
          </div>
        </div>
      </section>

      {memories.length > 0 && (
        <section className="rounded-2xl border border-[var(--hub-border)] bg-white p-5 dark:bg-zinc-900">
          <h2 className="mb-3 font-medium">Agent memory</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Facts your agent remembers from conversations.
          </p>
          <ul className="space-y-2">
            {memories.map((m, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800"
              >
                <span>{m}</span>
                <button
                  type="button"
                  onClick={() => removeMemory(i)}
                  className="shrink-0 text-xs text-zinc-400 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="font-medium text-red-700 dark:text-red-400">Reset</h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Start onboarding over from scratch.
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
