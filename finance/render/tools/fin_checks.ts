// Numeric framing + lens checks for every finance Short (the pattern of tools/framing_check.ts, generalised).
// For every shot, at 5 sample times: the shot's camera, every actor's body points (feet, hips, shoulders, head corners)
// projected to the frame. Reports and judges:
//   CUT     an actor the shot's scene text names is not fully inside the frame (margin < 2 % = FAIL; head cut = FAIL)
//   FACE    in a face shot (camera note says close/medium on <name>) that actor's face turns away (dot < 0.3 = FAIL)
//   LENS    the lens inside an actor (cylinder) = FAIL
//   BLOCK   another actor's body crosses the lens -> subject line = WARN
//   CAPTION a named actor's face inside the caption band (y 0.6-0.76) in a face shot = WARN (text over the face)
//   OVERLAP two actors closer than their body widths = FAIL
// Run: bash tools/fin_checks.sh  (esbuild bundle -> node). Exit 1 on any FAIL.
import * as THREE from "three";
import { SHORTS } from "../src/shorts";
import { actorsAt, camOfShot } from "../src/fin/engine";
import type { ShortDef } from "../src/fin/engine";
import { SPEC, U, L } from "../src/blocky/motion";

const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 600);
const setCam = (c: ReturnType<typeof camOfShot>) => {
  camera.fov = c.fov;
  camera.position.set(...c.pos);
  const dir = new THREE.Vector3(...c.look).sub(camera.position).normalize();
  camera.up.copy(new THREE.Vector3(0, 1, 0).applyAxisAngle(dir, ((c.roll ?? 0) * Math.PI) / 180));
  camera.lookAt(...c.look);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
};
const proj = (p: THREE.Vector3) => {
  const v = p.clone().project(camera);
  const cs = p.clone().applyMatrix4(camera.matrixWorldInverse);
  return { fx: (v.x + 1) / 2, fy: (1 - v.y) / 2, behind: cs.z > 0 };
};

