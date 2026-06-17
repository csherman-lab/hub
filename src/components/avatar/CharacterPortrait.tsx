import type { CharacterVariant } from "@/types";

/** Stylized Pixar-inspired portrait SVGs (bust in circular frame). */
export function CharacterPortrait({ variant }: { variant: CharacterVariant }) {
  switch (variant) {
    case "marcus":
      return <MarcusPortrait />;
    case "priya":
      return <PriyaPortrait />;
    case "elias":
      return <EliasPortrait />;
  }
}

function MarcusPortrait() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="marcus-bg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFD080" />
          <stop offset="100%" stopColor="#FF8C42" />
        </radialGradient>
        <linearGradient id="marcus-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C68642" />
          <stop offset="100%" stopColor="#8D5524" />
        </linearGradient>
        <linearGradient id="marcus-hoodie" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF9A3C" />
          <stop offset="100%" stopColor="#E85D04" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#marcus-bg)" />
      <ellipse cx="100" cy="178" rx="72" ry="38" fill="url(#marcus-hoodie)" />
      <ellipse cx="100" cy="108" rx="52" ry="58" fill="url(#marcus-skin)" />
      <path
        d="M52 72 C58 42, 142 42, 148 72 C150 88, 145 58, 100 54 C55 58, 50 88, 52 72Z"
        fill="#2A1810"
      />
      <ellipse className="char-eye" cx="78" cy="102" rx="9" ry="11" fill="#1A1208" />
      <ellipse className="char-eye" cx="122" cy="102" rx="9" ry="11" fill="#1A1208" />
      <circle cx="80" cy="99" r="3" fill="#fff" opacity="0.9" />
      <circle cx="124" cy="99" r="3" fill="#fff" opacity="0.9" />
      <path
        className="char-mouth"
        d="M78 128 Q100 142 122 128"
        fill="none"
        stroke="#5C3317"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="68" cy="118" rx="8" ry="5" fill="#E07B4A" opacity="0.35" />
      <ellipse cx="132" cy="118" rx="8" ry="5" fill="#E07B4A" opacity="0.35" />
    </svg>
  );
}

function PriyaPortrait() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="priya-bg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFB8D0" />
          <stop offset="100%" stopColor="#FF6B9D" />
        </radialGradient>
        <linearGradient id="priya-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8B896" />
          <stop offset="100%" stopColor="#C68642" />
        </linearGradient>
        <linearGradient id="priya-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3D2314" />
          <stop offset="100%" stopColor="#1A0F08" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#priya-bg)" />
      <ellipse cx="100" cy="178" rx="70" ry="36" fill="#9B4D6A" />
      <path
        d="M48 88 C45 50, 155 50, 152 88 C158 120, 145 95, 100 92 C55 95, 42 120, 48 88Z"
        fill="url(#priya-hair)"
      />
      <ellipse cx="100" cy="110" rx="48" ry="54" fill="url(#priya-skin)" />
      <ellipse className="char-eye" cx="80" cy="106" rx="8" ry="10" fill="#2A1810" />
      <ellipse className="char-eye" cx="120" cy="106" rx="8" ry="10" fill="#2A1810" />
      <circle cx="82" cy="103" r="2.5" fill="#fff" opacity="0.9" />
      <circle cx="122" cy="103" r="2.5" fill="#fff" opacity="0.9" />
      <path
        className="char-mouth"
        d="M82 130 Q100 138 118 130"
        fill="none"
        stroke="#8B5A3C"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="62" cy="112" r="6" fill="#FFD700" opacity="0.85" />
      <circle cx="138" cy="112" r="6" fill="#FFD700" opacity="0.85" />
      <ellipse cx="70" cy="122" rx="7" ry="4" fill="#E8A090" opacity="0.3" />
      <ellipse cx="130" cy="122" rx="7" ry="4" fill="#E8A090" opacity="0.3" />
    </svg>
  );
}

function EliasPortrait() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="elias-bg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#C8D4B8" />
          <stop offset="100%" stopColor="#6B8F71" />
        </radialGradient>
        <linearGradient id="elias-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C4A8" />
          <stop offset="100%" stopColor="#C9A07A" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#elias-bg)" />
      <ellipse cx="100" cy="178" rx="68" ry="34" fill="#4A5D4E" />
      <path
        d="M54 78 C58 48, 142 48, 146 78 C148 62, 130 55, 100 58 C70 55, 52 62, 54 78Z"
        fill="#B8B8B8"
      />
      <path
        d="M54 78 C52 95, 58 88, 72 86 C88 84, 112 84, 128 86 C142 88, 148 95, 146 78"
        fill="#9A9A9A"
      />
      <ellipse cx="100" cy="112" rx="50" ry="52" fill="url(#elias-skin)" />
      <ellipse cx="100" cy="118" rx="18" ry="12" fill="#D4A88A" opacity="0.5" />
      <ellipse className="char-eye" cx="80" cy="104" rx="7" ry="8" fill="#3A3028" />
      <ellipse className="char-eye" cx="120" cy="104" rx="7" ry="8" fill="#3A3028" />
      <path d="M74 100 Q80 98 86 100" stroke="#6B5A48" strokeWidth="2" fill="none" />
      <path d="M114 100 Q120 98 126 100" stroke="#6B5A48" strokeWidth="2" fill="none" />
      <path
        className="char-mouth"
        d="M84 132 Q100 138 116 132"
        fill="none"
        stroke="#8B6B4A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="72" cy="120" rx="6" ry="3.5" fill="#D4A090" opacity="0.25" />
      <ellipse cx="128" cy="120" rx="6" ry="3.5" fill="#D4A090" opacity="0.25" />
    </svg>
  );
}
