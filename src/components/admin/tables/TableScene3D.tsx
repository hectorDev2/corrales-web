"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import type { RestaurantTable, TableActiveOrder } from "@/lib/api/tables";

import { STATE_CONFIG, type TableState, getTableState, minutesSince } from "./table-state";

// Medidas del salón en unidades 3D (≈ metros). Mantiene la proporción 16:11 del editor plano.
const FLOOR_W = 16;
const FLOOR_D = 11;

const WOOD_DARK = "#7a5634";
const CUSHION = "#a8322b";
const DIMMED = "#d6d3d1";

// ─── Recursos compartidos ─────────────────────────────────────────────────────
// Todas las mesas reutilizan las mismas geometrías y materiales. Crear uno por
// silla/pata/plato multiplicaba la memoria de la GPU por cada mesa del salón.

const GEO = {
  chairLeg: new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6),
  seat: new RoundedBoxGeometry(0.44, 0.09, 0.44, 2, 0.04),
  back: new RoundedBoxGeometry(0.44, 0.5, 0.06, 2, 0.03),
  plate: new THREE.CylinderGeometry(0.15, 0.12, 0.02, 20),
  plateInner: new THREE.CylinderGeometry(0.08, 0.08, 0.002, 20),
  longEdge: new RoundedBoxGeometry(3.1, 0.08, 1.05, 2, 0.04),
  longTop: new RoundedBoxGeometry(3.04, 0.04, 0.99, 2, 0.02),
  longLeg: new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8),
  roundEdge: new THREE.CylinderGeometry(0.5, 0.5, 0.07, 40),
  roundTop: new THREE.CylinderGeometry(0.47, 0.47, 0.02, 40),
  ovalEdge: new THREE.CylinderGeometry(0.62, 0.62, 0.07, 40),
  ovalTop: new THREE.CylinderGeometry(0.59, 0.59, 0.02, 40),
  pedestal: new THREE.CylinderGeometry(0.06, 0.08, 0.72, 12),
  base: new THREE.CylinderGeometry(0.32, 0.36, 0.04, 24),
  ring: new THREE.RingGeometry(0.92, 1, 48),
};

const MAT = {
  woodDark: new THREE.MeshStandardMaterial({ color: WOOD_DARK, roughness: 0.6 }),
  cushion: new THREE.MeshStandardMaterial({ color: CUSHION, roughness: 0.8 }),
  plate: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3 }),
  plateInner: new THREE.MeshStandardMaterial({ color: "#ece6dc" }),
};

const colorMats = new Map<string, THREE.MeshStandardMaterial>();
/** Material por color, creado una sola vez (hay pocos colores: uno por estado). */
function matFor(color: string, roughness = 0.45) {
  const key = `${color}-${roughness}`;
  let m = colorMats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness });
    colorMats.set(key, m);
  }
  return m;
}

const ringMats = new Map<string, THREE.MeshBasicMaterial>();
function ringMat(color: string, opacity: number) {
  const key = `${color}-${opacity}`;
  let m = ringMats.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    ringMats.set(key, m);
  }
  return m;
}

function darker(color: string) {
  return new THREE.Color(color).multiplyScalar(0.78).getStyle();
}

type Shape = "round" | "oval" | "long";

function shapeFor(seats: number): Shape {
  return seats <= 2 ? "round" : seats <= 6 ? "oval" : "long";
}

const Z_OFFSET = 0.45;
const X_MIN = (0.05 - 0.5) * FLOOR_W;
const X_MAX = (0.95 - 0.5) * FLOOR_W;
const Z_MIN = (0.12 - 0.5) * FLOOR_D - Z_OFFSET;
const Z_MAX = (0.94 - 0.5) * FLOOR_D - Z_OFFSET;

/** Coordenadas del piso 3D → posición en % que se guarda en la base de datos. */
function toPercent(x: number, z: number) {
  return {
    pos_x: Math.round((x / FLOOR_W + 0.5) * 10000) / 100,
    pos_y: Math.round(((z + Z_OFFSET) / FLOOR_D + 0.5) * 10000) / 100,
  };
}

