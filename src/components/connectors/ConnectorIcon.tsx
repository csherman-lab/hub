"use client";

import { cn } from "@/lib/utils";
import type { ConnectorMeta } from "@/lib/connectors/config";

export function ConnectorIcon({
  icon,
  className,
}: {
  icon: ConnectorMeta["icon"];
  className?: string;
}) {
  const base = cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", className);

  switch (icon) {
    case "gmail":
      return (
        <div className={cn(base, "bg-[#EA4335]")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
      );
    case "calendar":
      return (
        <div className={cn(base, "bg-[#4285F4]")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
          </svg>
        </div>
      );
    case "slack":
      return (
        <div className={cn(base, "bg-[#4A154B]")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M6 15a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4zm6 0a2 2 0 110-4 2 2 0 010 4zm6 6a2 2 0 110-4 2 2 0 010 4zm-6 6a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      );
    case "openai":
      return (
        <div className={cn(base, "bg-[#10A37F]")}>
          <span className="text-sm font-bold">AI</span>
        </div>
      );
    case "search":
      return (
        <div className={cn(base, "bg-[#6366F1]")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>
      );
    case "telegram":
      return (
        <div className={cn(base, "bg-[#26A5E4]")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={cn(base, "bg-zinc-500")}>
          <span className="text-sm font-bold">?</span>
        </div>
      );
  }
}
