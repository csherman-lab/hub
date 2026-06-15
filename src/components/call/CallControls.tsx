"use client";

import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  PhoneOff,
  Presentation,
  Video,
  VideoOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  muted: boolean;
  videoOn: boolean;
  screenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  variant?: "video" | "voice";
}

export function CallControls({
  muted,
  videoOn,
  screenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  variant = "video",
}: CallControlsProps) {
  const router = useRouter();

  return (
    <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-zinc-900/90 px-4 py-2 shadow-2xl backdrop-blur-xl">
      <ControlButton
        icon={muted ? MicOff : Mic}
        label={muted ? "Unmute" : "Mute"}
        active={!muted}
        onClick={onToggleMute}
      />

      {variant === "video" && (
        <>
          <ControlButton
            icon={videoOn ? Video : VideoOff}
            label={videoOn ? "Stop video" : "Start video"}
            active={videoOn}
            onClick={onToggleVideo}
          />
          <ControlButton
            icon={Presentation}
            label="Share screen"
            active={screenSharing}
            onClick={onToggleScreenShare}
          />
        </>
      )}

      <button
        type="button"
        onClick={() => {
          onEndCall();
          router.push("/dashboard");
        }}
        className="ml-1 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white transition-colors hover:bg-red-600"
        aria-label="End call"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
        active
          ? "bg-zinc-700 text-white hover:bg-zinc-600"
          : "bg-red-500/80 text-white hover:bg-red-600",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
