"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ConnectorMeta } from "@/lib/connectors/config";
import {
  AnthropicIcon,
  GmailIcon,
  GoogleCalendarIcon,
  OpenAiIcon,
  SlackIcon,
  TavilyIcon,
  TelegramIcon,
  WebSearchIcon,
  XaiIcon,
} from "@/components/connectors/connector-brand-icons";

const ICON_SIZE = "h-10 w-10";

const ICON_MAP: Record<string, () => ReactNode> = {
  xai: XaiIcon,
  openai: OpenAiIcon,
  gmail: GmailIcon,
  calendar: GoogleCalendarIcon,
  slack: SlackIcon,
  tavily: TavilyIcon,
  telegram: TelegramIcon,
  anthropic: AnthropicIcon,
  search: WebSearchIcon,
};

export function ConnectorIcon({
  icon,
  className,
}: {
  icon: ConnectorMeta["icon"];
  className?: string;
}) {
  const Icon = ICON_MAP[icon];

  return (
    <div
      className={cn(
        ICON_SIZE,
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      {Icon ? (
        <Icon />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-500 text-sm font-bold text-white">
          ?
        </div>
      )}
    </div>
  );
}
