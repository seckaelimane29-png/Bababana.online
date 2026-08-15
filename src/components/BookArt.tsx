/**
 * Generated cover artwork for every book.
 * Each title maps to an abstract motif that visualises the book's core lesson,
 * so a reader can recognise the idea before reading a single word.
 */

export type MotifKey =
  | "twoColumns"
  | "seed"
  | "chevrons"
  | "staircase"
  | "sunDunes"
  | "compound"
  | "orbits"
  | "lightBars"
  | "brokenChain"
  | "pyramid"
  | "nestedSquares"
  | "ziggurat"
  | "sprout"
  | "zeroToOne"
  | "arrowhead"
  | "focusRings"
  | "clockArc"
  | "loop"
  | "goldenCircle"
  | "magnet"
  | "handshake"
  | "speech"
  | "bridge"
  | "compass"
  | "pillar"
  | "letter"
  | "iceberg"
  | "longPath"
  | "summit"
  | "hourglass";

type Art = { motif: MotifKey; hue: number };

const MAP: Record<string, Art> = {
  "rich dad poor dad": { motif: "twoColumns", hue: 150 },
  "think and grow rich": { motif: "seed", hue: 40 },
  "as a man thinketh": { motif: "sprout", hue: 130 },
  "the art of war": { motif: "chevrons", hue: 20 },
  "atomic habits": { motif: "staircase", hue: 200 },
  "the alchemist": { motif: "sunDunes", hue: 60 },
  "the psychology of money": { motif: "compound", hue: 155 },
  "the 7 habits of highly effective people": { motif: "orbits", hue: 230 },
  "man's search for meaning": { motif: "lightBars", hue: 250 },
  "the wretched of the earth": { motif: "brokenChain", hue: 25 },
  "the 48 laws of power": { motif: "pyramid", hue: 300 },
  "the magic of thinking big": { motif: "nestedSquares", hue: 210 },
  "the richest man in babylon": { motif: "ziggurat", hue: 45 },
  "the $100 startup": { motif: "sprout", hue: 165 },
  "zero to one": { motif: "zeroToOne", hue: 260 },
  "the 33 strategies of war": { motif: "arrowhead", hue: 15 },
  "deep work": { motif: "focusRings", hue: 220 },
  "the 4-hour workweek": { motif: "clockArc", hue: 190 },
  "the lean startup": { motif: "loop", hue: 175 },
  "start with why": { motif: "goldenCircle", hue: 50 },
  "influence: the psychology of persuasion": { motif: "magnet", hue: 320 },
  "how to win friends and influence people": { motif: "handshake", hue: 30 },
  "how to talk to anyone": { motif: "speech", hue: 195 },
  "never split the difference": { motif: "bridge", hue: 100 },
  "the almanack of naval ravikant": { motif: "compass", hue: 180 },
  meditations: { motif: "pillar", hue: 275 },
  "letters from a stoic": { motif: "letter", hue: 285 },
  endurance: { motif: "iceberg", hue: 215 },
  "long walk to freedom": { motif: "longPath", hue: 145 },
  "can't hurt me": { motif: "summit", hue: 10 },
  "your money or your life": { motif: "hourglass", hue: 140 },
};

const FALLBACK: MotifKey[] = ["orbits", "staircase", "compound", "focusRings", "nestedSquares", "summit"];

/** Resolves the motif + hue for a book title, with a stable fallback for unknown titles. */
export function bookArt(title: string): Art {
  const key = title.trim().toLowerCase().replace(/[’]/g, "'");
  const hit = MAP[key];
  if (hit) return hit;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
  return { motif: FALLBACK[h % FALLBACK.length], hue: h };
}

