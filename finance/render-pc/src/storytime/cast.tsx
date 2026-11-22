// storytime cast, CLAYMATION: plasticine kids (lumpy rounded torso, arms with chunky ball hands, short legs, a BIG pebble
// head) whose faces are separate clay pieces stuck on the front of the head: white eye discs with dark pupils, skin
// lids, thick sausage brows, a pressed-in mouth (dark red) with a teeth strip and a tongue. The pieces are rebuilt from the
// compiled face vector (face.ts), whose mouth opening is QUANTISED (replacement animation: a set of mouths, no morph).
// Leads and background classmates share the build; classmates are scaled down.
import React from "react";
import * as THREE from "three";
import { geoOf } from "../blocky/mat";
import { clayMat, lumpBall, lumpBox, lumpCapsule, lumpCone } from "./clay";
import type { FigState } from "./compile";
import type { FaceP } from "./face";
import { K, hipY } from "./layout";

// ------------------------------------------------------------------ the head's front surface (a rounded box, radius HR)
export const HR = 0.14;
const FW = K.headW * 0.96, FH = K.headH * 0.96; // face-coordinate span (u, v in 0..1 -> metres)
/** z of the head's front surface at local (x, y) */
const zS = (x: number, y: number) => {
  const dx = Math.max(0, Math.abs(x) - (K.headW / 2 - HR)), dy = Math.max(0, Math.abs(y) - (K.headH / 2 - HR));
  return K.headD / 2 - HR + Math.sqrt(Math.max(0, HR * HR - dx * dx - dy * dy));
};
const fx = (u: number) => (u - 0.5) * FW, fy = (v: number) => (0.5 - v) * FH;
const q = (v: number, step: number) => Math.round(v / step) * step;

const ink = () => clayMat("#24161c", { bump: 0.4 });
const white = () => clayMat("#fbf8f1", { bump: 0.5, sat: false });
const mouthMat = () => clayMat("#5a1622", { bump: 0.3 });
const tongueMat = () => clayMat("#e2667a", { bump: 0.4 });
const UNIT = () => lumpBall(1, 1, 1, 1, 0.04);

/** keep the part of a polygon above (keepAbove) or below a horizontal line */
const clipY = (P: [number, number][], y0: number, keepAbove: boolean): [number, number][] => {
  const inside = (p: [number, number]) => (keepAbove ? p[1] >= y0 : p[1] <= y0);
  const out: [number, number][] = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    if (inside(a)) out.push(a);
    if (inside(a) !== inside(b)) { const k = (y0 - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * k, y0]); }
  }
  return out;
};
const quad = (a: [number, number], c: [number, number], b: [number, number], n = 10) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]] as [number, number]; });
/** an extruded clay piece from a polygon (metres, head-local x/y), bent onto the head surface */
const pieceGeo = (key: string, P: [number, number][], depth: number, lift: number) => geoOf(key, () => {
  const sh = new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.6, bevelSize: Math.min(0.006, depth * 0.7), bevelSegments: 2, curveSegments: 6 });
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + zS(p.getX(i), p.getY(i)) + lift - depth);
  g.computeVertexNormals();
  return g;
});

/** the mouth outline (head-local metres) for the quantised face; closed = a lip line */
const mouthPoly = (f: FaceP) => {
  const my = 0.75, hw = f.mouthW * 1.12;
  const yl = my - f.curve * 0.055 - (f.smirk < 0 ? -f.smirk * 0.05 : 0), yr = my - f.curve * 0.055 - (f.smirk > 0 ? f.smirk * 0.06 : 0);
  const L: [number, number] = [fx(0.5 - hw), fy(yl)], R: [number, number] = [fx(0.5 + hw), fy(yr)];
  if (f.open < 0.05) return { closed: true as const, L, R, C: [0, fy(my + f.curve * 0.05)] as [number, number] };
  const cTop = my - f.open * 0.045 + f.curve * 0.012 - Math.max(0, -f.curve) * 0.03;
  const cBot = Math.max(yl, yr) + 0.03 + f.open * 0.3 + Math.max(0, f.curve) * 0.05;
  const top = quad(L, [0, fy(cTop)], R), bot = quad(R, [0, fy(cBot)], L);
  return { closed: false as const, P: [...top, ...bot.slice(1, -1)] as [number, number][], yTop: fy(Math.min(yl, yr, cTop)), yBot: fy(cBot) };
};

