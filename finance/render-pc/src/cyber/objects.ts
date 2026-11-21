// cyber3d cutaway objects, built with the tech3d CUTAWAY system (src/tech/cutaway.tsx): every part is a primitive
// with an id, an explode vector and a role, so explode / slice / highlight / label work exactly as in tech3d.
//   vault  a bank vault made of data blocks: a block wall with a round door, the "money" data cubes inside
import type { V3 } from "../blocky/motion";
import type { ObjDef, Part, Prim } from "../tech/cutaway";
import { CP } from "./palette";

const P = (id: string, prim: Prim, p: V3, color: string, o: Partial<Part> = {}): Part => ({ id, prim, p, color, ...o });
const B = 0.5; // block size
const blocks: Part[] = [];
// the front wall: 6 x 5 blocks around a round door (the middle 2 x 3 are the door)
for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
  const x = (c - 2.5) * B * 1.04, y = 0.27 + r * B * 1.04;
  if (Math.abs(x) < 0.6 && y > 0.5 && y < 2.1) continue;
  const n = blocks.length;
  const edge = n % 5 === 0;
  blocks.push(P(`b${r}${c}`, { k: "box", s: [B, B, B * 0.9] }, [x, y, 1.0], edge ? "#123047" : CP.steel, {
    role: "shell", rough: 0.4, emissive: edge ? CP.cyan : CP.cyanDeep, ei: edge ? 0.55 : 0.12,
    ex: [x * 1.6 + (c % 2 ? 0.3 : -0.3), (y - 1.2) * 0.9 + 0.4, 2.2 + 0.5 * ((r * 7 + c * 3) % 4)],
  }));
}
// side and top walls (one slab of blocks each)
for (let r = 0; r < 5; r++) for (const sx of [-1, 1]) for (let d = 0; d < 3; d++) {
  blocks.push(P(`s${sx > 0 ? "R" : "L"}${r}${d}`, { k: "box", s: [B * 0.9, B, B] }, [sx * 1.56, 0.27 + r * B * 1.04, 0.45 - d * B * 1.04], CP.steel, {
    role: "shell", rough: 0.45, emissive: CP.cyanDeep, ei: (r + d) % 3 === 0 ? 0.4 : 0.08, ex: [sx * (1.6 + 0.3 * d), 0.3 * (r - 2), 0.4],
  }));
}
for (let c = 0; c < 6; c++) for (let d = 0; d < 3; d++) {
  blocks.push(P(`t${c}${d}`, { k: "box", s: [B, B * 0.8, B] }, [(c - 2.5) * B * 1.04, 2.85, 0.45 - d * B * 1.04], CP.steel, { role: "shell", rough: 0.45, emissive: CP.magentaDeep, ei: (c + d) % 4 === 0 ? 0.45 : 0.05, ex: [(c - 2.5) * 0.5, 1.8, 0.3] }));
}
const cash: Part[] = [];
for (let k = 0; k < 9; k++) {
  const x = ((k % 3) - 1) * 0.42, y = 0.2 + Math.floor(k / 3) * 0.3, z = -0.15 + (k % 2) * 0.2;
  cash.push(P(`cash${k}`, { k: "box", s: [0.36, 0.24, 0.5] }, [x, y, z], k % 4 === 0 ? CP.magenta : CP.cyan, { role: "inner", emissive: k % 4 === 0 ? CP.magenta : CP.cyan, ei: 0.9, rough: 0.3, ex: [x * 3 + (k % 2 ? 1 : -1) * 0.8, 1.2 + 0.4 * (k % 3), 2.6 + 0.4 * (k % 3)], label: k === 4 ? "THE MONEY" : undefined }));
}
export const VAULT: ObjDef = {
  id: "vault", name: "Data vault", half: [1.75, 1.5, 1.4], centre: [0, 1.45, 0.25], grounded: true,
  slice: { axis: "z", keep: "neg", stop: 0.4 },
  parts: [
    ...blocks,
    P("floor", { k: "box", s: [3.4, 0.08, 1.9] }, [0, 0.04, 0.2], CP.panel, { role: "inner", rough: 0.6 }),
    P("back", { k: "box", s: [3.1, 2.7, 0.2] }, [0, 1.4, -0.7], CP.ink, { role: "inner", rough: 0.7, emissive: CP.cyanDeep, ei: 0.08 }),
    P("ring", { k: "torus", r: 0.62, tube: 0.1, seg: 28 }, [0, 1.3, 1.08], CP.steelHi, { role: "shell", emissive: CP.cyan, ei: 1.0, rough: 0.3, ex: [0, 0, 0.6], label: "VAULT DOOR" }),
    P("door", { k: "cyl", r: 0.56, h: 0.16, seg: 24 }, [0, 1.3, 1.08], CP.steelHi, { r: [Math.PI / 2, 0, 0], role: "shell", rough: 0.35, emissive: CP.cyanDeep, ei: 0.2, ex: [-1.8, -0.2, 1.4] }),
    P("wheel", { k: "torus", r: 0.24, tube: 0.04, seg: 20 }, [0, 1.3, 1.2], CP.white, { role: "shell", emissive: CP.magenta, ei: 0.9, ex: [-1.9, -0.2, 1.7] }),
    P("lock", { k: "box", s: [0.18, 0.18, 0.08] }, [0.36, 1.3, 1.2], CP.red, { role: "shell", emissive: CP.red, ei: 1.0, ex: [-1.5, -0.2, 1.8], label: "LOCK" }),
    ...cash,
  ],
};

export const CYBER_OBJECTS: Record<string, ObjDef> = { vault: VAULT };
export const CYBER_OBJECT_IDS = Object.keys(CYBER_OBJECTS);
