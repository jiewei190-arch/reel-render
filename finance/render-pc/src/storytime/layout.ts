// storytime layout: kid proportions (chunky, big head), the three sets' marks (where the leads and the background
// classmates sit or stand), their fixed cameras, and the caption band. Pure data + maths: compiled in node for the QA.
import type { CastSpec, SetId } from "./types";

export type V3 = [number, number, number];
export const W = 1080, H = 1920, FPS = 30;

/** kid proportions at scale 1 (metres): short legs, a block torso, a BIG head (Roblox-adjacent) */
export const K = {
  legH: 0.46, legW: 0.19, torsoH: 0.48, torsoW: 0.52, torsoD: 0.3, neck: 0.03,
  headW: 0.48, headH: 0.46, headD: 0.42, armW: 0.155, armL: 0.5, seatH: 0.44,
} as const;
/** hip height standing / seated */
export const hipY = (sit: boolean) => (sit ? K.seatH : K.legH);
/** head centre above the hip */
export const HEAD_UP = K.torsoH + K.neck + K.headH / 2;
/** body stretch: adults (teacher, principal) get long legs and a taller torso under the same big head */
export const bodyK = (spec?: { adult?: boolean }) => (spec?.adult ? { leg: 1.75, torso: 1.3 } : { leg: 1, torso: 1 });
/** hip height and head-above-hip for a spec */
export const hipOf = (sit: boolean, spec?: { adult?: boolean }) => (sit ? K.seatH : K.legH * bodyK(spec).leg);
export const headUpOf = (spec?: { adult?: boolean }) => K.torsoH * bodyK(spec).torso + K.neck + K.headH / 2;

/** a place for a kid: floor position, body yaw (0 faces +z), seated or standing */
/** y: the floor under it (a stage) */
export type Mark = { x: number; z: number; yaw: number; sit: boolean; s?: number; y?: number };

/** opt: only when recipe.props.show lists its id (adults, episode guests) */
export type Extra = Mark & { id: string; spec: CastSpec; seed: number; opt?: boolean };

/** background classmates: simple, low detail (dot eyes, a few colours), generic */
const EX_SKIN = ["#f1c7a1", "#c68a5c", "#8a5534", "#e8b98d", "#5c3a24", "#f5d2b4"];
const EX_TOP = ["#3f8efc", "#26b37a", "#ff8c42", "#ef476f", "#8d99ae", "#06a6a0", "#f4d35e", "#9b5de5"];
const EX_HAIR = ["#2a1b12", "#6b3e1f", "#121212", "#c9a227", "#4a2c17", "#1d1d2b"];
const EX_STYLE: CastSpec["hairStyle"][] = ["buzz", "puff", "bob", "flattop", "buzz", "bob"];
const extra = (id: string, i: number, m: Mark): Extra => ({
  id, seed: i + 1, ...m,
  spec: {
    name: id, skin: EX_SKIN[i % EX_SKIN.length], hair: EX_HAIR[(i * 5) % EX_HAIR.length], hairStyle: EX_STYLE[(i * 7) % EX_STYLE.length],
    top: EX_TOP[(i * 3) % EX_TOP.length], topStyle: "tee", trim: "#ffffff", pants: i % 2 ? "#33415c" : "#4a4e69", shoes: "#2b2d42", brow: "#2a1b12", height: 0.94 + 0.06 * ((i * 37) % 5) / 4,
  },
});

export type SetCam = { pos: V3; look: V3; fov: number };
/** the adults (generic: a teacher, a principal) */
export const ADULTS: Record<"teacher" | "principal", CastSpec> = {
  teacher: { name: "teacher", skin: "#e8b48f", hair: "#5a3420", hairStyle: "bob", top: "#2a9d8f", topStyle: "tee", trim: "#2a9d8f", pants: "#3d405b", shoes: "#2b2d42", brow: "#4a2a18", adult: true, glasses: "#2b2d42" },
  principal: { name: "principal", skin: "#7a4a2c", hair: "#2a2a2a", hairStyle: "buzz", top: "#2b2d42", topStyle: "bomber", inner: "#f4f4f0", trim: "#2b2d42", pants: "#2b2d42", shoes: "#111111", brow: "#1d1d1d", adult: true, tie: "#c1121f", glasses: "#111111" },
};
const adult = (id: "teacher" | "principal", m: Mark): Extra => ({ id, seed: id === "teacher" ? 31 : 37, opt: true, ...m, spec: ADULTS[id] });
export type SetLayout = {
  id: SetId;
  marks: { me: Mark; homie: Mark };
  extras: Extra[];
  /** yaw of the direction from the leads' midpoint to the two-shot camera */
  twoYaw: number;
  /** wide_class, crowd, windows, and named set cameras (setcam) */
  cams: Record<string, SetCam>;
  /** the room: cameras stay inside it (x, y, z ranges) */
  bounds: [[number, number], [number, number], [number, number]];
  /** solid set pieces the leads must not enter (QA): centre + half sizes */
  blockers: { name: string; c: V3; h: V3 }[];
  /** the cafeteria's windows (x centres, bottom, top, z) */
  windows?: { xs: number[]; w: number; y0: number; y1: number; z: number };
};

