"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConnectorIcon } from "@/components/connectors/ConnectorIcon";
import { CONNECTOR_META } from "@/lib/connectors/config";
import { useHubStore } from "@/lib/store";
import type { ConnectorId } from "@/types";
import { cn } from "@/lib/utils";

const OAUTH_ROUTES: Partial<Record<ConnectorId, string>> = {
  gmail: "/api/connect/google?connector=gmail",
  google_calendar: "/api/connect/google?connector=google_calendar",
  slack: "/api/connect/slack",
};

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    "Google OAuth is not set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file.",
  slack_not_configured:
    "Slack OAuth is not set up yet. Add SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to your .env.local file.",
  access_denied: "Connection cancelled.",
  token_exchange_failed: "Could not complete connection. Try again.",
};

export function ConnectorsView() {
  const searchParams = useSearchParams();
  const { apiKeys, connectors, setApiKey, connectConnector, disconnectConnector } =
    useHubStore();

  const [expandedKey, setExpandedKey] = useState<ConnectorId | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<
    Record<string, { connected?: boolean; email?: string; teamName?: string }>
  >({});

  const syncStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/connect/status");
      const data = await res.json();
      const connections = data.connections || {};

      setAccountInfo(connections);

      for (const meta of CONNECTOR_META) {
        if (meta.connectType === "oauth") {
          if (connections[meta.id]?.connected) {
            connectConnector(meta.id);
          }
        }
      }
    } catch {
      /* offline */
    }
  }, [connectConnector]);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      connectConnector(connected as ConnectorId);
      setToast(`${connected.replace("_", " ")} connected successfully`);
      syncStatus();
      window.history.replaceState({}, "", "/dashboard/connectors");
    }

    if (error) {
      setToast(ERROR_MESSAGES[error] || `Connection failed: ${error}`);
      window.history.replaceState({}, "", "/dashboard/connectors");
    }
  }, [searchParams, connectConnector, syncStatus]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleConnect = (id: ConnectorId) => {
    const meta = CONNECTOR_META.find((c) => c.id === id);
    if (!meta) return;

    if (meta.connectType === "env") return;

    if (meta.connectType === "oauth") {
      const route = OAUTH_ROUTES[id];
      if (route) window.location.href = route;
      return;
    }

    setExpandedKey(id);
    setKeyInput(apiKeys[id] || "");
  };

  const handleSaveKey = (id: ConnectorId) => {
    setApiKey(id, keyInput);
    setExpandedKey(null);
    setKeyInput("");
    setToast(`${CONNECTOR_META.find((c) => c.id === id)?.name} connected`);
  };

  const handleDisconnect = async (id: ConnectorId) => {
    const meta = CONNECTOR_META.find((c) => c.id === id);

    if (meta?.connectType === "oauth") {
      await fetch("/api/connect/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: id }),
      });
    }

    disconnectConnector(id);
    setToast(`${meta?.name} disconnected`);
    syncStatus();
  };

  const isConnected = (id: ConnectorId) => {
    if (id === "xai") {
      return accountInfo.xai?.connected === true;
    }
    const storeConnector = connectors.find((c) => c.id === id);
    return storeConnector?.status === "connected";
  };

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm text-white shadow-lg">
          {toast}
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <h1 className="text-2xl font-semibold">Connectors</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Tap Connect to link your accounts. OAuth services open a sign-in window;
        API key services ask for your key once.
      </p>

      <div className="mt-8 space-y-3">
        {CONNECTOR_META.map((meta) => {
          const connected = isConnected(meta.id);
          const info = accountInfo[meta.id];
          const isExpanded = expandedKey === meta.id;

          return (
            <div
              key={meta.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white transition-colors dark:bg-zinc-900",
                connected
                  ? "border-emerald-200 dark:border-emerald-900"
                  : "border-zinc-200 dark:border-zinc-800",
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <ConnectorIcon icon={meta.icon} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{meta.name}</h3>
                    {meta.required && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium uppercase text-red-600">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">{meta.description}</p>
                  {connected && info?.email && (
                    <p className="mt-0.5 text-xs text-emerald-600">{info.email}</p>
                  )}
                  {connected && info?.teamName && (
                    <p className="mt-0.5 text-xs text-emerald-600">
                      {info.teamName}
                    </p>
                  )}
                </div>

                {connected ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:flex">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {meta.connectType === "env" ? "Configured" : "Connected"}
                    </span>
                    {meta.connectType !== "env" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDisconnect(meta.id)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                ) : meta.connectType === "env" ? (
                  <span className="text-xs text-zinc-500">Add to .env.local</span>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(meta.id)}>
                    Connect {meta.name.split(" ")[0]}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <label className="text-sm font-medium">
                    {meta.keyLabel || "API Key"}
                  </label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={
                      meta.id === "openai"
                        ? "sk-..."
                        : meta.id === "web_search"
                          ? "tvly-..."
                          : "Enter key"
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Get your key at{" "}
                    <a
                      href={meta.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {meta.setupUrl.replace("https://", "")}
                    </a>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveKey(meta.id)}
                      disabled={!keyInput.trim()}
                    >
                      Save & Connect
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedKey(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold">Developer setup (one-time)</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Add <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">XAI_API_KEY</code>{" "}
          for Grok chat and voice. For Gmail, Calendar, and Slack, add OAuth
          credentials to{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
            .env.local
          </code>{" "}
          in the project folder. See{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
            docs/SETUP.md
          </code>{" "}
          for step-by-step instructions.
        </p>
      </div>
    </div>
  );
}
