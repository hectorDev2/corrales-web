"use client";

import { ContactShadows, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type { RestaurantTable, TableActiveOrder } from "@/lib/api/tables";

import { STATE_CONFIG, type TableState, getTableState, minutesSince } from "./table-state";

// Medidas del salón en unidades 3D (≈ metros). Mantiene la proporción 16:11 del editor plano.
const FLOOR_W = 16;
const FLOOR_D = 11;

const WOOD_DARK = "#7a5634";
const CUSHION = "#a8322b";
const DIMMED = "#d6d3d1";

type Shape = "round" | "oval" | "long";

function shapeFor(seats: number): Shape {
  return seats <= 2 ? "round" : seats <= 6 ? "oval" : "long";
}

/** Convierte la posición en % del editor plano a coordenadas del piso 3D. */
function toWorld(t: RestaurantTable): [number, number] {
  // En el editor, pos_y marca el pie del dibujo; el centro de la mesa queda un poco más al fondo.
  return [(t.pos_x / 100 - 0.5) * FLOOR_W, (t.pos_y / 100 - 0.5) * FLOOR_D - 0.45];
}

// ─── Piso de madera generado (sin descargar imágenes) ────────────────────────

function useWoodTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    const plankH = 512 / 8;
    for (let row = 0; row < 8; row++) {
      // Tablones con tonos ligeramente distintos y juntas desplazadas.
      const shade = 200 + ((row * 37) % 23);
      g.fillStyle = `rgb(${shade + 18}, ${shade - 12}, ${shade - 62})`;
      g.fillRect(0, row * plankH, 512, plankH);
      g.fillStyle = "rgba(90, 55, 25, 0.35)";
      g.fillRect(0, row * plankH, 512, 2);
      const offset = (row % 2) * 256 + ((row * 97) % 120);
      g.fillRect(offset % 512, row * plankH, 2, plankH);
      g.fillRect((offset + 256) % 512, row * plankH, 2, plankH);
      g.strokeStyle = "rgba(120, 75, 35, 0.12)";
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        const y = row * plankH + 10 + k * 13;
        g.moveTo(0, y);
        g.bezierCurveTo(170, y - 6, 340, y + 6, 512, y);
        g.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    tex.anisotropy = 8;
    return tex;
  }, []);
}

function Room() {
  const wood = useWoodTexture();
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[FLOOR_W, FLOOR_D]} />
        <meshStandardMaterial map={wood} roughness={0.75} />
      </mesh>
      {/* Zócalo alrededor del piso */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[FLOOR_W + 0.3, 0.3, FLOOR_D + 0.3]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      {/* Pared del fondo y paredes laterales bajas */}
      <mesh position={[0, 0.9, -FLOOR_D / 2 - 0.08]} castShadow receiveShadow>
        <boxGeometry args={[FLOOR_W + 0.3, 1.8, 0.16]} />
        <meshStandardMaterial color="#efe6d8" />
      </mesh>
      <mesh position={[0, 0.25, -FLOOR_D / 2 + 0.01]}>
        <boxGeometry args={[FLOOR_W, 0.5, 0.04]} />
        <meshStandardMaterial color="#e4002b" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * (FLOOR_W + 0.15)) / 2, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.9, FLOOR_D + 0.3]} />
          <meshStandardMaterial color="#efe6d8" />
        </mesh>
      ))}
      {/* Entrada: alfombra roja al frente */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, FLOOR_D / 2 - 0.45]} receiveShadow>
        <planeGeometry args={[2.6, 0.8]} />
        <meshStandardMaterial color="#9f1d22" roughness={0.95} />
      </mesh>
      <Html position={[0, 0.05, FLOOR_D / 2 - 0.45]} center zIndexRange={[10, 0]} pointerEvents="none">
        <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-black tracking-widest whitespace-nowrap text-white uppercase">
          Entrada
        </span>
      </Html>
    </group>
  );
}

// ─── Mobiliario ───────────────────────────────────────────────────────────────