const PI = Math.PI;
/** the desk in front of a seated kid (classroom): its top centre */
export const deskOf = (m: Mark): V3 => [m.x + Math.sin(m.yaw) * 0.46, 0.66, m.z + Math.cos(m.yaw) * 0.46];

const classroomExtras: Extra[] = [];
{
  let i = 0;
  for (const z of [-0.75, -2.15]) for (const x of [-1.75, -0.6, 0.6, 1.75]) classroomExtras.push(extra(`kid${++i}`, i, { x, z, yaw: PI, sit: true }));
}
classroomExtras.push(adult("teacher", { x: -1.22, z: -4.25, yaw: 0.15, sit: false }));
/** the gym: four rows of kids on benches facing the stage (-z); the leads sit mid-row 3 */
export const GYM = { rows: [-4.0, -2.8, -1.6, -0.4], xs: [-3.15, -2.25, -1.35, -0.45, 0.45, 1.35, 2.25, 3.15], stageY: 0.9, stageZ: [-9.0, -6.0] as [number, number], speakerX: 4.7, mic: [0, 0.9, -6.4] as V3 };
const gymExtras: Extra[] = [];
{
  let i = 0;
  for (const z of GYM.rows) for (const x of GYM.xs) { if (z === -1.6 && Math.abs(x) < 0.5) continue; i++; gymExtras.push(extra(`gym${i}`, i + 3, { x, z, yaw: PI, sit: true })); }
}
gymExtras.push({ ...adult("principal", { x: 0, z: -6.9, yaw: 0, sit: false, y: GYM.stageY }), id: "principal_stage" });

