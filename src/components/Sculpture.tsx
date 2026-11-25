/**
 * The signature object: a faceted porcelain core split by a lit crack.
 * Pure SVG (no WebGL): every facet is a separate polygon carrying its own
 * outward vector (--sx/--sy/--sr), used by the CSS assembly on load and by
 * the fracture to pull the facets apart for a beat.
 */
const P = {
  top: [200, 26],
  ne: [306, 92],
  e: [356, 206],
  se: [318, 334],
  bot: [206, 414],
  sw: [92, 350],
  w: [50, 214],
  nw: [104, 92],
  c1: [188, 148],
  c2: [252, 208],
  c3: [210, 292],
  c4: [138, 226],
} as const;

type Key = keyof typeof P;
const FACETS: { pts: Key[]; tone: "a" | "b" | "c" | "d" }[] = [
  { pts: ["top", "ne", "c1"], tone: "a" },
  { pts: ["ne", "c2", "c1"], tone: "b" },
  { pts: ["ne", "e", "c2"], tone: "c" },
  { pts: ["e", "se", "c2"], tone: "d" },
  { pts: ["c2", "se", "c3"], tone: "c" },
  { pts: ["se", "bot", "c3"], tone: "d" },
  { pts: ["bot", "sw", "c3"], tone: "c" },
  { pts: ["c3", "sw", "c4"], tone: "b" },
  { pts: ["sw", "w", "c4"], tone: "c" },
  { pts: ["w", "nw", "c4"], tone: "b" },
  { pts: ["nw", "c1", "c4"], tone: "a" },
  { pts: ["nw", "top", "c1"], tone: "a" },
  { pts: ["c1", "c2", "c3"], tone: "a" },
  { pts: ["c1", "c3", "c4"], tone: "b" },
];

const CENTER = [204, 222];
const CRACK = "M199 30 L206 92 L193 150 L214 214 L196 268 L216 330 L205 410";

// per-facet outward vectors, computed once; static keyframes (no var())
// let the browser run the assembly without re-resolving styles each frame
const VECTORS = FACETS.map((f, i) => {
  const pts = f.pts.map((k) => P[k]);
  const cx = pts.reduce((s, p) => s + p[0], 0) / 3;
  const cy = pts.reduce((s, p) => s + p[1], 0) / 3;
  const vx = cx - CENTER[0];
  const vy = cy - CENTER[1];
  const len = Math.hypot(vx, vy) || 1;
  const dist = 70 + (i % 4) * 26;
  return { sx: +((vx / len) * dist).toFixed(1), sy: +((vy / len) * dist).toFixed(1), sr: (i % 2 ? 1 : -1) * (20 + i * 4) };
});
const KEYFRAMES = VECTORS.map(
  (v, i) => `@keyframes shard-${i}{from{transform:translate(${v.sx}px,${v.sy}px) rotate(${v.sr}deg) scale(.6);opacity:0}}`
).join("");

export default function Sculpture({ className = "" }: { className?: string }) {
  return (
    <svg className={`sculpture ${className}`} viewBox="0 0 410 450" role="img" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--lav)" />
          <stop offset="0.55" stopColor="var(--shard-edge)" />
          <stop offset="1" stopColor="var(--cyan)" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="sc-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--iris)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--iris)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <style>{KEYFRAMES}</style>
      <ellipse cx="204" cy="436" rx="150" ry="12" fill="url(#sc-shadow)" />
      <g className="sculpture-body">
        {FACETS.map((f, i) => {
          const pts = f.pts.map((k) => P[k]);
          const v = VECTORS[i];
          return (
            <polygon
              key={i}
              className="shard"
              points={pts.map((p) => p.join(",")).join(" ")}
              fill={`var(--shard-${f.tone})`}
              stroke="url(#sc-edge)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              style={
                {
                  "--i": i,
                  "--sx": `${v.sx}px`,
                  "--sy": `${v.sy}px`,
                  "--sr": `${v.sr}deg`,
                  animationName: `shard-${i}`,
                } as React.CSSProperties
              }
            />
          );
        })}
        <path d={CRACK} fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <path d={CRACK} fill="none" stroke="#fff010" strokeOpacity="0.35" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path
          className="crack-glow"
          d={CRACK}
          pathLength={1}
          fill="none"
          stroke="#fff010"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
