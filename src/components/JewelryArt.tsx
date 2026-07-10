import type { ArtType, Metal } from "@/data/products";

const METAL_COLOR: Record<Metal, string> = {
  yellow: "#ac8c56",
  white: "#9aa0a6",
  rose: "#c08e74",
};

const STONE_STROKE = "#6b6350";
const STONE_FILL = "#fffef9";

interface Pt {
  x: number;
  y: number;
}

function svgNum(value: number): number {
  return Number(value.toFixed(3));
}

function polar(cx: number, cy: number, r: number, deg: number): Pt {
  const rad = (deg * Math.PI) / 180;
  return { x: svgNum(cx + r * Math.cos(rad)), y: svgNum(cy + r * Math.sin(rad)) };
}

/** Side-profile brilliant-cut diamond. Girdle centered at (cx, cy), total width w. */
function DiamondProfile({
  cx,
  cy,
  w,
  sw = 1.6,
}: {
  cx: number;
  cy: number;
  w: number;
  sw?: number;
}) {
  const t = 0.28 * w; // half table width
  const h = 0.3 * w; // crown height
  const g = 0.5 * w; // half girdle width
  const p = 0.17 * w; // pavilion facet girdle offset
  const c = 0.55 * w; // culet depth
  const outline = `${cx - t},${cy - h} ${cx + t},${cy - h} ${cx + g},${cy} ${cx},${cy + c} ${cx - g},${cy}`;
  return (
    <g stroke={STONE_STROKE} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
      <polygon points={outline} fill={STONE_FILL} fillOpacity={0.9} />
      <line x1={cx - t} y1={cy - h} x2={cx - p} y2={cy} />
      <line x1={cx + t} y1={cy - h} x2={cx + p} y2={cy} />
      <line x1={cx - p} y1={cy} x2={cx} y2={cy + c} />
      <line x1={cx + p} y1={cy} x2={cx} y2={cy + c} />
      <line x1={cx - g} y1={cy} x2={cx + g} y2={cy} />
    </g>
  );
}

/** Top-view round brilliant: circle + table octagon + kite facet lines. */
function DiamondTop({
  cx,
  cy,
  r,
  sw = 1.4,
}: {
  cx: number;
  cy: number;
  r: number;
  sw?: number;
}) {
  const angles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  const inner = angles.map((a) => polar(cx, cy, r * 0.48, a));
  const octagon = inner.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <g stroke={STONE_STROKE} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
      <circle cx={cx} cy={cy} r={r} fill={STONE_FILL} fillOpacity={0.9} />
      <polygon points={octagon} fill="none" />
      {angles.map((a, i) => {
        const o = polar(cx, cy, r, a);
        return <line key={i} x1={inner[i].x} y1={inner[i].y} x2={o.x} y2={o.y} />;
      })}
    </g>
  );
}

/** Small accent stone (halo / pavé / tennis rows). */
function SmallStone({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <circle
      cx={svgNum(cx)}
      cy={svgNum(cy)}
      r={svgNum(r)}
      fill={STONE_FILL}
      fillOpacity={0.95}
      stroke={STONE_STROKE}
      strokeWidth={1.1}
    />
  );
}

function Shadow() {
  return (
    <ellipse cx={200} cy={354} rx={104} ry={12} fill="#c9bfa6" opacity={0.35} />
  );
}

/** Plain ring band as two concentric outline circles. */
function Band({ metal, cy = 254, r = 92 }: { metal: string; cy?: number; r?: number }) {
  return (
    <g stroke={metal} strokeWidth={2.4} fill="none">
      <circle cx={200} cy={cy} r={r} />
      <circle cx={200} cy={cy} r={r - 9} />
    </g>
  );
}