/** Convierte la posición en % guardada a coordenadas del piso 3D. */
function toWorld(t: RestaurantTable): [number, number] {
  // En el editor, pos_y marca el pie del dibujo; el centro de la mesa queda un poco más al fondo.
  return [(t.pos_x / 100 - 0.5) * FLOOR_W, (t.pos_y / 100 - 0.5) * FLOOR_D - Z_OFFSET];
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

const CHAIR_LEGS: [number, number, number][] = [
  [-0.16, 0.21, -0.16],
  [0.16, 0.21, -0.16],
  [-0.16, 0.21, 0.16],
  [0.16, 0.21, 0.16],
];

function Chair({ position, angle }: { position: [number, number, number]; angle: number }) {
  return (
    <group position={position} rotation-y={angle}>
      {CHAIR_LEGS.map((p, i) => (
        <mesh key={i} position={p} geometry={GEO.chairLeg} material={MAT.woodDark} />
      ))}
      <mesh position={[0, 0.46, 0]} geometry={GEO.seat} material={MAT.cushion} castShadow />
      <mesh position={[0, 0.74, 0.2]} geometry={GEO.back} material={MAT.woodDark} castShadow />
    </group>
  );
}

function Plate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh geometry={GEO.plate} material={MAT.plate} />
      <mesh position={[0, 0.011, 0]} geometry={GEO.plateInner} material={MAT.plateInner} />
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

const LONG_LEGS: [number, number, number][] = [
  [-1.35, 0.36, -0.38],
  [-1.35, 0.36, 0.38],
  [1.35, 0.36, -0.38],
  [1.35, 0.36, 0.38],
];

function TableTop({ shape, color }: { shape: Shape; color: string }) {
  const edge = matFor(darker(color), 0.55);
  const top = matFor(color);
  if (shape === "long") {
    return (
      <>
        <mesh position={[0, 0.74, 0]} geometry={GEO.longEdge} material={edge} castShadow />
        <mesh position={[0, 0.78, 0]} geometry={GEO.longTop} material={top} />
        {LONG_LEGS.map((p, i) => (
          <mesh key={i} position={p} geometry={GEO.longLeg} material={MAT.woodDark} />
        ))}
      </>
    );
  }
  const round = shape === "round";
  const sx = round ? 1 : 0.85 / 0.62;
  return (
    <>
      <mesh position={[0, 0.74, 0]} scale={[sx, 1, 1]} geometry={round ? GEO.roundEdge : GEO.ovalEdge} material={edge} castShadow />
      <mesh position={[0, 0.78, 0]} scale={[sx, 1, 1]} geometry={round ? GEO.roundTop : GEO.ovalTop} material={top} />
      <mesh position={[0, 0.37, 0]} geometry={GEO.pedestal} material={MAT.woodDark} />
      <mesh position={[0, 0.02, 0]} scale={[sx * 0.9, 1, 1]} geometry={GEO.base} material={MAT.woodDark} />
    </>
  );
}

/** Aro de color en el piso alrededor de la mesa (estático: no obliga a redibujar). */
function RingFor({ shape, color, strong }: { shape: Shape; color: string; strong: boolean }) {
  const [ix, iz] = shape === "long" ? [1.95, 1.4] : shape === "round" ? [1.05, 1.05] : [1.45, 1.25];
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, 0.012, 0]}
      scale={[ix, iz, 1]}
      geometry={GEO.ring}
      material={ringMat(color, strong ? 0.9 : 0.6)}
    />
  );
}

// ─── Mesa completa ────────────────────────────────────────────────────────────

interface TableModelProps {
  table: RestaurantTable;
  state: TableState;
  minutes: number | null;
  dimmed: boolean;
  selected: boolean;
  editMode: boolean;
  onSelect: () => void;
  onDragChange: (dragging: boolean) => void;
  onMove: (pos: { pos_x: number; pos_y: number }) => void;
}

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const HIT = new THREE.Vector3();

