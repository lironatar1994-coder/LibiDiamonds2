import type { CatalogStyle } from "@/data/products";

export type RingAtelierStyle = Extract<CatalogStyle, "solitaire" | "halo" | "multi-stone" | "band">;

function FacetedStone({
  cx,
  cy,
  radius,
  stroke,
  fill,
}: {
  cx: number;
  cy: number;
  radius: number;
  stroke: string;
  fill: string;
}) {
  const diagonal = radius * 0.68;

  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={fill} stroke={stroke} strokeWidth="1.35" />
      <path
        d={`M ${cx} ${cy - radius} L ${cx + diagonal} ${cy - diagonal} L ${cx + radius} ${cy} L ${cx + diagonal} ${cy + diagonal} L ${cx} ${cy + radius} L ${cx - diagonal} ${cy + diagonal} L ${cx - radius} ${cy} L ${cx - diagonal} ${cy - diagonal} Z`}
        stroke={stroke}
        strokeWidth="0.72"
        opacity="0.72"
      />
      <path
        d={`M ${cx} ${cy - radius} L ${cx} ${cy + radius} M ${cx - radius} ${cy} L ${cx + radius} ${cy} M ${cx - diagonal} ${cy - diagonal} L ${cx + diagonal} ${cy + diagonal} M ${cx + diagonal} ${cy - diagonal} L ${cx - diagonal} ${cy + diagonal}`}
        stroke={stroke}
        strokeWidth="0.58"
        opacity="0.48"
      />
      <circle cx={cx} cy={cy} r={radius * 0.26} stroke={stroke} strokeWidth="0.58" opacity="0.58" />
    </g>
  );
}

export default function RingStyleAtelierIllustration({
  style,
  active,
}: {
  style: RingAtelierStyle;
  active: boolean;
}) {
  const ink = active ? "#ffffff" : "#b8c7d1";
  const ice = active ? "#f8fbfd" : "#dbe5eb";
  const gold = active ? "#e2c477" : "#9d8555";

  return (
    <svg
      viewBox="0 0 180 108"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {style === "solitaire" && (
        <g>
          <ellipse cx="90" cy="65" rx="49" ry="29" stroke={ink} strokeWidth="1.55" />
          <path d="M43 68 C55 89 125 89 137 68" stroke={ink} strokeWidth="0.62" opacity="0.45" />
          <path d="M76 42 C81 49 99 49 104 42" stroke={ink} strokeWidth="1.2" opacity="0.8" />
          <FacetedStone cx={90} cy={33} radius={14.5} stroke={ink} fill={ice} />
          <path d="M78 25 l-3 -3 M102 25 l3 -3 M78 41 l-3 3 M102 41 l3 3" stroke={gold} strokeWidth="2" />
        </g>
      )}

      {style === "halo" && (
        <g>
          <ellipse cx="90" cy="66" rx="49" ry="28" stroke={ink} strokeWidth="1.55" />
          <path d="M43 69 C56 89 124 89 137 69" stroke={ink} strokeWidth="0.62" opacity="0.45" />
          <circle cx="90" cy="34" r="22" stroke={gold} strokeWidth="1.15" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const radians = (angle * Math.PI) / 180;
            return (
              <circle
                key={angle}
                cx={90 + Math.cos(radians) * 18.2}
                cy={34 + Math.sin(radians) * 18.2}
                r="2.25"
                fill={ice}
                stroke={gold}
                strokeWidth="0.7"
              />
            );
          })}
          <FacetedStone cx={90} cy={34} radius={11.5} stroke={ink} fill={ice} />
          <path d="M70 43 C77 50 103 50 110 43" stroke={ink} strokeWidth="1.25" />
        </g>
      )}

      {style === "multi-stone" && (
        <g>
          <ellipse cx="90" cy="66" rx="50" ry="28" stroke={ink} strokeWidth="1.55" />
          <path d="M42 69 C56 89 124 89 138 69" stroke={ink} strokeWidth="0.62" opacity="0.45" />
          <path d="M62 43 C72 50 108 50 118 43" stroke={ink} strokeWidth="1.3" />
          <FacetedStone cx={90} cy={33} radius={12.5} stroke={ink} fill={ice} />
          <FacetedStone cx={68} cy={39} radius={8.2} stroke={ink} fill={ice} />
          <FacetedStone cx={112} cy={39} radius={8.2} stroke={ink} fill={ice} />
          <path d="M77 30 l-3 -3 M103 30 l3 -3 M60 37 l-3 -1 M120 37 l3 -1" stroke={gold} strokeWidth="1.8" />
        </g>
      )}

      {style === "band" && (
        <g>
          <ellipse cx="90" cy="59" rx="51" ry="30" stroke={ink} strokeWidth="1.55" />
          <path d="M41 62 C54 85 126 85 139 62" stroke={ink} strokeWidth="0.62" opacity="0.45" />
          <path d="M47 43 C67 26 113 26 133 43" stroke={gold} strokeWidth="1" />
          {[
            [51, 42, 5.2],
            [63, 34.5, 5.8],
            [76, 30, 6.2],
            [90, 28.5, 6.5],
            [104, 30, 6.2],
            [117, 34.5, 5.8],
            [129, 42, 5.2],
          ].map(([cx, cy, radius]) => (
            <FacetedStone key={cx} cx={cx} cy={cy} radius={radius} stroke={ink} fill={ice} />
          ))}
        </g>
      )}
    </svg>
  );
}