function Motif({ motif }: { motif: MotifKey }) {
  const s = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (motif) {
    case "twoColumns":
      return (
        <g {...s} strokeWidth={2}>
          <rect x={16} y={34} width={22} height={46} />
          <rect x={62} y={54} width={22} height={26} />
          <path d="M27 34V18M73 54v-8" />
          <circle cx={27} cy={14} r={4} />
        </g>
      );
    case "seed":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={50} cy={62} r={6} />
          {[16, 26, 36, 44].map((r, i) => (
            <circle key={i} cx={50} cy={62} r={r} opacity={0.75 - i * 0.15} />
          ))}
          <path d="M50 56V20" />
        </g>
      );
    case "sprout":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M50 92V38" />
          <path d="M50 62c-16 0-24-10-24-22 14 0 24 8 24 22Z" />
          <path d="M50 50c14 0 22-9 22-20-13 0-22 8-22 20Z" />
        </g>
      );
    case "chevrons":
      return (
        <g {...s} strokeWidth={2}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M20 ${30 + i * 16} 50 ${16 + i * 16} 80 ${30 + i * 16}`} opacity={1 - i * 0.18} />
          ))}
        </g>
      );
    case "staircase":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M14 88h16V72h16V56h16V40h16V24h8" />
          {[22, 38, 54, 70].map((x, i) => (
            <rect key={i} x={x - 4} y={80 - i * 16} width={8} height={8} opacity={0.5} />
          ))}
        </g>
      );
    case "sunDunes":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={50} cy={42} r={16} />
          <path d="M10 74c14-12 24 6 40-2s26 6 40-4" />
          <path d="M10 88c16-10 26 6 40 0s24 4 40-6" opacity={0.6} />
        </g>
      );
    case "compound":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M14 86C40 86 62 74 84 22" />
          <path d="M14 86h72" opacity={0.4} />
          {[30, 46, 62, 78].map((x, i) => (
            <circle key={i} cx={x} cy={86 - i * i * 3 - i * 6} r={2.5} />
          ))}
        </g>
      );
    case "orbits":
      return (
        <g {...s} strokeWidth={1.8}>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={50} cy={54} rx={36} ry={14} transform={`rotate(${i * 60} 50 54)`} />
          ))}
          <circle cx={50} cy={54} r={5} />
        </g>
      );
    case "lightBars":
      return (
        <g {...s} strokeWidth={2}>
          {[24, 36, 48, 60, 72].map((x) => (
            <path key={x} d={`M${x} 20v68`} opacity={0.5} />
          ))}
          <circle cx={50} cy={54} r={12} />
          <path d="M50 42v-22M50 66v22M38 54H16M62 54h22" opacity={0.8} />
        </g>
      );
    case "brokenChain":
      return (
        <g {...s} strokeWidth={2}>
          <ellipse cx={32} cy={40} rx={10} ry={14} />
          <ellipse cx={68} cy={70} rx={10} ry={14} />
          <path d="M40 52 54 60" opacity={0.5} />
          <path d="M12 88h76" opacity={0.4} />
        </g>
      );
    case "pyramid":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M50 16 86 86H14Z" />
          <path d="M32 60h36M24 74h52" opacity={0.6} />
          <circle cx={50} cy={34} r={4} />
        </g>
      );
    case "nestedSquares":
      return (
        <g {...s} strokeWidth={2}>
          {[8, 18, 28, 38].map((d, i) => (
            <rect key={i} x={50 - d} y={54 - d} width={d * 2} height={d * 2} opacity={1 - i * 0.18} />
          ))}
        </g>
      );
    case "ziggurat":
      return (
        <g {...s} strokeWidth={2}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={22 + i * 7} y={78 - i * 15} width={56 - i * 14} height={13} />
          ))}
        </g>
      );
    case "zeroToOne":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={32} cy={54} r={16} />
          <path d="M68 30v48" />
          <path d="M62 36 68 30" />
        </g>
      );
    case "arrowhead":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M50 18 70 50 50 42 30 50Z" />
          <path d="M50 46v42" />
          <path d="M34 74h32" opacity={0.6} />
        </g>
      );
    case "focusRings":
      return (
        <g {...s} strokeWidth={2}>
          {[38, 28, 18].map((r, i) => (
            <circle key={i} cx={50} cy={54} r={r} opacity={0.4 + i * 0.2} strokeDasharray={i === 0 ? "4 6" : undefined} />
          ))}
          <circle cx={50} cy={54} r={5} fill="currentColor" />
        </g>
      );
    case "clockArc":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={50} cy={54} r={30} strokeDasharray="4 6" opacity={0.5} />
          <path d="M50 24a30 30 0 0 1 30 30" strokeWidth={3} />
          <path d="M50 54V34M50 54h16" />
        </g>
      );
    case "loop":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M74 42a26 26 0 1 0 6 20" />
          <path d="M68 36 76 44 66 50" />
          <circle cx={50} cy={54} r={5} />
        </g>
      );
    case "goldenCircle":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={50} cy={54} r={34} opacity={0.45} />
          <circle cx={50} cy={54} r={22} opacity={0.7} />
          <circle cx={50} cy={54} r={10} strokeWidth={3} />
        </g>
      );
    case "magnet":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M30 78V50a20 20 0 0 1 40 0v28" />
          <path d="M30 66h16M54 66h16" />
          <path d="M22 30c10 6 46 6 56 0" opacity={0.5} />
        </g>
      );
    case "handshake":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={36} cy={54} r={20} opacity={0.8} />
          <circle cx={64} cy={54} r={20} opacity={0.8} />
          <path d="M50 38v32" opacity={0.5} />
        </g>
      );
    case "speech":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M20 34h44a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H38l-12 10V68h-6a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8Z" />
          <path d="M30 46h30M30 56h20" opacity={0.6} />
        </g>
      );
    case "bridge":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M12 72c14 0 18-26 38-26s24 26 38 26" />
          <path d="M12 78h76" opacity={0.5} />
          {[28, 44, 60, 76].map((x, i) => (
            <path key={i} d={`M${x} ${i % 2 ? 54 : 50}v24`} opacity={0.4} />
          ))}
        </g>
      );
    case "compass":
      return (
        <g {...s} strokeWidth={2}>
          <circle cx={50} cy={54} r={32} />
          <path d="M62 42 56 60 38 66 44 48Z" />
          <path d="M50 18v6M50 84v6M14 54h6M80 54h6" opacity={0.6} />
        </g>
      );
    case "pillar":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M26 26h48M22 88h56" />
          <path d="M34 26v62M50 26v62M66 26v62" opacity={0.85} />
        </g>
      );
    case "letter":
      return (
        <g {...s} strokeWidth={2}>
          <rect x={20} y={32} width={60} height={44} rx={4} />
          <path d="M20 36 50 58 80 36" />
          <path d="M32 84h36" opacity={0.5} />
        </g>
      );
    case "iceberg":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M50 20 74 52H26Z" />
          <path d="M12 52h76" opacity={0.6} />
          <path d="M26 52 16 78l34 12 34-12-10-26" opacity={0.45} />
        </g>
      );
    case "longPath":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M20 92c14-10 6-26 18-34s28-4 34-18" />
          <rect x={64} y={20} width={20} height={26} />
          <path d="M74 46V20" opacity={0.5} />
        </g>
      );
    case "summit":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M12 86 40 44l14 18 12-18 22 42Z" />
          <path d="M20 86 50 30" strokeDasharray="4 5" opacity={0.7} />
          <circle cx={50} cy={28} r={4} />
        </g>
      );
    case "hourglass":
      return (
        <g {...s} strokeWidth={2}>
          <path d="M28 20h44L50 54l22 34H28l22-34Z" />
          <path d="M24 20h52M24 88h52" />
          <circle cx={50} cy={54} r={2.5} fill="currentColor" />
        </g>
      );
    default:
      return null;
  }
}

/** Greedy word wrap for the cover title, tuned for the 100-unit wide artboard. */
function wrap(title: string, max: number, lines: number) {
  const words = title.toUpperCase().split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = `${kept[lines - 1].slice(0, max - 1)}…`;
    return kept;
  }
  return out;
}

/**
 * Publisher-style cover: typographic title block, hairline rule, book-specific
 * line-art motif and a printed spine edge. Text lives in the SVG so a cover
 * reads identically at thumbnail and hero sizes.
 */
export function BookArt({ title, author, className = "" }: { title: string; author?: string; className?: string }) {
  const { motif, hue } = bookArt(title);
  const ink = `oklch(0.24 0.06 ${hue})`;
  const paper = `oklch(0.94 0.035 ${hue})`;
  const tint = `oklch(0.87 0.07 ${hue})`;
  const accent = `oklch(0.55 0.15 ${hue})`;
  const lines = wrap(title, 12, 4);
  const titleTop = 17;

  return (
    <div aria-hidden="true" className={`absolute inset-0 ${className}`}>
      <svg viewBox="0 0 100 150" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`fld-${hue}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor={paper} />
            <stop offset="100%" stopColor={tint} />
          </linearGradient>
          <linearGradient id={`spn-${hue}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect width="100" height="150" fill={`url(#fld-${hue})`} />
        <rect width="6" height="150" fill={`url(#spn-${hue})`} />
        <rect x="7.2" y="0" width="0.5" height="150" fill={ink} opacity="0.12" />

        <g fill={ink} fontFamily="var(--font-display, Georgia, serif)">
          {lines.map((l, i) => (
            <text
              key={i}
              x="14"
              y={titleTop + i * 9.6}
              fontSize="8"
              fontWeight="800"
              letterSpacing="0.15"
              textLength={l.length > 10 ? 78 : undefined}
              lengthAdjust="spacingAndGlyphs"
            >
              {l}
            </text>
          ))}
          <rect x="14" y={titleTop + lines.length * 9.6 - 4} width="20" height="1.2" fill={accent} />
        </g>

        <g transform="translate(21, 62) scale(0.6)" style={{ color: accent }} opacity="0.95">
          <Motif motif={motif} />
        </g>

        {author && (
          <text
            x="14"
            y="140"
            fontSize="5.4"
            fontWeight="600"
            letterSpacing="0.6"
            fill={ink}
            opacity="0.72"
            fontFamily="var(--font-sans, system-ui, sans-serif)"
          >
            {author.toUpperCase().slice(0, 22)}
          </text>
        )}
      </svg>
    </div>
  );
}
