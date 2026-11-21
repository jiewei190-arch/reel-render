// LawGallery: one shot per kit piece (every pose, every face, every role, every set, every prop, every story device),
// compiled by the same compiler as a real recipe. GALLERY_STILLS lists the frame to grab for each piece
// (node tools/law_stills.mjs gallery renders them all).
import { FIG_FACES, FIG_POSES } from "./cast";
import type { CastSpec, FigFace, FigPose } from "./cast";
import type { LawKit } from "./objects";
import type { LawRecipe, LawShot } from "./types";

const shots: LawShot[] = [];
export const GALLERY_STILLS: { name: string; frame: number }[] = [];
let t = 0;
const add = (name: string, len: number, sh: Omit<LawShot, "at">, still = 0.8) => {
  shots.push({ at: t, caption: "off", in: "cut", ...sh });
  GALLERY_STILLS.push({ name, frame: Math.round((t + len * still) * 30) });
  t += len;
};
const cast: Record<string, CastSpec> = {
  judge: { role: "judge", skin: "#c98f6a", hairStyle: "bun", hair: "#5a4a40", glasses: true, plate: "THE COURT" },
  plaintiff: { role: "plaintiff", skin: "#7a5038", hairStyle: "bald", hair: "#1a1410", suit: "#3a4a6e", tie: "#8a2a2a", plate: "PLAINTIFF" },
  defendant: { role: "defendant", skin: "#e0b48e", hairStyle: "short", hair: "#141414", suit: "#6e6a62", apron: "#2b4f7a", plate: "DEFENDANT" },
  lawyer: { role: "lawyer", skin: "#f0c8a8", hairStyle: "long", hair: "#7a4a24", suit: "#22242c", tie: "#B9862A" },
  witness: { role: "witness", skin: "#b07850", hairStyle: "curly", hair: "#2a1a10", beard: true },
  bailiff: { role: "bailiff", skin: "#d8a888", hairStyle: "short", build: "broad" },
  juror: { role: "juror" },
};
for (const p of FIG_POSES as FigPose[]) {
  const who = p === "gavel" ? "judge" : "plaintiff";
  add(`pose-${p}`, 1.6, { set: "evidence", cam: { preset: "medium", target: who, dist: 2.9, h: 0.15, face: 0.4 }, actors: [{ id: who, pose: p, at: "front", pointAt: [1.4, 1.6, 2.5] }], actions: p === "gavel" ? [{ do: "gavel", at: t + 0.9 }] : [] }, p === "gavel" ? 0.5 : 0.75);
}
for (const f of FIG_FACES as FigFace[]) add(`face-${f}`, 1.0, { set: "evidence", cam: { preset: "closeUp", target: "defendant.face", dist: 0.9 }, actors: [{ id: "defendant", pose: "idle", face: f, at: "front" }] }, 0.7);
const roles = Object.keys(cast);
add("cast-lineup", 2.0, { set: "courtroom", cam: { preset: "medium", target: [0, 1.2, 2.6], dist: 4.4, h: 0.1, face: 0.45 }, actors: roles.map((r, k) => ({ id: r, pose: "idle" as FigPose, at: [-2.4 + k * 0.8, 0, 2.6] as [number, number, number], look: 0 })) }, 0.6);
add("set-courtroom-wide", 2.0, { set: "courtroom", cam: { preset: "wide", target: [0, 1.4, -2.2], dist: 8.8, h: 1.2 }, actors: [{ id: "judge", pose: "idle", at: "bench", sit: true, look: 0 }, { id: "plaintiff", pose: "idle", at: "plaintiff", look: 180 }, { id: "defendant", pose: "idle", at: "defendant", look: 180 }] }, 0.6);
add("set-courtroom-bench", 2.0, { set: "courtroom", cam: { preset: "pushIn", target: "judge.face", dist: 2.6, h: -0.2 }, actors: [{ id: "judge", pose: "gavel", at: "bench", sit: true, look: 0 }], actions: [{ do: "gavel", at: t + 1.2 }], props: [{ id: "np", kit: "nameplate", of: "judge", at: "benchTop:-0.5,0,0.2" }] }, 0.45);
add("set-courtroom-witness", 2.0, { set: "courtroom", cam: { preset: "orbit", target: "witness.face", dist: 2.2, h: 0.1, az: -20 }, actors: [{ id: "witness", pose: "talk", at: "witness", sit: true, look: 0 }] }, 0.6);
add("set-evidence", 2.0, { set: "evidence", cam: { preset: "crane", target: "table", dist: 3.0, h: 0.8 }, props: [{ id: "ev", kit: "pants", at: "table", yaw: 20 }] }, 0.6);
add("set-casefile", 2.0, { set: "casefile", cam: { preset: "topDown", target: "desk", dist: 0.6, h: 1.7 }, props: [{ id: "f", kit: "folder", text: "PEARSON v. CHUNG", at: "desk", yaw: -8 }] }, 0.6);
add("set-headlines", 2.0, { set: "headlines", cam: { preset: "dolly", target: "wall", dist: 2.8, h: 0.0 }, props: [{ id: "n", kit: "newspaper", text: "JUDGE SUES OVER PANTS", at: "wall:0,-0.38,0" }] }, 0.6);
add("set-steps", 2.0, { set: "steps", cam: { preset: "wide", target: [0, 2.2, 3], dist: 9, h: 0.6 }, actors: [{ id: "lawyer", pose: "talk", at: "steps", look: 0 }] }, 0.6);
for (const k of ["gavel", "paper", "folder", "photo", "pants", "sign", "money", "newspaper", "nameplate", "box"] as LawKit[]) {
  const stand = k === "sign" || k === "newspaper";
  add(`kit-${k}`, 1.4, { set: "evidence", cam: { preset: "orbit", target: k === "pants" ? "table" : k, dist: stand ? 2.4 : k === "pants" ? 2.0 : 1.2, h: stand ? 0.1 : 0.7, sweep: 30 }, props: [{ id: k, kit: k, at: "table", text: k === "sign" ? "SATISFACTION\nGUARANTEED" : undefined, photo: "pants" }], actions: k === "gavel" ? [{ do: "gavel", at: t + 0.9 }] : [] }, k === "gavel" ? 0.55 : 0.7);
}
add("device-casecard", 1.8, { set: "casefile", cam: { preset: "topDown", target: "desk" }, actions: [{ do: "caseCard", at: t + 0.1, title: "PEARSON v. CHUNG", year: "2005-2007", place: "Washington, D.C." }] }, 0.8);
add("device-exhibit", 1.8, { set: "evidence", cam: { preset: "pushIn", target: "table", dist: 2.4, h: 0.8 }, props: [{ id: "pants", kit: "pants", at: "table", motion: "dropIn", hit: t + 0.4 }], actions: [{ do: "exhibit", at: t + 0.5, text: "THE PANTS", on: "pants" }] }, 0.8);
add("device-verdict", 1.8, { set: "courtroom", cam: { preset: "slamZoom", target: "gavel", dist: 1.4, h: 0.3, hit: t + 0.3 }, props: [{ id: "gavel", kit: "gavel", at: "gavel" }], actions: [{ do: "gavel", at: t + 0.5 }, { do: "verdict", at: t + 0.5, text: "DENIED", sub: "$0 AWARDED" }] }, 0.8);
add("device-counter", 1.8, { set: "headlines", cam: { preset: "dolly", target: "wall", dist: 3.0 }, actions: [{ do: "counter", at: t + 0.1, title: "DAMAGES SOUGHT", prefix: "$", from: 0, to: 54000000, dur: 1.2, pos: "center" }] }, 0.9);

export const GALLERY_RECIPE: LawRecipe = { kit: "law3d", slug: "law-gallery", hook: { text: "LAW *GALLERY*", until: -1 }, cast, shots, duration: t, captions: "off" };
