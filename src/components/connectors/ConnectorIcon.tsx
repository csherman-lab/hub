"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ConnectorMeta } from "@/lib/connectors/config";

const ICON_SIZE = "h-10 w-10";

export function ConnectorIcon({
  icon,
  className,
}: {
  icon: ConnectorMeta["icon"];
  className?: string;
}) {
  const wrap = (children: ReactNode, bg?: string) => (
    <div
      className={cn(
        ICON_SIZE,
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
        bg,
        className,
      )}
    >
      {children}
    </div>
  );

  switch (icon) {
    case "xai":
      return wrap(
        <div className="flex h-full w-full items-center justify-center bg-black">
          <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden>
            <text
              x="24"
              y="30"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              xAI
            </text>
          </svg>
        </div>,
      );
    case "gmail":
      return wrap(
        <Image
          src="/connectors/gmail.svg"
          alt=""
          width={40}
          height={40}
          className="h-full w-full"
        />,
      );
    case "calendar":
      return wrap(
        <Image
          src="/connectors/google-calendar.svg"
          alt=""
          width={40}
          height={40}
          className="h-full w-full"
        />,
      );
    case "slack":
      return wrap(
        <Image
          src="/connectors/slack.svg"
          alt=""
          width={40}
          height={40}
          className="h-full w-full"
        />,
      );
    case "openai":
      return wrap(
        <Image
          src="/connectors/openai.svg"
          alt=""
          width={40}
          height={40}
          className="h-full w-full bg-[#10A37F] p-2"
        />,
      );
    case "anthropic":
      return wrap(
        <Image
          src="/connectors/anthropic.svg"
          alt=""
          width={40}
          height={40}
          className="h-full w-full"
        />,
      );
    case "tavily":
      return wrap(
        <div className="flex h-full w-full items-center justify-center bg-[#6366F1]">
          <span className="text-sm font-bold text-white">T</span>
        </div>,
      );
    case "search":
      return wrap(
        <div className="flex h-full w-full items-center justify-center bg-[#6366F1]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>,
      );
    case "telegram":
      return wrap(
        <Image
          src="/connectors/telegram.svg"
          alt=""
          width={40}
          height={40}
          className="h-full w-full"
        />,
      );
    default:
      return wrap(
        <div className="flex h-full w-full items-center justify-center bg-zinc-500">
          <span className="text-sm font-bold text-white">?</span>
        </div>,
      );
  }
}