const Mouth: React.FC<{ f: FaceP }> = ({ f }) => {
  const m = mouthPoly(f);
  const key = `${q(f.mouthW, 0.01)}|${q(f.curve, 0.05)}|${q(f.smirk, 0.05)}|${q(f.open, 0.01)}|${q(f.teeth, 0.5)}`;
  if (m.closed) {
    const geo = geoOf(`clayLip${key}`, () => {
      const pts = quad(m.L, m.C, m.R, 12).map(([x, y]) => new THREE.Vector3(x, y, zS(x, y) + 0.004));
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.011, 6, false);
    });
    return <mesh geometry={geo} material={ink()} />;
  }
  const P = m.P;
  const teeth = f.teeth > 0.05 ? clipY(P, m.yTop - (m.yTop - m.yBot) * 0.22, true) : null;
  const tongue = clipY(P, m.yBot + (m.yTop - m.yBot) * 0.42, false).map(([x, y]) => [x * 0.78, y + 0.004] as [number, number]);
  return (
    <group>
      <mesh geometry={pieceGeo(`clayMouth${key}`, P, 0.008, 0.002)} material={mouthMat()} />
      {tongue.length > 2 ? <mesh geometry={pieceGeo(`clayTongue${key}`, tongue, 0.007, 0.007)} material={tongueMat()} /> : null}
      {teeth && teeth.length > 2 ? <mesh geometry={pieceGeo(`clayTeeth${key}`, teeth.map(([x, y]) => [x * 0.92, y] as [number, number]), 0.008, 0.008)} material={white()} /> : null}
    </group>
  );
};

/** the clay face pieces, head-local (the head's centre is the origin, the face looks down +z) */
const Face: React.FC<{ f: FaceP; skin: string; brow: string; eye?: string; freckles?: boolean; simple?: boolean }> = ({ f, skin, brow, eye, freckles, simple }) => {
  const eyeY = 0.42, rx = 0.135 * f.eyeS, ry = 0.16 * f.eyeS;
  const skinM = clayMat(skin);
  const parts: React.ReactNode[] = [];
  for (const side of [-1, 1] as const) {
    const cu = 0.5 + side * 0.2, x = fx(cu), y = fy(eyeY), z = zS(x, y);
    const RX = rx * FW, RY = ry * FH;
    if (f.arc > 0.5) {
      parts.push(<mesh key={`arc${side}`} geometry={geoOf("clayArc", () => new THREE.TorusGeometry(1, 0.16, 6, 14, Math.PI))} material={ink()} position={[x, y - RY * 0.25, z + 0.006]} scale={[RX * 0.85, RY * 0.6, 0.06]} />);
      continue;
    }
    parts.push(<mesh key={`ew${side}`} geometry={UNIT()} material={white()} position={[x, y, z + 0.004]} scale={[RX, RY, 0.022]} />);
    const pr = 0.072 * f.pupS * FW * (simple ? 1.15 : 1);
    const px = x + f.px * RX * 0.5, py = y + f.py * RY * 0.45 - 0.004;
    parts.push(<mesh key={`pp${side}`} geometry={UNIT()} material={clayMat(eye ?? "#3b2a1e", { bump: 0.3 })} position={[px, py, z + 0.022]} scale={[pr, pr, 0.006]} />);
    if (!simple) {
      parts.push(<mesh key={`pc${side}`} geometry={UNIT()} material={ink()} position={[px, py, z + 0.026]} scale={[pr * 0.55, pr * 0.55, 0.005]} />);
      parts.push(<mesh key={`ph${side}`} geometry={UNIT()} material={white()} position={[px + pr * 0.35, py + pr * 0.4, z + 0.029]} scale={[pr * 0.24, pr * 0.24, 0.004]} />);
    }
    // lids: thin skin-clay pieces cut to the eye's outline above (upper) / below (lower) the lid line, pressed over it
    const lid = Math.min(1, f.lid + (f.browAsym * side < 0 ? Math.abs(f.browAsym) * 0.12 : 0));
    const ell = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [x + Math.cos(a) * RX * 1.06, y + Math.sin(a) * RY * 1.06] as [number, number]; });
    if (lid > 0.06) {
      const yl = y + RY - 2 * RY * Math.min(1, lid);
      const P = clipY(ell, yl, true);
      if (P.length > 2) parts.push(<mesh key={`ul${side}`} geometry={pieceGeo(`clayLidU${side}|${q(RX, 0.002)}|${q(RY, 0.002)}|${q(yl - y, 0.004)}`, P, 0.007, 0.038)} material={skinM} />);
    }
    if (f.lower > 0.05) {
      const yl = y - RY + 2 * RY * f.lower * 0.6;
      const P = clipY(ell, yl, false);
      if (P.length > 2) parts.push(<mesh key={`ll${side}`} geometry={pieceGeo(`clayLidL${side}|${q(RX, 0.002)}|${q(RY, 0.002)}|${q(yl - y, 0.004)}`, P, 0.007, 0.038)} material={skinM} />);
    }
  }
  for (const side of [-1, 1] as const) {
    const lift = f.browY * 0.06 + (f.browAsym * side > 0 ? Math.abs(f.browAsym) * 0.07 : f.browAsym * side < 0 ? -Math.abs(f.browAsym) * 0.02 : 0);
    const x = fx(0.5 + side * 0.205), y = fy(0.2 - lift - (f.arc > 0.5 ? 0.02 : 0));
    const ang = side * f.browA * 0.45;
    const r = (simple ? 0.05 : 0.08) * FH / 2, len = 0.24 * FW - 2 * r;
    parts.push(<mesh key={`br${side}`} geometry={lumpCapsule(r, len)} material={clayMat(brow, { bump: 0.5 })} position={[x, y, zS(x, y) + r * 0.7]} rotation={[0, 0, Math.PI / 2 + ang]} scale={[1, 1, 0.75]} />);
  }
  if (freckles) for (const [u, v] of [[0.2, 0.56], [0.25, 0.6], [0.29, 0.555], [0.71, 0.555], [0.75, 0.6], [0.8, 0.56]]) { const x = fx(u), y = fy(v); parts.push(<mesh key={`fr${u}${v}`} geometry={UNIT()} material={clayMat("#b0623a", { bump: 0.2 })} position={[x, y, zS(x, y) + 0.001]} scale={[0.006, 0.006, 0.004]} />); }
  if (f.blush > 0.3) for (const u of [0.22, 0.78]) { const x = fx(u), y = fy(0.6); parts.push(<mesh key={`bl${u}`} geometry={UNIT()} material={clayMat("#ff7f91", { bump: 0.3 })} position={[x, y, zS(x, y) - 0.002]} scale={[0.04, 0.022, 0.008]} />); }
  return <group>{parts}<Mouth f={f} /></group>;
};