export const SETS: Record<SetId, SetLayout> = {
  classroom: {
    id: "classroom",
    // the leads share the back row; the class sits in front of them, facing the board (-z)
    marks: { me: { x: 0.56, z: 2.0, yaw: PI, sit: true }, homie: { x: -0.56, z: 2.0, yaw: PI, sit: true } },
    extras: classroomExtras,
    twoYaw: PI + 0.55,
    bounds: [[-4.0, 4.0], [0.3, 3.2], [-4.7, 3.6]],
    cams: {
      wide_class: { pos: [-2.7, 2.55, 3.55], look: [0.5, 0.75, -1.2], fov: 54 },
      crowd: { pos: [0.05, 1.32, 1.25], look: [0, 1.0, -1.4], fov: 50 },
      // over the class's heads at the whiteboard and the teacher
      board: { pos: [-0.1, 2.0, -0.3], look: [-0.28, 1.6, -4.85], fov: 58 },
      // the teacher, chest up (her face goes purple)
      teacher: { pos: [-0.85, 1.74, -2.5], look: [-1.19, 1.6, -4.25], fov: 34 },
    },
    blockers: [],
  },
  hallway: {
    id: "hallway",
    marks: { homie: { x: -0.38, z: 0, yaw: 0.62, sit: false }, me: { x: 0.78, z: 0.78, yaw: -2.25, sit: false } },
    // the principal (optional) stops the homie at the lockers, standing where the narrator would be (hide "me")
    extras: [extra("hall1", 9, { x: -1.15, z: -4.6, yaw: PI / 2, sit: false }), extra("hall2", 12, { x: 1.2, z: -7.4, yaw: -PI / 2 + 0.3, sit: false }), extra("hall3", 4, { x: -0.9, z: -9.5, yaw: 0.4, sit: false }),
      adult("principal", { x: 0.6, z: 0.95, yaw: Math.atan2(-0.98, -0.95), sit: false })],
    twoYaw: 0.05,
    bounds: [[-1.45, 1.45], [0.3, 2.9], [-14, 5.6]],
    cams: {
      wide_class: { pos: [0.3, 1.9, 4.6], look: [-0.1, 1.0, -2.5], fov: 50 },
      // low, over the homie's shoulder, up at the principal
      principal: { pos: [-1.25, 1.05, 0.3], look: [0.6, 1.58, 0.95], fov: 36 },
      // over the principal's shoulder, down onto the homie
      on_homie: { pos: [0.72, 1.84, 1.68], look: [-0.38, 1.12, 0], fov: 36 },
      // down the hallway: the two of them at the lockers
      stop: { pos: [0.2, 1.55, -2.9], look: [0.1, 1.3, 0.5], fov: 42 },
    },
    blockers: [],
  },
  cafeteria: {
    id: "cafeteria",
    // across one table (long along x): homie faces +z with the big windows behind him, me faces -z
    marks: { homie: { x: 0, z: -0.72, yaw: 0, sit: true }, me: { x: 0, z: 0.72, yaw: PI, sit: true } },
    extras: [
      extra("caf1", 2, { x: -3.5, z: -0.72, yaw: 0, sit: true }), extra("caf2", 5, { x: -2.6, z: 0.72, yaw: PI, sit: true }),
      extra("caf3", 7, { x: 3.4, z: -0.72, yaw: 0, sit: true }), extra("caf4", 10, { x: 2.5, z: 0.72, yaw: PI, sit: true }),
      extra("caf5", 3, { x: -1.6, z: -2.8, yaw: 0, sit: true }), extra("caf6", 8, { x: 1.7, z: -2.8, yaw: 0, sit: true }),
    ],
    twoYaw: 1.25,
    bounds: [[-6.2, 6.2], [0.3, 3.6], [-4.0, 5.0]],
    cams: {
      wide_class: { pos: [3.4, 2.4, 3.6], look: [-0.4, 1.0, -1.6], fov: 52 },
      crowd: { pos: [1.2, 1.3, 1.9], look: [3.0, 1.0, -0.3], fov: 46 },
      windows: { pos: [1.15, 1.32, 2.7], look: [-0.25, 1.75, -4.2], fov: 54 },
    },
    blockers: [{ name: "table", c: [0, 0.6, 0], h: [1.8, 0.06, 0.5] }],
    windows: { xs: [-3.3, 0, 3.3], w: 2.9, y0: 0.8, y1: 3.5, z: -4.2 },
  },
  detention: {
    id: "detention",
    // the homie alone at a desk under the DETENTION sign (the narrator is not here: hide "me")
    marks: { homie: { x: 0, z: 0, yaw: 0, sit: true }, me: { x: 2.3, z: 2.8, yaw: PI, sit: false } },
    extras: [],
    twoYaw: 0.3,
    bounds: [[-2.8, 2.8], [0.3, 2.9], [-2.3, 3.4]],
    cams: {
      wide_class: { pos: [1.3, 1.85, 3.2], look: [0, 1.3, -1.6], fov: 50 },
      lonely: { pos: [1.3, 1.85, 3.2], look: [0, 1.3, -1.6], fov: 50 },
    },
    blockers: [],
  },
  gym: {
    id: "gym",
    // an assembly: rows of kids on benches facing the stage; the principal at a mic on the stage
    marks: { me: { x: 0.45, z: -1.6, yaw: PI, sit: true }, homie: { x: -0.45, z: -1.6, yaw: PI, sit: true } },
    extras: gymExtras,
    twoYaw: PI + 0.25,
    bounds: [[-7.4, 7.4], [0.3, 6.2], [-8.8, 6.8]],
    cams: {
      // the whole gym from the back, high: rows of kids, the stage, the principal at the mic, the BIG speakers, the banner
      wide_class: { pos: [0, 4.6, 6.4], look: [0, 1.5, -6.5], fov: 56 },
      // the principal at the mic, from the front rows
      stage: { pos: [0.55, 2.5, -4.5], look: [0, 2.42, -6.9], fov: 36 },
      // from the stage back over the frozen rows of kids
      crowd: { pos: [1.2, 2.7, -6.1], look: [0, 1.1, -1.0], fov: 46 },
      // low from the side: a speaker stack big in the foreground, the stage and the rows behind
      speakers: { pos: [-6.4, 1.6, -2.2], look: [-3.2, 1.75, -6.2], fov: 50 },
    },
    blockers: [],
  },
};

// ------------------------------------------------------------------ vector helpers
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const fwd = (yaw: number): V3 => [Math.sin(yaw), 0, Math.cos(yaw)];
/** a kid's own left (+x when facing +z) */
export const leftOf = (yaw: number): V3 => [Math.cos(yaw), 0, -Math.sin(yaw)];

export type CamS = { pos: V3; look: V3; fov: number; roll?: number };
/** world point -> output pixels (x right, y down) and the px per metre at that depth; null behind the camera */
export const project = (cam: CamS, p: V3) => {
  const f = norm(sub(cam.look, cam.pos));
  let r = norm(cross(f, [0, 1, 0]));
  let u = cross(r, f);
  const rl = ((cam.roll ?? 0) * Math.PI) / 180;
  if (rl) { const c = Math.cos(rl), s = Math.sin(rl); const r2 = add(mul(r, c), mul(u, -s)), u2 = add(mul(u, c), mul(r, s)); r = r2; u = u2; }
  const d = sub(p, cam.pos), z = dot(d, f);
  if (z <= 0.02) return null;
  const th = Math.tan((cam.fov * Math.PI) / 360);
  const ny = dot(d, u) / (z * th), nx = dot(d, r) / (z * th * (W / H));
  return { x: W / 2 + (nx * W) / 2, y: H / 2 - (ny * H) / 2, k: H / 2 / (z * th), z };
};