let fails = 0, warns = 0;
const lines: string[] = [];
const check = (def: ShortDef) => {
  lines.push(`== ${def.slug}`);
  for (const shot of def.plan.SHOTS) {
    const lens = def.lenses[shot.id];
    const need = lens.fit?.keys ?? [];
    const fs = lens.fit?.bust && need.length === 1 ? need[0] : null;
    const out: string[] = [];
    let worst = 9;
    for (const u of [0.02, 0.25, 0.5, 0.75, 0.98]) {
      const t = shot.t + (shot.end - shot.t) * u;
      const cam = camOfShot(def, shot, t);
      setCam(cam);
      const actors = actorsAt(def, t, shot.id);
      const camP = new THREE.Vector3(...cam.pos);
      for (const a of actors) {
        const p = a.pose;
        const s = a.s;
        const hipY = p.y;
        const headC = hipY + (SPEC.torso.h + SPEC.head.gap + SPEC.head.h / 2) * U * s;
        const r = 1.1 * U * s;
        // LENS inside the actor cylinder
        const dx = camP.x - p.x, dz = camP.z - p.z;
        if (Math.hypot(dx, dz) < r && camP.y > p.y - L * s - 0.05 && camP.y < headC + 0.35 * U * s) out.push(`LENS inside ${a.key}`);
        if (!need.includes(a.key)) continue;
        const pts: THREE.Vector3[] = [];
        const fwd = new THREE.Vector3(Math.sin(p.yaw), 0, Math.cos(p.yaw));
        const side = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
        for (const y of [p.y - L * s, hipY, headC - 0.3 * U * s, headC + 0.75 * U * s]) for (const k of [-1, 1]) pts.push(new THREE.Vector3(p.x, y, p.z).addScaledVector(side, k * r * 0.85));
        const pr = pts.map(proj);
        const m = Math.min(...pr.map((q) => (q.behind ? -1 : Math.min(q.fx, 1 - q.fx, q.fy, 1 - q.fy))));
        const head = [proj(new THREE.Vector3(p.x, headC + 0.6 * U * s, p.z)), proj(new THREE.Vector3(p.x, headC - 0.45 * U * s, p.z))];
        const hm = Math.min(...head.map((q) => (q.behind ? -1 : Math.min(q.fx, 1 - q.fx, q.fy, 1 - q.fy))));
        const isFace = fs === a.key;
        // a face shot only needs the head and shoulders in frame
        const mm = isFace ? hm : m;
        worst = Math.min(worst, mm);
        const top = Math.min(...head.map((q) => q.fy));
        if (hm >= 0 && top < 0.2) out.push(`HUD over ${a.key}'s head (top ${top.toFixed(2)})`);
        if (hm < 0) out.push(`CUT head of ${a.key} (${hm.toFixed(2)})`);
        else if (mm < 0.02) out.push(`CUT ${a.key} margin ${mm.toFixed(3)}`);
        if (isFace) {
          const toCam = camP.clone().sub(new THREE.Vector3(p.x, headC, p.z)).setY(0).normalize();
          const headFwd = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), p.headYaw);
          const dot = headFwd.dot(toCam);
          if (dot < 0.3) out.push(`FACE ${a.key} turned away (dot ${dot.toFixed(2)})`);
          const fy = proj(new THREE.Vector3(p.x, headC, p.z)).fy;
          if (fy > 0.6 && fy < 0.76) out.push(`CAPTION over ${a.key}'s face (y ${fy.toFixed(2)})`);
        }
      }
      // overlaps between actors
      for (let i = 0; i < actors.length; i++)
        for (let j = i + 1; j < actors.length; j++) {
          const A = actors[i].pose, B = actors[j].pose;
          const d = Math.hypot(A.x - B.x, A.z - B.z);
          const lim = 0.9 * U * (actors[i].s + actors[j].s);
          if (d < lim && Math.abs(A.y - B.y) < 1.0) out.push(`OVERLAP ${actors[i].key}/${actors[j].key} ${d.toFixed(2)} m`);
        }
      // something between the lens and the face-shot subject
      if (fs) {
        const sub = actors.find((a) => a.key === fs);
        if (sub) {
          const tgt = new THREE.Vector3(sub.pose.x, sub.pose.y + 0.5, sub.pose.z);
          for (const a of actors) {
            if (a.key === fs) continue;
            const c = new THREE.Vector3(a.pose.x, a.pose.y + 0.4, a.pose.z);
            const seg = tgt.clone().sub(camP);
            const k = Math.max(0, Math.min(1, c.clone().sub(camP).dot(seg) / seg.lengthSq()));
            const near = camP.clone().addScaledVector(seg, k);
            if (k > 0.05 && k < 0.95 && Math.hypot(near.x - c.x, near.z - c.z) < 0.9 * U * a.s && Math.abs(near.y - c.y) < 0.7) out.push(`BLOCK ${a.key} between lens and ${fs}`);
          }
        }
      }
    }
    const uniq = [...new Set(out)];
    for (const x of uniq) {
      if (/^(CUT|FACE|LENS|OVERLAP)/.test(x)) fails++;
      else warns++;
    }
    lines.push(`${shot.id} ${shot.t.toFixed(2)}s need=[${need.join(",")}] face=${fs ?? "-"} min=${worst === 9 ? "-" : worst.toFixed(3)} ${uniq.length ? (uniq.some((x) => /^(CUT|FACE|LENS|OVERLAP)/.test(x)) ? "FAIL " : "WARN ") + uniq.join("; ") : "ok"}`);
  }
};
// MOTION: sampled at 120 Hz inside each shot (the cut hides jumps between shots): arm/head angular speed <= 4 rad/s
// (else 4 blur samples ghost), body speed <= 3 m/s (no teleports), soles not below the floor by > 2 cm
const motion = (def: ShortDef) => {
  const out: string[] = [];
  for (const shot of def.plan.SHOTS) {
    let prev: ReturnType<typeof actorsAt> | null = null;
    const bad = new Map<string, number>();
    for (let t = shot.t; t < shot.end - 1e-6; t += 1 / 120) {
      const cur = actorsAt(def, t, shot.id);
      if (prev) for (const a of cur) {
        const b = prev.find((x) => x.key === a.key);
        if (!b) continue;
        for (const j of ["armL", "armR", "outL", "outR", "headYaw", "headPitch"] as const) {
          const w = Math.abs(a.pose[j] - b.pose[j]) * 120;
          if (w > 4) bad.set(`${a.key}.${j}`, Math.max(bad.get(`${a.key}.${j}`) ?? 0, w));
        }
        const v = Math.hypot(a.pose.x - b.pose.x, a.pose.z - b.pose.z) * 120;
        if (v > 3) bad.set(`${a.key}.speed`, Math.max(bad.get(`${a.key}.speed`) ?? 0, v));
      }
      for (const a of cur) if (a.pose.y - L * a.s * Math.cos(Math.max(Math.abs(a.pose.legL), Math.abs(a.pose.legR))) < -0.02 && a.pose.pitch < 0.5) bad.set(`${a.key}.belowFloor`, 1);
      prev = cur;
    }
    if (bad.size) out.push(`${shot.id} ` + [...bad].map(([k, v]) => `${k} ${v.toFixed(1)}`).join(", "));
  }
  return out;
};
for (const d of SHORTS) check(d);
lines.push("\n== MOTION (arm/head <= 4 rad/s, body <= 3 m/s, soles on the floor)");
for (const d of SHORTS) {
  const m = motion(d);
  lines.push(`${d.slug}: ${m.length ? "WARN " + m.join(" | ") : "ok"}`);
  warns += m.length;
}
console.log(lines.join("\n"));
console.log(`\n${fails} FAIL, ${warns} WARN`);
process.exit(fails ? 1 : 0);
