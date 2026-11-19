// Finance sets (our own designs). HALL: an indoor money hall (tiled floor, back wall with a neon sign, side walls,
// fake AO along every wall/floor corner, a counter, a shelf of coin stacks on the left wall, a wall shelf on the right,
// coloured bounce lights). Two palettes: "now" (bright violet/teal) and "retro" (1970: warm orange/brown). OUTDOOR: the
// template suburb (blocky/World) for the road and the garden plots. Static, except what the stories pass in.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { Blob } from "../blocky/Contact";
import { World } from "../blocky/World";
import { NeonSign, ShelfUnit, SHELF, Jar } from "../library/props";
import { StackRow, CoinStack } from "./props";

export const HALL = { backZ: -3.2, leftX: -3.8, rightX: 3.8, frontZ: 6, wallH: 5.2, counter: [0, 0, -1.4] as V3 };

const aoAlpha = () =>
  canvasTexture("finAoAlpha", 16, 128, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.35, "#6a6a6a");
    gr.addColorStop(1, "#000000");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  }, false);
const aoMats = new Map<string, THREE.MeshBasicMaterial>();
const aoMat = (color: string, op: number) => {
  const k = `${color}|${op}`;
  let m = aoMats.get(k);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, alphaMap: aoAlpha(), transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    aoMats.set(k, m);
  }
  return m;
};
/** fake AO: a soft dark gradient from a corner line (floor: toward local +z; wall: upward) */
export const AO: React.FC<{ p: V3; w: number; d?: number; yaw?: number; wall?: boolean; color?: string; op?: number }> = ({ p, w, d = 0.6, yaw = 0, wall = false, color = "#140a2a", op = 0.5 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={geoOf("finAoPlane", () => new THREE.PlaneGeometry(1, 1))} material={aoMat(color, op)} position={wall ? [0, d / 2, 0.012] : [0, 0.006, d / 2]} rotation={wall ? [0, 0, Math.PI] : [-Math.PI / 2, 0, 0]} scale={[w, d, 1]} renderOrder={2} />
  </group>
);

type Pal = { floorA: string; floorB: string; wall: string; wallTrim: string; side: string; neon: string; counter: string; counterTop: string; shelf: string; bounce: [string, string] };
export const PALETTES: Record<"now" | "retro" | "workshop", Pal> = {
  now: { floorA: "#d4c6f4", floorB: "#a490e0", wall: "#5a48b8", wallTrim: "#2fd0bd", side: "#6a58c8", neon: "#7dffcf", counter: "#ff7a2a", counterTop: "#f4f0ff", shelf: "#5b3fb5", bounce: ["#ff5aa0", "#2fd0bd"] },
  retro: { floorA: "#e8c89a", floorB: "#b0784a", wall: "#a8582a", wallTrim: "#f0c040", side: "#8a4a2a", neon: "#ffb060", counter: "#6a8a3a", counterTop: "#f4e6c8", shelf: "#7a4a2a", bounce: ["#ffb060", "#c86a2a"] },
  workshop: { floorA: "#c8e0d0", floorB: "#8ab8a0", wall: "#2a6a5a", wallTrim: "#ffd23a", side: "#3a7a6a", neon: "#ffd23a", counter: "#ffd23a", counterTop: "#f4f0ff", shelf: "#2a5a4a", bounce: ["#7dffcf", "#ffd23a"] },
};
const floorTex = (pal: Pal) => {
  const t = canvasTexture(`finFloor|${pal.floorA}`, 256, 256, (g, W) => {
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 2; i++) {
        g.fillStyle = (i + j) % 2 ? pal.floorA : pal.floorB;
        g.fillRect((i * W) / 2, (j * W) / 2, W / 2, W / 2);
      }
    g.strokeStyle = "rgba(40,30,60,0.3)";
    g.lineWidth = 3;
    g.strokeRect(0, 0, W, W);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
};
const wallTex = (pal: Pal) =>
  canvasTexture(`finWall|${pal.wall}`, 256, 256, (g, W) => {
    g.fillStyle = pal.wall;
    g.fillRect(0, 0, W, W);
    g.fillStyle = "rgba(255,255,255,0.06)";
    for (let x = 0; x < W; x += 32) g.fillRect(x, 0, 14, W);
  });

/** the hall: everything but the story's own props; `sign` = the neon sign on the back wall */
export const Hall: React.FC<{ pal?: "now" | "retro" | "workshop"; sign?: string; counter?: boolean; shelves?: boolean; shelfFill?: number; children?: React.ReactNode }> = ({ pal: pk = "now", sign = "COIN HALL", counter = true, shelves = true, shelfFill = 1, children }) => {
  const pal = PALETTES[pk];
  const { backZ, leftX, rightX, frontZ, wallH } = HALL;
  const W = rightX - leftX;
  const wt = wallTex(pal);
  return (
    <group>
      <mesh geometry={geoOf("finFloor", () => new THREE.PlaneGeometry(20, 20))} material={plastic("#ffffff", { map: floorTex(pal), rough: 0.5 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow />
      {/* back + side walls (thick boxes), skirting trim */}
      <mesh geometry={rbox(W + 0.4, wallH, 0.2, 0.02)} material={plastic("#ffffff", { map: wt, rough: 0.8 })} position={[0, wallH / 2, backZ - 0.1]} receiveShadow />
      {[leftX, rightX].map((x, i) => (
        <mesh key={i} geometry={rbox(0.2, wallH, frontZ - backZ + 0.2, 0.02)} material={plastic(pal.side, { rough: 0.8 })} position={[x + (i ? 0.1 : -0.1), wallH / 2, (backZ + frontZ) / 2]} receiveShadow />
      ))}
      <mesh geometry={rbox(W, 0.14, 0.04, 0.01)} material={plastic(pal.wallTrim, { rough: 0.5 })} position={[0, 0.07, backZ + 0.02]} />
      <mesh geometry={rbox(W, 0.08, 0.04, 0.01)} material={plastic(pal.wallTrim, { rough: 0.5 })} position={[0, 2.9, backZ + 0.02]} />
      {/* fake AO along the corners */}
      <AO p={[0, 0, backZ]} w={W} d={0.7} />
      <AO p={[0, 0, backZ]} w={W} d={0.6} wall op={0.35} />
      <AO p={[leftX, 0, 1.4]} w={frontZ - backZ} d={0.6} yaw={Math.PI / 2} />
      <AO p={[rightX, 0, 1.4]} w={frontZ - backZ} d={0.6} yaw={-Math.PI / 2} />
      {/* ceiling (no black void in wides) with a soft light strip, and the neon sign above the counter */}
      <mesh geometry={geoOf("finCeil", () => new THREE.PlaneGeometry(20, 20))} material={plastic(pal.side, { rough: 0.9 })} rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, 2]} />
      <mesh geometry={rbox(W - 1, 0.06, 0.4, 0.02)} material={plastic("#fff4e0", { emissive: "#fff4e0", ei: 1.2 })} position={[0, wallH - 0.05, 0.5]} />
      <NeonSign p={[0.9, 2.55, backZ + 0.06]} text={sign} w={2.2} h={0.48} color={pal.neon} />
      {counter ? <FinCounter p={HALL.counter} pal={pal} /> : null}
      {shelves ? (
        <>
          <ShelfUnit p={[leftX + SHELF.d / 2 + 0.02, 0, -0.6]} yaw={Math.PI / 2} color={pal.shelf}>
            {SHELF.boards.map((y, i) => (
              <StackRow key={i} p={[0, y, 0]} k={9} n={(4 + i * 2) * shelfFill} gap={0.27} seed={i * 11} />
            ))}
          </ShelfUnit>
          <AO p={[leftX + 0.55, 0, -0.6]} w={2.8} d={0.5} yaw={Math.PI / 2} op={0.4} />
          {/* right wall: a low cabinet with jars of coins */}
          <mesh geometry={rbox(0.5, 0.9, 2.4, 0.03)} material={plastic(pal.shelf, { rough: 0.5 })} position={[rightX - 0.27, 0.45, -0.8]} castShadow receiveShadow />
          {[-1.6, -0.8, 0].map((z, i) => (
            <group key={i}>
              <Jar p={[rightX - 0.27, 0.9, z]} label={false}>
                <CoinStack p={[0, 0.02, 0]} n={5 + i * 3} seed={i + 40} />
              </Jar>
            </group>
          ))}
          <AO p={[rightX - 0.52, 0, -0.8]} w={2.5} d={0.4} yaw={-Math.PI / 2} op={0.4} />
        </>
      ) : null}
      {/* bounce lights from the strongly coloured surfaces (<= 2 practicals) */}
      <pointLight position={[leftX + 0.8, 1.2, 0.5]} color={pal.bounce[0]} intensity={1.2} distance={4} decay={2} />
      <pointLight position={[rightX - 0.8, 1.4, 1.0]} color={pal.bounce[1]} intensity={1.0} distance={4} decay={2} />
      {children}
    </group>
  );
};
export const FinCounter: React.FC<{ p: V3; pal: Pal }> = ({ p, pal }) => (
  <group position={p}>
    <mesh geometry={rbox(2.4, 0.95, 0.7, 0.04)} material={plastic(pal.counter, { rough: 0.45 })} position={[0, 0.475, 0]} castShadow receiveShadow />
    <mesh geometry={rbox(2.52, 0.06, 0.82, 0.02)} material={plastic(pal.counterTop, { rough: 0.3 })} position={[0, 0.98, 0]} castShadow receiveShadow />
    {[0.28, 0.6].map((y) => (
      <mesh key={y} geometry={rbox(2.4, 0.06, 0.012, 0.004)} material={plastic(pal.wallTrim, { rough: 0.5 })} position={[0, y, 0.356]} />
    ))}
    <Blob p={[0, 0, 0]} sx={2.8} sz={1.1} op={0.45} />
  </group>
);

/** the outdoor set: the template suburb (road along x at z -9.9..-2.4, near lawn z > -0.9) */
export const Outdoor: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <group>
    <World />
    {children}
  </group>
);