type Capturable = { setPointerCapture(id: number): void; releasePointerCapture(id: number): void };

function TableModel({ table, state, minutes, dimmed, selected, editMode, onSelect, onDragChange, onMove }: TableModelProps) {
  const [hovered, setHovered] = useState(false);
  // Posición mientras se arrastra. Se descarta sola cuando llega la posición guardada.
  const [drag, setDrag] = useState<{ x: number; z: number; fromX: number; fromY: number; moving: boolean } | null>(null);
  const liveDrag = drag && drag.fromX === table.pos_x && drag.fromY === table.pos_y ? drag : null;
  const cfg = STATE_CONFIG[state];
  const active = table.is_active;
  const shape = shapeFor(table.capacity);
  const seats = Math.min(12, Math.max(1, table.capacity));
  const { chairs, plates } = useMemo(() => layout(shape, seats), [shape, seats]);
  const [x, z] = liveDrag ? [liveDrag.x, liveDrag.z] : toWorld(table);
  const color = dimmed || !active ? DIMMED : state === "libre" ? "#d8b07a" : cfg.top;
  const lift = liveDrag?.moving ? 0.3 : selected ? 0.12 : hovered ? 0.05 : 0;

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (editMode || e.delta > 6) return; // fue un arrastre, no un toque
    onSelect();
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (!editMode) return;
    e.stopPropagation();
    (e.target as unknown as Capturable).setPointerCapture(e.pointerId);
    onSelect();
    onDragChange(true);
    setDrag({ x, z, fromX: table.pos_x, fromY: table.pos_y, moving: true });
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!liveDrag?.moving) return;
    e.stopPropagation();
    if (!e.ray.intersectPlane(FLOOR_PLANE, HIT)) return;
    setDrag({
      ...liveDrag,
      x: Math.min(X_MAX, Math.max(X_MIN, HIT.x)),
      z: Math.min(Z_MAX, Math.max(Z_MIN, HIT.z)),
    });
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    if (!liveDrag?.moving) return;
    e.stopPropagation();
    (e.target as unknown as Capturable).releasePointerCapture(e.pointerId);
    onDragChange(false);
    setDrag({ ...liveDrag, moving: false });
    const pos = toPercent(liveDrag.x, liveDrag.z);
    if (pos.pos_x !== table.pos_x || pos.pos_y !== table.pos_y) onMove(pos);
    else setDrag(null);
  }

  return (
    <group
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = editMode ? "grab" : "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      {(selected || (active && state !== "libre" && !dimmed)) && (
        <RingFor shape={shape} color={selected ? "#e4002b" : cfg.halo} strong={selected || state === "pendiente"} />
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
  editMode: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, pos: { pos_x: number; pos_y: number }) => void;
}

export default function TableScene3D({
  tables,
  ordersByTable,
  filter,
  now,
  selectedId,
  editMode,
  onSelect,
  onMove,
}: TableScene3DProps) {
  const [dragging, setDragging] = useState(false);
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      camera={{ position: [0, 10.5, 10.5], fov: 38 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#f4ede4"]} />
      <hemisphereLight args={["#fff8ee", "#b08a62", 0.7]} />
      <directionalLight
        position={[6, 12, 7]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 4, 0]} intensity={8} distance={14} color="#ffd9a8" />

      <Room />
      {editMode && (
        <gridHelper
          args={[FLOOR_W, 32, "#8a6a48", "#c9ab84"]}
          position={[0, 0.008, 0]}
          scale={[1, 1, FLOOR_D / FLOOR_W]}
        />
      )}

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
            editMode={editMode}
            onSelect={() => onSelect(t.id)}
            onDragChange={setDragging}
            onMove={(pos) => onMove(t.id, pos)}
          />
        );
      })}

      <OrbitControls
        makeDefault
        enabled={!dragging}
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
