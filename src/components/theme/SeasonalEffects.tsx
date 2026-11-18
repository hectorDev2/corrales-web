"use client";

import { useMemo } from "react";

import type { SeasonalMode, ThemeIntensity } from "@/lib/theme";

import { Bat, ChristmasTree, Cobweb, Ghost, Gifts, OrnamentBall, Pumpkin, Spider } from "./art";
import "./seasonal.css";

interface Props {
  mode: SeasonalMode;
  intensity: ThemeIntensity;
  /** Dentro de una caja (vista previa del admin) en vez de cubrir toda la pantalla. */
  contained?: boolean;
}

const COUNTS: Record<ThemeIntensity, number> = { suave: 0, normal: 1, intenso: 2 };

/** Generador pseudoaleatorio con semilla: mismo resultado en servidor y cliente. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: T[], level: ThemeIntensity) => arr.slice(0, [3, 5, 7][COUNTS[level]] ?? arr.length);
const between = (r: () => number, a: number, b: number) => a + r() * (b - a);

/** En móvil se muestran solo la mitad de los elementos para cuidar el rendimiento. */
const mobileHide = (i: number, total: number) => (i >= Math.ceil(total / 2) ? "max-md:hidden" : "");

const k = (n: number) => `calc(var(--k, 1) * ${n}px)`;

// ─── Halloween ────────────────────────────────────────────────────────────────

function Halloween({ intensity }: { intensity: ThemeIntensity }) {
  const level = COUNTS[intensity];
  const spiders = useMemo(() => {
    const r = rng(31);
    return [8, 24, 71, 90, 48, 36, 60].slice(0, [2, 3, 5][level]).map((x) => ({
      x,
      min: between(r, 28, 60),
      max: between(r, 90, 160),
      dur: between(r, 5.5, 9),
      delay: -between(r, 0, 8),
      size: between(r, 26, 38),
    }));
  }, [level]);
  const ghosts = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: [2, 3, 5][level] }, () => ({
      y: between(r, 18, 70),
      dur: between(r, 24, 42),
      delay: -between(r, 0, 40),
      size: between(r, 38, 58),
    }));
  }, [level]);
  const bats = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: [1, 2, 4][level] }, () => ({
      y: between(r, 6, 40),
      dur: between(r, 9, 15),
      delay: -between(r, 0, 15),
      size: between(r, 30, 44),
    }));
  }, [level]);

  return (
    <>
      <div className="absolute inset-0">
        {ghosts.map((g, i) => (
          <div
            key={`g${i}`}
            className={`ghost ${mobileHide(i, ghosts.length)}`}
            style={{ top: `${g.y}%`, "--dur": `${g.dur}s`, "--delay": `${g.delay}s` } as React.CSSProperties}
          >
            <Ghost style={{ width: k(g.size) }} />
          </div>
        ))}
        {bats.map((b, i) => (
          <div
            key={`b${i}`}
            className={`bat ${mobileHide(i, bats.length)}`}
            style={{ top: `${b.y}%`, "--dur": `${b.dur}s`, "--delay": `${b.delay}s` } as React.CSSProperties}
          >
            <Bat style={{ width: k(b.size) }} />
          </div>
        ))}
      </div>

      <div className="seasonal-hang">
        <Cobweb className="absolute top-0 left-0" style={{ width: k(140), opacity: 0.9 }} />
        <Cobweb className="absolute top-0 right-0 -scale-x-100" style={{ width: k(140), opacity: 0.9 }} />
        {spiders.map((s, i) => (
          <div
            key={i}
            className={`spider-thread ${mobileHide(i, spiders.length)}`}
            style={
              {
                left: `${s.x}%`,
                "--len-min": `calc(var(--k, 1) * ${s.min}px)`,
                "--len-max": `calc(var(--k, 1) * ${s.max}px)`,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
              } as React.CSSProperties
            }
          >
            <Spider style={{ width: k(s.size) }} />
          </div>
        ))}
      </div>

      <div className="seasonal-ground">
        <div className="pumpkin" style={{ left: "1.5%", ["--delay" as string]: "0s" }}>
          <Pumpkin style={{ width: k(78) }} />
        </div>
        <div className="pumpkin" style={{ left: `calc(var(--k, 1) * 82px)`, ["--delay" as string]: "-1.2s" }}>
          <Pumpkin style={{ width: k(46) }} />
        </div>
        <div className="pumpkin" style={{ right: "1.5%", ["--delay" as string]: "-0.6s" }}>
          <Pumpkin style={{ width: k(90) }} />
        </div>
      </div>
    </>
  );
}

// ─── Navidad ──────────────────────────────────────────────────────────────────