const Hair: React.FC<{ st: FigState }> = ({ st }) => {
  const sp = st.spec, m = clayMat(sp.hair), hw = K.headW, hh = K.headH, hd = K.headD;
  const top = hh / 2;
  switch (sp.hairStyle) {
    case "flattop":
      return (
        <group>
          <mesh geometry={lumpBox(hw + 0.05, 0.2, hd + 0.05, 0.08)} material={m} position={[0, top + 0.04, -0.008]} />
          <mesh geometry={lumpBox(hw + 0.05, 0.1, 0.12, 0.045)} material={m} position={[0, top - 0.03, hd / 2 - 0.035]} />
          <mesh geometry={lumpBox(0.07, 0.24, hd + 0.02, 0.03)} material={m} position={[hw / 2 + 0.008, top - 0.07, -0.03]} />
          <mesh geometry={lumpBox(0.07, 0.24, hd + 0.02, 0.03)} material={m} position={[-hw / 2 - 0.008, top - 0.07, -0.03]} />
          <mesh geometry={lumpBox(hw + 0.03, 0.3, 0.07, 0.03)} material={m} position={[0, top - 0.1, -hd / 2 - 0.012]} />
        </group>
      );
    case "spiky": {
      const spikes: [number, number, number, number, number][] = [[-0.16, 0.03, 0.13, 0.45, -0.3], [-0.05, 0.08, 0.15, 0.25, -0.15], [0.07, 0.07, 0.14, -0.15, -0.2], [0.17, 0.02, 0.12, -0.4, -0.3], [-0.11, 0.06, -0.02, 0.3, 0.1], [0.02, 0.1, 0.0, 0, 0.1], [0.14, 0.06, -0.03, -0.3, 0.15], [-0.08, 0.04, -0.15, 0.25, 0.35], [0.08, 0.04, -0.15, -0.25, 0.35]];
      return (
        <group>
          <mesh geometry={lumpBox(hw + 0.045, 0.13, hd + 0.045, 0.06)} material={m} position={[0, top - 0.005, 0]} />
          {spikes.map(([x, y, z, rz, rx], i) => <mesh key={i} geometry={lumpCone(0.08, 0.22)} material={m} position={[x, top + 0.09 + y, z]} rotation={[rx, 0, rz]} />)}
          <mesh geometry={lumpBox(0.06, 0.2, hd, 0.028)} material={m} position={[hw / 2 + 0.008, top - 0.07, -0.02]} />
          <mesh geometry={lumpBox(0.06, 0.2, hd, 0.028)} material={m} position={[-hw / 2 - 0.008, top - 0.07, -0.02]} />
        </group>
      );
    }
    case "puff":
      return <mesh geometry={lumpBall(0.29, 1, 0.62, 0.95)} material={m} position={[0, top + 0.06, -0.05]} />;
    case "bob":
      return (
        <group>
          <mesh geometry={lumpBox(hw + 0.07, 0.14, hd + 0.07, 0.06)} material={m} position={[0, top + 0.02, 0]} />
          <mesh geometry={lumpBox(0.08, 0.38, hd + 0.05, 0.035)} material={m} position={[hw / 2 + 0.025, top - 0.14, -0.01]} />
          <mesh geometry={lumpBox(0.08, 0.38, hd + 0.05, 0.035)} material={m} position={[-hw / 2 - 0.025, top - 0.14, -0.01]} />
          <mesh geometry={lumpBox(hw + 0.07, 0.4, 0.08, 0.035)} material={m} position={[0, top - 0.14, -hd / 2 - 0.025]} />
        </group>
      );
    default:
      return <mesh geometry={lumpBox(hw + 0.03, 0.09, hd + 0.03, 0.04)} material={m} position={[0, top - 0.005, -0.005]} />;
  }
};