function Prongs({ metal, y1, y2, spread }: { metal: string; y1: number; y2: number; spread: number }) {
  return (
    <g stroke={metal} strokeWidth={2.2} strokeLinecap="round">
      <line x1={200 - spread} y1={y1} x2={200 - spread * 0.45} y2={y2} />
      <line x1={200 + spread} y1={y1} x2={200 + spread * 0.45} y2={y2} />
    </g>
  );
}

function SolitaireRing({ metal }: { metal: string }) {
  return (
    <>
      <Band metal={metal} />
      <Prongs metal={metal} y1={146} y2={170} spread={45} />
      <DiamondProfile cx={200} cy={144} w={90} />
    </>
  );
}

function HaloRing({ metal }: { metal: string }) {
  const haloR = 47;
  const stones = Array.from({ length: 14 }, (_, i) => polar(200, 126, haloR, i * (360 / 14)));
  return (
    <>
      <Band metal={metal} />
      <g stroke={metal} strokeWidth={2.2} strokeLinecap="round">
        <line x1={185} y1={168} x2={192} y2={161} />
        <line x1={215} y1={168} x2={208} y2={161} />
      </g>
      <circle cx={200} cy={126} r={haloR} fill="none" stroke={metal} strokeWidth={1.2} opacity={0.5} />
      {stones.map((p, i) => (
        <SmallStone key={i} cx={p.x} cy={p.y} r={5} />
      ))}
      <DiamondTop cx={200} cy={126} r={30} />
    </>
  );
}

function ThreeStoneRing({ metal }: { metal: string }) {
  return (
    <>
      <Band metal={metal} />
      <Prongs metal={metal} y1={150} y2={170} spread={38} />
      <DiamondProfile cx={128} cy={160} w={48} sw={1.3} />
      <DiamondProfile cx={272} cy={160} w={48} sw={1.3} />
      <DiamondProfile cx={200} cy={148} w={80} />
    </>
  );
}

function PaveRing({ metal }: { metal: string }) {
  const stones = [-58, -46, -34, 34, 46, 58].map((deg) =>
    polar(200, 254, 87.5, deg - 90)
  );
  return (
    <>
      <Band metal={metal} />
      {stones.map((p, i) => (
        <SmallStone key={i} cx={p.x} cy={p.y} r={4.2} />
      ))}
      <Prongs metal={metal} y1={146} y2={168} spread={45} />
      <DiamondProfile cx={200} cy={144} w={90} />
    </>
  );
}

function Studs({ metal }: { metal: string }) {
  const prong = (cx: number, cy: number, r: number) => (
    <g stroke={metal} strokeWidth={2} strokeLinecap="round">
      {[45, 135, 225, 315].map((a, i) => {
        const p1 = polar(cx, cy, r + 1, a);
        const p2 = polar(cx, cy, r + 9, a);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
      })}
    </g>
  );
  return (
    <>
      {prong(132, 178, 46)}
      <DiamondTop cx={132} cy={178} r={46} sw={1.6} />
      {prong(268, 240, 46)}
      <DiamondTop cx={268} cy={240} r={46} sw={1.6} />
    </>
  );
}

function Hoops({ metal }: { metal: string }) {
  const hoop = (cx: number, cy: number) => {
    const stones = [115, 90, 65, 40, 140].map((deg) => polar(cx, cy, 57, deg));
    return (
      <g>
        <circle cx={cx} cy={cy} r={62} fill="none" stroke={metal} strokeWidth={2.2} />
        <circle cx={cx} cy={cy} r={52} fill="none" stroke={metal} strokeWidth={2.2} />
        {stones.map((p, i) => (
          <SmallStone key={i} cx={p.x} cy={p.y} r={4.6} />
        ))}
      </g>
    );
  };
  return (
    <>
      {hoop(138, 190)}
      {hoop(266, 226)}
    </>
  );
}

function quadPoint(t: number, p0: Pt, p1: Pt, p2: Pt): Pt {
  const mt = 1 - t;
  return {
    x: svgNum(mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x),
    y: svgNum(mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y),
  };
}

