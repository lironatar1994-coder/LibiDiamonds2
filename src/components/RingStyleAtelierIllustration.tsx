import type { CatalogStyle } from "@/data/products";
import { assetPath } from "@/lib/site";

export type RingAtelierStyle = Extract<CatalogStyle, "solitaire" | "halo" | "multi-stone" | "band">;

const settingAssets: Record<RingAtelierStyle, string> = {
  solitaire: "/try-on/v3/rings/aura-solitaire-ring/white-setting.webp",
  halo: "/try-on/v3/rings/nova-halo-ring/white-setting.webp",
  "multi-stone": "/try-on/v3/rings/trio-three-stone-ring/white-setting.webp",
  band: "/try-on/v3/rings/cadre-channel-diamond-band/white-front.webp",
};

const settingFrame: Record<RingAtelierStyle, { x: number; y: number; width: number; height: number }> = {
  solitaire: { x: 66, y: 13, width: 48, height: 48 },
  halo: { x: 55, y: 8, width: 70, height: 58 },
  "multi-stone": { x: 48, y: 15, width: 84, height: 50 },
  band: { x: 28, y: 7, width: 124, height: 70 },
};

export default function RingStyleAtelierIllustration({
  style,
  active,
}: {
  style: RingAtelierStyle;
  active: boolean;
}) {
  const ink = active ? "#f8fbfd" : "#b7c7d1";
  const reflection = active ? "#ffffff" : "#d9e4ea";
  const frame = settingFrame[style];
  const isBand = style === "band";

  return (
    <svg
      viewBox="0 0 180 108"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={`ring-metal-${style}-${active ? "active" : "rest"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7e929f" />
          <stop offset="0.34" stopColor={reflection} />
          <stop offset="0.6" stopColor="#8195a1" />
          <stop offset="0.83" stopColor="#eef4f7" />
          <stop offset="1" stopColor="#6f8491" />
        </linearGradient>
        <radialGradient id={`diamond-aura-${style}-${active ? "active" : "rest"}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={active ? "0.19" : "0.1"} />
          <stop offset="1" stopColor="#d7efff" stopOpacity="0" />
        </radialGradient>
        <filter id={`setting-shadow-${style}-${active ? "active" : "rest"}`} x="-35%" y="-35%" width="170%" height="190%">
          <feDropShadow dx="0" dy="3" stdDeviation={active ? "3" : "2.2"} floodColor="#000b12" floodOpacity={active ? "0.66" : "0.5"} />
        </filter>
      </defs>

      <ellipse
        cx="90"
        cy={isBand ? 62 : 67}
        rx={isBand ? 52 : 49}
        ry={isBand ? 29 : 27}
        stroke={`url(#ring-metal-${style}-${active ? "active" : "rest"})`}
        strokeWidth={active ? "2.05" : "1.65"}
        opacity={active ? "0.96" : "0.76"}
      />
      <path
        d={isBand ? "M40 64 C55 87 125 87 140 64" : "M43 69 C56 88 124 88 137 69"}
        stroke={ink}
        strokeWidth="0.58"
        opacity="0.28"
      />

      <ellipse
        cx="90"
        cy="37"
        rx={style === "multi-stone" ? "48" : isBand ? "55" : style === "halo" ? "35" : "28"}
        ry={style === "multi-stone" ? "29" : isBand ? "25" : style === "halo" ? "32" : "28"}
        fill={`url(#diamond-aura-${style}-${active ? "active" : "rest"})`}
      />

      <image
        href={assetPath(settingAssets[style])}
        x={frame.x}
        y={frame.y}
        width={frame.width}
        height={frame.height}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#setting-shadow-${style}-${active ? "active" : "rest"})`}
        opacity={active ? "1" : "0.92"}
      />

      {active && (
        <g fill="#e2c477">
          <path d="M145 20 l1.3 3.7 3.7 1.3 -3.7 1.3 -1.3 3.7 -1.3 -3.7 -3.7 -1.3 3.7 -1.3z" opacity="0.88" />
          <circle cx="36" cy="39" r="1.15" opacity="0.72" />
        </g>
      )}
    </svg>
  );
}