const BULB_COLORS = ["#ef4444", "#22c55e", "#fde047", "#60a5fa", "#f472b6"];
const BALL_COLORS = ["#dc2626", "#d4af37", "#2563eb", "#16a34a", "#c026d3", "#dc2626", "#d4af37", "#2563eb"];

function Garland() {
  const swags = 5;
  const perSwag = 5;
  const H = 38;
  const bulbs = useMemo(() => {
    const out: { x: number; y: number; c: string }[] = [];
    for (let s = 0; s < swags; s++) {
      for (let j = 0; j < perSwag; j++) {
        const t = (j + 0.5) / perSwag;
        const x = ((s + t) / swags) * 100;
        // Curva cuadrática: extremos en 2px, punto de control en H*1.6 → caída máxima ≈ 0.8·H.
        const y = (1 - t) ** 2 * 2 + 2 * (1 - t) * t * H * 1.6 + t ** 2 * 2;
        out.push({ x, y, c: BULB_COLORS[(s * perSwag + j) % BULB_COLORS.length] });
      }
    }
    return out;
  }, []);

  let d = "M0 2";
  for (let s = 0; s < swags; s++) {
    const x0 = (s / swags) * 100;
    const x1 = ((s + 1) / swags) * 100;
    d += ` Q${(x0 + x1) / 2} ${H * 1.6} ${x1} 2`;
  }

  return (
    <div className="absolute inset-x-0 top-0" style={{ height: `calc(var(--k, 1) * ${H + 14}px)` }}>
      <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="absolute top-0 left-0 h-[calc(var(--k,1)*38px)] w-full" aria-hidden="true">
        <path d={d} fill="none" stroke="#14532d" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      {bulbs.map((b, i) => (
        <span
          key={i}
          className={`bulb ${i % 2 ? "max-md:hidden" : ""}`}
          style={
            {
              left: `${b.x}%`,
              top: `calc(var(--k, 1) * ${b.y}px)`,
              "--c": b.c,
              "--delay": `${(i % 7) * 0.25}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Navidad({ intensity }: { intensity: ThemeIntensity }) {
  const level = COUNTS[intensity];
  const flakes = useMemo(() => {
    const r = rng(2024);
    return Array.from({ length: [26, 50, 90][level] }, () => ({
      x: r() * 100,
      size: between(r, 3, 8),
      dur: between(r, 9, 20),
      delay: -between(r, 0, 20),
      drift: between(r, -50, 50),
      opacity: between(r, 0.65, 1),
    }));
  }, [level]);
  const ornaments = useMemo(() => {
    const r = rng(12);
    const xs = [6, 19, 33, 58, 72, 86, 45, 94];
    return pick(xs, intensity).map((x, i) => ({
      x,
      len: between(r, 36, 100),
      dur: between(r, 3.2, 5.2),
      delay: -between(r, 0, 4),
      color: BALL_COLORS[i % BALL_COLORS.length],
    }));
  }, [intensity]);

  return (
    <>
      <div className="absolute inset-0">
        {flakes.map((f, i) => (
          <span
            key={i}
            className={`snowflake ${mobileHide(i, flakes.length)}`}
            style={
              {
                left: `${f.x}%`,
                width: f.size,
                height: f.size,
                opacity: f.opacity,
                "--dur": `${f.dur}s`,
                "--delay": `${f.delay}s`,
                "--drift": `${f.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="seasonal-hang">
        <Garland />
        {ornaments.map((o, i) => (
          <div
            key={i}
            className={`ornament ${mobileHide(i, ornaments.length)}`}
            style={
              {
                left: `${o.x}%`,
                marginLeft: k(-12),
                "--dur": `${o.dur}s`,
                "--delay": `${o.delay}s`,
              } as React.CSSProperties
            }
          >
            <div className="ornament-line" style={{ height: k(o.len) }} />
            <OrnamentBall color={o.color} style={{ width: k(24), marginTop: k(-4) }} />
          </div>
        ))}
      </div>

      <div className="seasonal-ground">
        <Gifts className="absolute bottom-0" style={{ left: "1.5%", width: k(120) }} />
        <ChristmasTree className="absolute bottom-0" style={{ right: "1.5%", width: k(96) }} />
      </div>
    </>
  );
}

export function SeasonalEffects({ mode, intensity, contained = false }: Props) {
  return (
    <div
      className={`seasonal-root ${contained ? "seasonal-contained" : ""}`}
      aria-hidden="true"
      data-season={mode}
      style={{ "--k": contained ? 0.55 : 1 } as React.CSSProperties}
    >
      {mode === "halloween" ? <Halloween intensity={intensity} /> : <Navidad intensity={intensity} />}
    </div>
  );
}