function Chair({ position, angle }: { position: [number, number, number]; angle: number }) {
  return (
    <group position={position} rotation-y={angle}>
      {[-0.16, 0.16].flatMap((x) =>
        [-0.16, 0.16].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.21, z]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
            <meshStandardMaterial color={WOOD_DARK} />
          </mesh>
        )),
      )}
      <RoundedBox args={[0.44, 0.09, 0.44]} radius={0.04} position={[0, 0.46, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={CUSHION} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.5, 0.06]} radius={0.03} position={[0, 0.74, 0.2]} castShadow>
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </RoundedBox>
    </group>
  );
}

function Plate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.02, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.011, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.002, 24]} />
        <meshStandardMaterial color="#ece6dc" />
      </mesh>
    </group>
  );
}

/** Calcula sillas y platos según la forma de la mesa (en coordenadas locales). */
function layout(shape: Shape, seats: number) {
  const chairs: { pos: [number, number, number]; angle: number }[] = [];
  const plates: [number, number, number][] = [];
  const topY = 0.78;

  if (shape === "long") {
    const perSide = Math.ceil(seats / 2);
    const span = 2.4;
    for (let i = 0; i < seats; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const k = Math.floor(i / 2);
      const x = perSide === 1 ? 0 : -span / 2 + (span / (perSide - 1)) * k;
      chairs.push({ pos: [x, 0, side * 0.9], angle: side === 1 ? 0 : Math.PI });
      plates.push([x, topY + 0.01, side * 0.28]);
    }
    return { chairs, plates };
  }

  const rx = shape === "round" ? 0.5 : 0.85;
  const rz = shape === "round" ? 0.5 : 0.62;
  for (let i = 0; i < seats; i++) {
    const a = (i / seats) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * (rx + 0.38);
    const z = Math.sin(a) * (rz + 0.38);
    chairs.push({ pos: [x, 0, z], angle: Math.atan2(x, z) });
    plates.push([Math.cos(a) * rx * 0.62, topY + 0.01, Math.sin(a) * rz * 0.62]);
  }
  return { chairs, plates };
}

function TableTop({ shape, color }: { shape: Shape; color: string }) {
  const edge = useMemo(() => new THREE.Color(color).multiplyScalar(0.78).getStyle(), [color]);
  if (shape === "long") {
    return (
      <>
        <RoundedBox args={[3.1, 0.08, 1.05]} radius={0.04} position={[0, 0.74, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={edge} roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[3.04, 0.04, 0.99]} radius={0.02} position={[0, 0.78, 0]} receiveShadow>
          <meshStandardMaterial color={color} roughness={0.45} />
        </RoundedBox>
        {[-1.35, 1.35].flatMap((x) =>
          [-0.38, 0.38].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.36, z]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.72, 10]} />
              <meshStandardMaterial color={WOOD_DARK} />
            </mesh>
          )),
        )}
      </>
    );
  }
  const r = shape === "round" ? 0.5 : 0.62;
  const sx = shape === "round" ? 1 : 0.85 / 0.62;
  return (
    <>
      <mesh position={[0, 0.74, 0]} scale={[sx, 1, 1]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, 0.07, 48]} />
        <meshStandardMaterial color={edge} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0]} scale={[sx, 1, 1]} receiveShadow>
        <cylinderGeometry args={[r - 0.03, r - 0.03, 0.02, 48]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {/* Pedestal central */}
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.72, 16]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, 0.02, 0]} scale={[sx * 0.9, 1, 1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.04, 32]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </>
  );
}

/** Aro de color en el piso; late suavemente cuando hay un pedido nuevo. */
function Halo({ color, pulse, selected }: { color: string; pulse: boolean; selected: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!pulse || !ref.current) return;
    const t = state.clock.getElapsedTime();
    const s = 1 + Math.sin(t * 4) * 0.06;
    ref.current.scale.set(s, s, 1);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 4) * 0.2;
    state.invalidate();
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
      <ringGeometry args={[0.92, 1, 64]} />
      <meshBasicMaterial color={selected ? "#e4002b" : color} transparent opacity={selected ? 0.9 : 0.55} />
    </mesh>
  );
}