function TennisNecklace({ metal }: { metal: string }) {
  const p0 = { x: 66, y: 96 };
  const p1 = { x: 200, y: 356 };
  const p2 = { x: 334, y: 96 };
  const stones = Array.from({ length: 15 }, (_, i) => {
    const t = 0.06 + (i * 0.88) / 14;
    const pt = quadPoint(t, p0, p1, p2);
    const r = svgNum(4.4 + 4.6 * Math.sin(Math.PI * t));
    return { ...pt, r };
  });
  return (
    <>
      <path
        d={`M${p0.x},${p0.y} Q${p1.x},${p1.y} ${p2.x},${p2.y}`}
        fill="none"
        stroke={metal}
        strokeWidth={1.6}
      />
      {stones.map((s, i) => (
        <SmallStone key={i} cx={s.x} cy={s.y} r={s.r} />
      ))}
    </>
  );
}

function Chain({ metal }: { metal: string }) {
  return (
    <g fill="none" stroke={metal} strokeWidth={2}>
      <path d="M118,36 Q158,122 197,186" />
      <path d="M282,36 Q242,122 203,186" />
      <ellipse cx={200} cy={196} rx={7} ry={11} />
    </g>
  );
}

function Pendant({ metal }: { metal: string }) {
  return (
    <>
      <Chain metal={metal} />
      <Prongs metal={metal} y1={230} y2={212} spread={30} />
      <DiamondProfile cx={200} cy={232} w={66} />
    </>
  );
}

function BezelPendant({ metal }: { metal: string }) {
  return (
    <>
      <Chain metal={metal} />
      <circle cx={200} cy={240} r={35} fill="none" stroke={metal} strokeWidth={3.2} />
      <DiamondTop cx={200} cy={240} r={26} />
    </>
  );
}

function TennisBracelet({ metal }: { metal: string }) {
  const stones = Array.from({ length: 22 }, (_, i) => {
    const rad = ((i * 360) / 22) * (Math.PI / 180);
    return { x: svgNum(200 + 118 * Math.cos(rad)), y: svgNum(216 + 84 * Math.sin(rad)) };
  });
  return (
    <>
      <ellipse cx={200} cy={216} rx={118} ry={84} fill="none" stroke={metal} strokeWidth={1.4} opacity={0.6} />
      {stones.map((p, i) => (
        <SmallStone key={i} cx={p.x} cy={p.y} r={6.4} />
      ))}
    </>
  );
}

function Bangle({ metal }: { metal: string }) {
  return (
    <>
      <g fill="none" stroke={metal} strokeWidth={2.4}>
        <ellipse cx={200} cy={222} rx={118} ry={86} />
        <ellipse cx={200} cy={222} rx={107} ry={76} />
      </g>
      <circle cx={200} cy={137} r={27} fill={STONE_FILL} stroke={metal} strokeWidth={3} />
      <DiamondTop cx={200} cy={137} r={19} sw={1.2} />
    </>
  );
}

const ART: Record<ArtType, (props: { metal: string }) => React.ReactNode> = {
  solitaire: SolitaireRing,
  halo: HaloRing,
  "three-stone": ThreeStoneRing,
  pave: PaveRing,
  studs: Studs,
  hoops: Hoops,
  "tennis-necklace": TennisNecklace,
  pendant: Pendant,
  "bezel-pendant": BezelPendant,
  "tennis-bracelet": TennisBracelet,
  bangle: Bangle,
};

export default function JewelryArt({
  type,
  metal = "yellow",
  className,
}: {
  type: ArtType;
  metal?: Metal;
  className?: string;
}) {
  const Piece = ART[type];
  const color = METAL_COLOR[metal];
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Shadow />
      <Piece metal={color} />
    </svg>
  );
}

/** Large decorative diamond used in the hero / section backgrounds. */
export function HeroDiamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 340" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <DiamondProfile cx={200} cy={150} w={300} sw={1.1} />
    </svg>
  );
}