/** a held phone (the "phone" pose): a clay brick with a lit screen toward the kid */
export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const scr = React.useMemo(() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 224;
    return { c, tex: Object.assign(new THREE.CanvasTexture(c), { colorSpace: THREE.SRGBColorSpace }) };
  }, []);
  const g = scr.c.getContext("2d")!;
  g.fillStyle = "#1d2433"; g.fillRect(0, 0, 128, 224);
  g.fillStyle = "#9aa7bd"; g.fillRect(8, 40, 112, 120);
  const b = Math.abs(Math.sin(t * 6)) * 14;
  g.strokeStyle = "#1d2433"; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.arc(64, 78 - b, 12, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(64, 90 - b); g.lineTo(64, 122 - b); g.moveTo(64, 100 - b); g.lineTo(46, 92 - b - b * 0.6); g.moveTo(64, 100 - b); g.lineTo(82, 92 - b - b * 0.6); g.moveTo(64, 122 - b); g.lineTo(52, 146); g.moveTo(64, 122 - b); g.lineTo(76, 146); g.stroke();
  g.fillStyle = "#3a4458"; g.fillRect(8, 178, 112, 8);
  g.fillStyle = "#ffd83a"; g.fillRect(8, 178, 112 * ((t * 0.08) % 1), 8);
  scr.tex.needsUpdate = true;
  return (
    <group>
      <mesh geometry={lumpBox(0.11, 0.19, 0.03, 0.012, 0.002)} material={clayMat("#2a2d36")} />
      <mesh geometry={geoOf("stPhoneScr", () => new THREE.PlaneGeometry(0.086, 0.15))} position={[0, 0, -0.017]} rotation={[0, Math.PI, 0]}>
        <meshBasicMaterial map={scr.tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Kid: React.FC<{ st: FigState; t: number }> = ({ st, t }) => {
  const sp = st.spec, s = st.s;
  const hip = hipY(st.sit);
  const skin = clayMat(sp.skin), top = clayMat(sp.top), trim = clayMat(sp.trim), pants = clayMat(sp.pants), shoes = clayMat(sp.shoes);
  const armY = K.torsoH - 0.07;
  const arm = (side: 1 | -1, a: [number, number]) => (
    <group position={[side * (K.torsoW / 2 + K.armW / 2 - 0.01), armY, 0]} rotation={[-a[0], 0, side * a[1]]}>
      <mesh geometry={lumpBox(K.armW, K.armL * 0.62, K.armW, 0.065)} material={sp.topStyle === "tee" ? skin : top} position={[0, -K.armL * 0.31 + 0.04, 0]} />
      {sp.topStyle === "tee" ? <mesh geometry={lumpBox(K.armW + 0.035, 0.18, K.armW + 0.035, 0.07)} material={top} position={[0, -0.04, 0]} /> : null}
      <mesh geometry={lumpBox(K.armW * 0.92, K.armL * 0.34, K.armW * 0.92, 0.06)} material={sp.topStyle === "tee" ? skin : top} position={[0, -K.armL * 0.72 + 0.04, 0]} />
      <mesh geometry={lumpBall(0.092, 1, 1.05, 0.95)} material={skin} position={[0, -K.armL + 0.02, 0.01]} />
    </group>
  );
  const leg = (side: 1 | -1) => st.sit ? (
    <group position={[side * 0.13, 0, 0]}>
      <mesh geometry={lumpBox(K.legW + 0.02, K.legW, 0.42, 0.08)} material={pants} position={[0, 0, 0.16]} />
      <mesh geometry={lumpBox(K.legW, K.seatH - 0.06, K.legW, 0.08)} material={pants} position={[0, -(K.seatH - 0.06) / 2, 0.34]} />
      <mesh geometry={lumpBox(K.legW + 0.05, 0.1, 0.29, 0.045)} material={shoes} position={[0, -K.seatH + 0.05, 0.38]} />
    </group>
  ) : (
    <group position={[side * 0.13, 0, 0]}>
      <mesh geometry={lumpBox(K.legW + 0.02, K.legH - 0.06, K.legW + 0.02, 0.08)} material={pants} position={[0, -(K.legH - 0.06) / 2, 0]} />
      <mesh geometry={lumpBox(K.legW + 0.05, 0.1, 0.29, 0.045)} material={shoes} position={[0, -K.legH + 0.05, 0.04]} />
    </group>
  );
  return (
    <group position={[st.x, 0, st.z]} rotation={[0, st.yaw, 0]} scale={s}>
      <group position={[0, hip + st.bob / s, 0]}>
        {leg(1)}{leg(-1)}
        <group rotation={[st.lean, 0, st.tilt * 0.4]}>
          <mesh geometry={lumpBox(K.torsoW, K.torsoH, K.torsoD, 0.12)} material={top} position={[0, K.torsoH / 2, 0]} />
          {sp.topStyle === "hoodie" ? (
            <>
              <mesh geometry={lumpBox(K.torsoW * 0.8, 0.15, 0.13, 0.06)} material={top} position={[0, K.torsoH - 0.02, -K.torsoD / 2 - 0.02]} />
              <mesh geometry={lumpBox(K.torsoW * 0.62, 0.14, 0.04, 0.018)} material={top} position={[0, K.torsoH * 0.24, K.torsoD / 2 + 0.008]} />
              <mesh geometry={lumpCapsule(0.014, 0.13)} material={trim} position={[0.06, K.torsoH - 0.12, K.torsoD / 2 + 0.012]} />
              <mesh geometry={lumpCapsule(0.014, 0.13)} material={trim} position={[-0.06, K.torsoH - 0.12, K.torsoD / 2 + 0.012]} />
            </>
          ) : sp.topStyle === "jacket" ? (
            <mesh geometry={lumpBox(0.05, K.torsoH * 0.9, 0.025, 0.012)} material={trim} position={[0, K.torsoH / 2, K.torsoD / 2 + 0.006]} />
          ) : (
            <mesh geometry={lumpBox(K.torsoW + 0.01, 0.07, K.torsoD + 0.01, 0.03)} material={trim} position={[0, K.torsoH * 0.55, 0]} />
          )}
          {arm(1, st.armL)}{arm(-1, st.armR)}
          {st.pose === "phone" ? <group position={[0, 0.37, 0.45]} rotation={[0.5, 0, 0]}><Phone t={t} /></group> : null}
          <mesh geometry={lumpBox(0.18, 0.1, 0.16, 0.06)} material={skin} position={[0, K.torsoH + 0.02, 0]} />
          <group position={[0, K.torsoH + K.neck + K.headH / 2, 0]} rotation={[st.headPitch, st.headYaw, st.tilt]}>
            <mesh geometry={lumpBox(K.headW, K.headH, K.headD, HR, 0.008)} material={skin} />
            <Face f={st.face} skin={sp.skin} brow={sp.brow} eye={sp.eye} freckles={sp.freckles} simple={!st.lead} />
            <mesh geometry={lumpBall(0.045, 0.8, 1.3, 1)} material={skin} position={[K.headW / 2 + 0.008, -0.03, 0]} />
            <mesh geometry={lumpBall(0.045, 0.8, 1.3, 1)} material={skin} position={[-K.headW / 2 - 0.008, -0.03, 0]} />
            <Hair st={st} />
          </group>
        </group>
      </group>
    </group>
  );
};
