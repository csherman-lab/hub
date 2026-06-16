"use client";

import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useHubStore } from "@/lib/store";

const PRESET_SKILLS = [
  {
    trigger: "weekly recap",
    action: "Summarize my inbox and calendar for the week and highlight anything urgent.",
  },
  {
    trigger: "before a meeting",
    action: "Check my calendar for the next meeting and help me prepare talking points.",
  },
  {
    trigger: "email from",
    action: "Find emails from that person and draft a thoughtful reply.",
  },
];

export function SkillsView() {
  const { skills, addSkill, removeSkill } = useHubStore();
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!trigger.trim() || !action.trim()) return;
    addSkill(trigger.trim(), action.trim());
    setTrigger("");
    setAction("");
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-2xl p-4 pb-8 md:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Skills</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Teach your agent rules in plain English, no code required.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add skill
        </Button>
      </div>

      {showForm && (
        <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label className="text-sm font-medium">When I say or ask...</label>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder='e.g. "weekly recap" or "email from Sarah"'
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Do this...</label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder='e.g. "Summarize my inbox and draft replies for anything urgent"'
              rows={3}
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Save skill</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {skills.length === 0 && !showForm && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Quick add
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_SKILLS.map((preset) => (
              <button
                key={preset.trigger}
                type="button"
                onClick={() => addSkill(preset.trigger, preset.action)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800"
              >
                {preset.trigger}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <Sparkles className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-3 text-sm font-medium">No skills yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Example: &quot;Every Friday, send me a recap of the week&quot;
            </p>
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">When</p>
                  <p className="font-medium">&quot;{skill.trigger}&quot;</p>
                  <p className="mt-3 text-sm text-zinc-500">Then</p>
                  <p className="text-sm">{skill.action}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Delete skill"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
