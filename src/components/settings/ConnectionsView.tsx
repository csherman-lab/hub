"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Key,
  Link2,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useHubStore } from "@/lib/store";
import type { ConnectorId } from "@/types";
import { cn } from "@/lib/utils";

const CONNECTOR_DOCS: Record<
  ConnectorId,
  { setupUrl: string; keyLabel?: string; oauth?: boolean }
> = {
  openai: {
    setupUrl: "https://platform.openai.com/api-keys",
    keyLabel: "API Key",
  },
  anthropic: {
    setupUrl: "https://console.anthropic.com/settings/keys",
    keyLabel: "API Key",
  },
  xai: {
    setupUrl: "https://console.x.ai",
    keyLabel: "API Key",
  },
  gmail: {
    setupUrl: "https://console.cloud.google.com/apis/credentials",
    oauth: true,
  },
  google_calendar: {
    setupUrl: "https://console.cloud.google.com/apis/credentials",
    oauth: true,
  },
  web_search: {
    setupUrl: "https://tavily.com",
    keyLabel: "API Key",
  },
  telegram: {
    setupUrl: "https://t.me/BotFather",
    keyLabel: "Bot Token",
  },
  slack: {
    setupUrl: "https://api.slack.com/apps",
    oauth: true,
  },
};

export function ConnectionsView() {
  const { connectors, apiKeys, setApiKey, connectConnector, disconnectConnector } =
    useHubStore();
  const [editing, setEditing] = useState<ConnectorId | null>(null);
  const [keyInput, setKeyInput] = useState("");

  const handleSaveKey = (id: ConnectorId) => {
    setApiKey(id, keyInput);
    setEditing(null);
    setKeyInput("");
  };

  const handleOAuth = (id: ConnectorId) => {
    // Draft: simulate OAuth success
    connectConnector(id);
  };

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <h1 className="text-2xl font-semibold">Connections</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Connect the services your agent uses. You bring your own API keys and
        accounts.
      </p>

      <div className="mt-8 space-y-4">
        {connectors.map((connector) => {
          const docs = CONNECTOR_DOCS[connector.id];
          const isConnected = connector.status === "connected";
          const isEditing = editing === connector.id;

          return (
            <div
              key={connector.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{connector.name}</h3>
                    {connector.required && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {connector.description}
                  </p>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                    isConnected
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
                  )}
                >
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    "Not connected"
                  )}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {docs.oauth ? (
                  <Button
                    size="sm"
                    variant={isConnected ? "secondary" : "primary"}
                    onClick={() =>
                      isConnected
                        ? disconnectConnector(connector.id)
                        : handleOAuth(connector.id)
                    }
                  >
                    <Link2 className="h-4 w-4" />
                    {isConnected ? "Disconnect" : "Connect with OAuth"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(connector.id);
                      setKeyInput(apiKeys[connector.id] || "");
                    }}
                  >
                    <Key className="h-4 w-4" />
                    {isConnected ? "Update key" : "Add API key"}
                  </Button>
                )}

                {isConnected && !docs.oauth && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => disconnectConnector(connector.id)}
                  >
                    <Unplug className="h-4 w-4" />
                    Remove
                  </Button>
                )}

                <a
                  href={docs.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
                >
                  Setup guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {isEditing && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={docs.keyLabel || "API Key"}
                    className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <Button size="sm" onClick={() => handleSaveKey(connector.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