function RingFor({ shape, color, pulse, selected }: { shape: Shape; color: string; pulse: boolean; selected: boolean }) {
  const [ix, iz] = shape === "long" ? [1.95, 1.4] : shape === "round" ? [1.05, 1.05] : [1.45, 1.25];
  return (
    <group scale={[ix, 1, iz]}>
      <Halo color={color} pulse={pulse} selected={selected} />
    </group>
  );
}

// ─── Mesa completa ────────────────────────────────────────────────────────────

interface TableModelProps {
  table: RestaurantTable;
  state: TableState;
  minutes: number | null;
  dimmed: boolean;
  selected: boolean;
  onSelect: () => void;
}

function TableModel({ table, state, minutes, dimmed, selected, onSelect }: TableModelProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATE_CONFIG[state];
  const active = table.is_active;
  const shape = shapeFor(table.capacity);
  const seats = Math.min(12, Math.max(1, table.capacity));
  const { chairs, plates } = useMemo(() => layout(shape, seats), [shape, seats]);
  const [x, z] = toWorld(table);
  const color = dimmed || !active ? DIMMED : state === "libre" ? "#d8b07a" : cfg.top;
  const lift = selected ? 0.12 : hovered ? 0.05 : 0;

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (e.delta > 6) return; // fue un arrastre de cámara, no un toque
    onSelect();
  }

  return (
    <group
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      {(selected || (active && state !== "libre" && !dimmed)) && (
        <RingFor shape={shape} color={cfg.halo || "#e4002b"} pulse={state === "pendiente" && !selected} selected={selected} />
      )}
      <group rotation-y={table.rotation === 90 && shape !== "round" ? Math.PI / 2 : 0} position-y={lift}>
        <TableTop shape={shape} color={color} />
        {plates.map((p, i) => (
          <Plate key={i} position={p} />
        ))}
        {chairs.map((c, i) => (
          <Chair key={i} position={c.pos} angle={c.angle} />
        ))}
      </group>

      <Html position={[0, 1.55 + lift, 0]} center zIndexRange={[10, 0]} style={{ opacity: dimmed ? 0.35 : 1 }}>
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Mesa ${table.label}, ${active ? cfg.label : "inactiva"}`}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black whitespace-nowrap shadow-lg transition-transform select-none ${
            selected ? "bg-primary text-on-primary scale-110" : "bg-white/95 text-[#2b2118]"
          }`}
        >
          {table.label}
          {active && state !== "libre" && (
            <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${cfg.chip}`}>
              <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
              {minutes !== null && minutes > 0 ? `${minutes}′` : null}
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}

// ─── Escena ───────────────────────────────────────────────────────────────────

export interface TableScene3DProps {
  tables: RestaurantTable[];
  ordersByTable: Map<string, TableActiveOrder[]>;
  filter: TableState | null;
  now: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TableScene3D({ tables, ordersByTable, filter, now, selectedId, onSelect }: TableScene3DProps) {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0, 10.5, 10.5], fov: 38 }}
      gl={{ antialias: true }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#f4ede4"]} />
      <hemisphereLight args={["#fff8ee", "#b08a62", 0.7]} />
      <directionalLight
        position={[6, 12, 7]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 4, 0]} intensity={8} distance={14} color="#ffd9a8" />

      <Room />
      <ContactShadows position={[0, 0.003, 0]} scale={[FLOOR_W, FLOOR_D]} opacity={0.35} blur={2.4} far={2} />

      {tables.map((t) => {
        const orders = ordersByTable.get(t.id) ?? [];
        const state = t.is_active ? getTableState(orders) : "libre";
        const minutes = orders[0] ? minutesSince(orders[0].created_at, now) : null;
        const dimmed = filter !== null && (!t.is_active || state !== filter);
        return (
          <TableModel
            key={t.id}
            table={t}
            state={state}
            minutes={minutes}
            dimmed={dimmed}
            selected={selectedId === t.id}
            onSelect={() => onSelect(t.id)}
          />
        );
      })}

      <OrbitControls
        makeDefault
        target={[0, 0, 0.3]}
        enableDamping
        minDistance={6}
        maxDistance={22}
        minPolarAngle={0.25}
        maxPolarAngle={1.15}
        minAzimuthAngle={-0.9}
        maxAzimuthAngle={0.9}
      />
    </Canvas>
  );
}
