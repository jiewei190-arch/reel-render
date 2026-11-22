// CyberGallery: one shot per kit piece (each set, each figure pose, the vault whole / exploded / labelled, routes, the
// phishing email, the evidence string, BOLT re-lit, every story device), compiled by the same compiler as a real
// recipe. GALLERY_STILLS lists the frame to grab for each piece (node tools/cyber_stills.mjs gallery).
import { FIGURE_POSES } from "./figure";
import type { FigurePose } from "./figure";
import type { CaseFile, Checklist, Countdown, MoneyCounter, Alert, CyberRecipe, CyberShot } from "./types";

const shots: CyberShot[] = [];
export const GALLERY_STILLS: { name: string; frame: number }[] = [];
const caseFile: CaseFile[] = [], money: MoneyCounter[] = [], countdown: Countdown[] = [], alerts: Alert[] = [];
let checklist: Checklist | undefined;
let t = 0;
const add = (name: string, len: number, sh: Omit<CyberShot, "at">, still = 0.8) => {
  shots.push({ at: t, caption: "off", in: "cut", ...sh });
  GALLERY_STILLS.push({ name, frame: Math.round((t + len * still) * 30) });
  t += len;
};
const hacker = (pose: FigurePose) => ({ id: "hk", kit: "figure" as const, at: "seat", yaw: 180, pose });
for (const p of FIGURE_POSES as FigurePose[]) add(`figure-${p}`, 1.6, { set: "room", cam: { preset: "medium", target: "hk.head", dist: 2.4, h: 0.1, az: 145, face: 0.4 }, props: [{ ...hacker(p), at: p === "stand" ? "seat:0,0,0.3" : "seat" }] }, 0.85);
add("set-room", 2.0, { set: "room", cam: { preset: "drift", target: "screens", dist: 3.2, h: 0.5, az: 160 }, props: [hacker("type")] });
add("set-vault", 2.0, { set: "vault", cam: { preset: "orbit", target: "vt", dist: 6.8, h: 1.6, az: 20, sweep: 24 }, props: [{ id: "vt", obj: "vault", at: "centre" }] });
add("vault-exploded", 2.4, { set: "vault", cam: { preset: "explodeOrbit", target: "vx", dist: 7.2, h: 2.0, az: 20, sweep: 26 }, props: [{ id: "vx", obj: "vault", at: "centre" }], actions: [{ do: "explode", on: "vx", at: t + 0.2, dur: 1.0 }] }, 0.9);
add("vault-labelled", 2.6, { set: "vault", cam: { preset: "medium", target: "vl", dist: 6.5, h: 1.3, az: 15 }, props: [{ id: "vl", obj: "vault", at: "centre" }], actions: [{ do: "explode", on: "vl", at: t + 0.1, dur: 0.7, amount: 0.6 }, { do: "label", on: "vl.cash4", at: t + 0.9 }, { do: "label", on: "vl.ring", at: t + 1.4, tone: "red", text: "VAULT DOOR" }] }, 0.9);
add("set-netmap", 2.0, { set: "netmap", cam: { preset: "crane", target: "atlantic", dist: 14, h: 6, az: 0 } }, 0.6);
add("netmap-routes", 2.6, { set: "netmap", cam: { preset: "orbit", target: "europe", dist: 7, h: 4.5, az: 10, sweep: 20 }, props: [{ id: "rt", kit: "route", at: "latvia", from: "latvia", to: ["cyprus", "slovakia", "hungary", "hongkong"], hit: t + 0.2 }] }, 0.9);
add("set-inbox", 2.0, { set: "inbox", cam: { preset: "drift", target: "wall", dist: 4.6, h: 0.2, az: 8 } });
add("inbox-phish", 2.4, { set: "inbox", cam: { preset: "pushIn", target: "ph", dist: 2.0, h: 0.1, az: -10 }, props: [{ id: "ph", kit: "email", at: "phish", text: "URGENT: new bank details", phish: true, motion: "slideOut", hit: t + 0.4 }] }, 0.85);
add("set-evidence", 2.4, { set: "evidence", cam: { preset: "drift", target: "board", dist: 4.4, h: 0.1, az: 0 }, props: [{ id: "st", kit: "string", at: "centre", from: "note", to: ["cyprus"], hit: t + 0.4 }] }, 0.85);
add("set-servers", 2.4, { set: "servers", cam: { preset: "flyThrough", target: "mid:0,1.3,0", dist: 9, h: 0.2, az: 0, endDist: 3 } }, 0.7);
add("bolt-relit", 2.0, { set: "inbox", cam: { preset: "medium", target: "bolt", dist: 2.4, h: 0.2, az: 15 }, actors: [{ id: "bolt", pose: "point", face: "worried", at: "centre:0.6,0,0", pointAt: "phish" }] }, 0.7);
const dev = (name: string, len: number, f: (t0: number) => void) => { f(t + 0.15); add(name, len, { set: "netmap", cam: { preset: "drift", target: "europe", dist: 9, h: 5, az: 0 } }, 0.85); };
dev("device-casefile", 2.2, (t0) => caseFile.push({ at: t0, until: t0 + 2.0, name: "E. Rimasauskas", year: "2013-2015", amount: "$121M", status: "CAUGHT" }));
dev("device-money", 2.2, (t0) => money.push({ at: t0, until: t0 + 2.0, label: "WIRED OUT", from: 0, to: 121000000 }));
dev("device-countdown", 1.8, (t0) => countdown.push({ at: t0, until: t0 + 1.6, label: "PAY WITHIN", from: 86400, rate: 300 }));
dev("device-alert", 1.6, (t0) => alerts.push({ at: t0, text: "ALERT" }));
dev("device-checklist", 3.2, (t0) => { checklist = { at: t0, until: t0 + 3.0, items: ["NEW BANK DETAILS", "URGENT DEADLINE", "CALL A KNOWN NUMBER"] }; });
add("glitch-transition", 1.2, { set: "servers", in: "glitch", cam: { preset: "medium", target: "mid:0,1.3,0", dist: 4, h: 0.2 } }, 0.05);

export const GALLERY_RECIPE: CyberRecipe = { kit: "cyber3d", slug: "cyber-gallery", hook: { text: "CYBER *GALLERY*", until: -1 }, cast: { bolt: "BOLT" }, shots, duration: t, captions: "off", talk: "none", caseFile, money, countdown, alerts, checklist };
