"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConnectorIcon } from "@/components/connectors/ConnectorIcon";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/HubMotion";
import { CONNECTOR_META, PLANNED_CONNECTORS } from "@/lib/connectors/config";
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
    "Google sign in isn't available on this Hub yet. The person who set up Hub needs to enable Google once, then you can just click Connect.",
  slack_not_configured:
    "Slack isn't available on this Hub yet. Ask your admin to enable Slack integration.",
  access_denied: "You cancelled the connection.",
  token_exchange_failed: "Couldn't finish connecting. Please try again.",
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

    if (meta.connectType === "oauth") {
      const route = OAUTH_ROUTES[id];
      if (route) window.location.href = route;
      return;
    }

    if (meta.connectType === "api_key") {
      setExpandedKey(id);
      setKeyInput(apiKeys[id] || "");
    }
  };

  const handleSaveKey = async (id: ConnectorId) => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/connect/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: id, apiKey: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Could not connect");
        return;
      }
      setApiKey(id, trimmed);
      connectConnector(id);
      setExpandedKey(null);
      setKeyInput("");
      setToast(`${CONNECTOR_META.find((c) => c.id === id)?.name} connected`);
      syncStatus();
    } catch {
      setToast("Something went wrong. Try again.");
    }
  };

  const handleDisconnect = async (id: ConnectorId) => {
    const meta = CONNECTOR_META.find((c) => c.id === id);

    await fetch("/api/connect/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId: id }),
    });

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
    <div className="mx-auto max-w-2xl p-4 pb-8 md:p-10">
      {toast && (
        <FadeIn className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm text-white shadow-lg">
            {toast}
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <h1 className="text-2xl font-semibold">Connectors</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Connect Gmail, Calendar, Slack, and more, one tap each. Your Grok brain was set up during onboarding; manage it here if you need to change it.
        </p>
      </FadeIn>

      <Stagger className="mt-8 space-y-3">
        {CONNECTOR_META.map((meta) => {
          const connected = isConnected(meta.id);
          const info = accountInfo[meta.id];
          const isExpanded = expandedKey === meta.id;

          return (
            <StaggerItem key={meta.id}>
            <div
              className={cn(
                "hub-card overflow-hidden bg-white transition-all duration-200 dark:bg-zinc-900",
                connected
                  ? "border-emerald-200 dark:border-emerald-900"
                  : "",
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
                ) : (
                  <Button size="sm" onClick={() => handleConnect(meta.id)}>
                    Connect
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
                      meta.id === "xai"
                        ? "xai-..."
                        : meta.id === "openai"
                          ? "sk-..."
                          : meta.id === "web_search"
                            ? "tvly-..."
                            : "Paste your key"
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    {meta.id === "xai" ? (
                      <>
                        Get a free key at{" "}
                        <a
                          href={meta.setupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          console.x.ai
                        </a>
                        . Paste it here, no terminal or config files needed.
                      </>
                    ) : (
                      <>
                        Get your key at{" "}
                        <a
                          href={meta.setupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {meta.setupUrl.replace("https://", "")}
                        </a>
                      </>
                    )}
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
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Coming soon
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PLANNED_CONNECTORS.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {c.name}
              </p>
              <p className="text-xs text-zinc-400">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
