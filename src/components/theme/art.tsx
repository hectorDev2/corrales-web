/** Ilustraciones SVG de las temporadas. Decorativas: siempre aria-hidden. */

interface ArtProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Spider({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <g stroke="#1f1f1f" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M13 21 Q4 13 2 22" />
        <path d="M13 24 Q3 22 2 31" />
        <path d="M13 27 Q4 31 5 39" />
        <path d="M15 29 Q9 34 11 39" />
        <path d="M27 21 Q36 13 38 22" />
        <path d="M27 24 Q37 22 38 31" />
        <path d="M27 27 Q36 31 35 39" />
        <path d="M25 29 Q31 34 29 39" />
      </g>
      <ellipse cx="20" cy="25" rx="8" ry="9.5" fill="#1f1f1f" />
      <circle cx="20" cy="14" r="5.5" fill="#1f1f1f" />
      <path d="M20 21 l-2.5 4.5 h5 z M20 29 l2.5 -4.5 h-5 z" fill="#dc2626" />
      <circle cx="17.8" cy="13" r="1.7" fill="#fff" />
      <circle cx="22.2" cy="13" r="1.7" fill="#fff" />
      <circle cx="17.8" cy="13" r=".8" fill="#dc2626" />
      <circle cx="22.2" cy="13" r=".8" fill="#dc2626" />
    </svg>
  );
}

export function Ghost({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 60 72" className={className} style={style} aria-hidden="true">
      <path
        d="M30 4 C14 4 6 18 6 34 V64 L14 57 L22 65 L30 57 L38 65 L46 57 L54 64 V34 C54 18 46 4 30 4 Z"
        fill="#f5f3ff"
        stroke="#c4b5fd"
        strokeWidth="2"
      />
      <ellipse cx="22" cy="30" rx="4" ry="6.5" fill="#312e81" />
      <ellipse cx="38" cy="30" rx="4" ry="6.5" fill="#312e81" />
      <ellipse cx="30" cy="45" rx="4.5" ry="6" fill="#312e81" />
      <ellipse cx="14" cy="42" rx="4" ry="2.4" fill="#fbcfe8" opacity=".7" />
      <ellipse cx="46" cy="42" rx="4" ry="2.4" fill="#fbcfe8" opacity=".7" />
    </svg>
  );
}

export function Bat({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 60 30" className={className} style={style} aria-hidden="true">
      <path
        d="M30 13 C28 6 22 2 4 7 C9 9 11 13 9 20 C13 16 17 16 21 20 C23 16 26 15 30 19 C34 15 37 16 39 20 C43 16 47 16 51 20 C49 13 51 9 56 7 C38 2 32 6 30 13 Z"
        fill="#111827"
      />
      <circle cx="28" cy="12" r="1" fill="#f87171" />
      <circle cx="32" cy="12" r="1" fill="#f87171" />
    </svg>
  );
}

export function Pumpkin({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 80 70" className={className} style={style} aria-hidden="true">
      <path d="M38 14 C38 7 42 4 47 3 C46 8 44 11 42 14 Z" fill="#4d7c0f" />
      <ellipse cx="40" cy="42" rx="35" ry="26" fill="#f97316" />
      <ellipse cx="22" cy="42" rx="15" ry="26" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
      <ellipse cx="58" cy="42" rx="15" ry="26" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
      <ellipse cx="40" cy="42" rx="13" ry="26" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
      <g className="pumpkin-face" fill="#fde047">
        <polygon points="21,40 34,40 27.5,27" />
        <polygon points="46,40 59,40 52.5,27" />
        <polygon points="40,44 35.5,51 44.5,51" />
        <path d="M20 54 L28 60 L34 54 L40 62 L46 54 L52 60 L60 54 Q40 74 20 54 Z" />
      </g>
    </svg>
  );
}

export function Cobweb({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <g stroke="#9ca3af" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity=".85">
        <path d="M0 0 L120 0 M0 0 L112 38 M0 0 L86 86 M0 0 L38 112 M0 0 L0 120" />
        <path d="M24 0 Q20 18 0 24" />
        <path d="M48 0 Q42 36 0 48" />
        <path d="M72 0 Q66 56 0 72" />
        <path d="M96 0 Q88 76 0 96" />
        <path d="M118 0 Q110 96 0 118" />
      </g>
    </svg>
  );
}

export function ChristmasTree({ className, style }: ArtProps) {
  const lights: [number, number, string][] = [
    [50, 22, "#fde047"],
    [42, 40, "#ef4444"],
    [60, 44, "#60a5fa"],
    [30, 62, "#fde047"],
    [52, 64, "#ef4444"],
    [70, 68, "#60a5fa"],
    [18, 92, "#ef4444"],
    [40, 90, "#fde047"],
    [62, 94, "#ef4444"],
    [82, 96, "#60a5fa"],
  ];
  return (
    <svg viewBox="0 0 100 135" className={className} style={style} aria-hidden="true">
      <rect x="44" y="112" width="12" height="20" rx="2" fill="#7c4a21" />
      <polygon points="50,52 96,114 4,114" fill="#15803d" />
      <polygon points="50,30 86,82 14,82" fill="#16a34a" />
      <polygon points="50,10 76,52 24,52" fill="#22c55e" />
      <polygon points="50,0 53,8 62,8 55,13 58,21 50,16 42,21 45,13 38,8 47,8" fill="#fde047" />
      {lights.map(([x, y, c], i) => (
        <circle
          key={i}
          className="tree-light"
          cx={x}
          cy={y}
          r="3.2"
          fill={c}
          style={{ "--delay": `${(i % 5) * 0.3}s`, "--c": c } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

export function Gifts({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 120 64" className={className} style={style} aria-hidden="true">
      <rect x="6" y="26" width="46" height="36" rx="3" fill="#dc2626" />
      <rect x="26" y="26" width="6" height="36" fill="#fde047" />
      <rect x="6" y="40" width="46" height="6" fill="#fde047" />
      <path d="M29 26 C22 12 10 16 18 26 Z M29 26 C36 12 48 16 40 26 Z" fill="#fde047" />
      <rect x="62" y="38" width="34" height="24" rx="3" fill="#2563eb" />
      <rect x="76" y="38" width="6" height="24" fill="#fff" />
      <path d="M79 38 C74 28 66 31 72 38 Z M79 38 C84 28 92 31 86 38 Z" fill="#fff" />
      <rect x="98" y="46" width="18" height="16" rx="2" fill="#16a34a" />
      <rect x="104" y="46" width="6" height="16" fill="#fde047" />
    </svg>
  );
}

export function OrnamentBall({ color, className, style }: ArtProps & { color: string }) {
  return (
    <svg viewBox="0 0 24 34" className={className} style={style} aria-hidden="true">
      <rect x="9" y="0" width="6" height="6" rx="1.5" fill="#d4af37" />
      <circle cx="12" cy="22" r="11" fill={color} />
      <path d="M3 20 Q12 26 21 20" stroke="#fff" strokeOpacity=".55" strokeWidth="2" fill="none" />
      <path d="M4 26 Q12 32 20 26" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" fill="none" />
      <ellipse cx="8" cy="16" rx="2.4" ry="3.6" fill="#fff" opacity=".45" />
    </svg>
  );
}
