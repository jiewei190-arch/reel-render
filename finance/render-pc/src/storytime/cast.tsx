// storytime cast, LOW-POLY: flat-shaded matte kids, one solid colour per part. A big blocky-round head (about a third of
// the body height), a boxy torso, straight 6-sided limbs with an elbow, mitten hands. The face is a set of flat decals on
// the front of the head: solid black octagon eyes (the upper lid cuts them), thick dark bar brows, a small extruded wedge
// nose, a thin dark mouth bar that never moves (no lip-sync). Face decals are hidden when the head is turned more than
// FACE_CULL from the lens (seen edge-on they would stand off the side of the head).
import React from "react";
import * as THREE from "three";
import { geoOf } from "../blocky/mat";
import type { FigState } from "./compile";
import { FACE_CULL, faceAngle } from "./compile";
import type { FaceP } from "./face";
import { K, hipY } from "./layout";
import { decalMat, polyBall, polyBox, polyCone, polyIco, polyLimb, polyMat, polyTorus } from "./poly";

/** the head's chamfer: its front face is flat inside |x| < headW/2 - HB, |y| < headH/2 - HB */
export const HB = 0.085;
const ZF = K.headD / 2 + 0.0015; // decals sit just on the front face
const INK = "#16121a";
const shade = (c: string, k: number) => { const x = new THREE.Color(c); x.multiplyScalar(k); return `#${x.getHexString()}`; };

// ------------------------------------------------------------------ face decals
type P2 = [number, number];
/** keep the part of a polygon above (keepAbove) or below a horizontal line */
const clipY = (P: P2[], y0: number, keepAbove: boolean): P2[] => {
  const inside = (p: P2) => (keepAbove ? p[1] >= y0 : p[1] <= y0);
  const out: P2[] = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    if (inside(a)) out.push(a);
    if (inside(a) !== inside(b)) { const k = (y0 - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * k, y0]); }
  }
  return out;
};
const q = (v: number, step = 0.02) => Math.round(v / step) * step;
/** a flat decal from a polygon (head-local metres), a hair thick */
const decalGeo = (key: string, P: P2[], depth = 0.004) => geoOf(key, () => {
  const sh = new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
  g.translate(0, 0, ZF - depth * 0.5);
  return g;
});
const octagon = (cx: number, cy: number, rx: number, ry: number): P2[] => Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P2; });
/** a bar from (x0, y0) to (x1, y1), thickness th (counter-clockwise) */
const bar = (x0: number, y0: number, x1: number, y1: number, th: number): P2[] => {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * th / 2, ny = (dx / l) * th / 2;
  const P: P2[] = [[x0 - nx, y0 - ny], [x1 - nx, y1 - ny], [x1 + nx, y1 + ny], [x0 + nx, y0 + ny]];
  return x1 < x0 ? P.reverse() : P;
};
/** a small wedge nose: a triangular profile (tall at the brow end, sloping out to the tip), 5 cm wide */
const NOSE = () => geoOf("stNose", () => {
  const g = new THREE.BufferGeometry();
  const w = 0.026, yT = 0.03, yB = -0.026, d = 0.042, z0 = ZF - 0.002;
  const v = [[-w, yT, z0], [w, yT, z0], [-w, yB, z0], [w, yB, z0], [-w, yB, z0 + d], [w, yB, z0 + d]];
  // faces: slope (top-front), bottom, two sides
  const idx = [0, 4, 1, 1, 4, 5, 2, 3, 4, 3, 5, 4, 0, 2, 4, 1, 5, 3];
  g.setAttribute("position", new THREE.Float32BufferAttribute(idx.flatMap((i) => v[i]), 3));
  g.computeVertexNormals();
  return g;
});

const Face: React.FC<{ f: FaceP; skin: string; brow: string }> = ({ f, skin, brow }) => {
  const ex = 0.098, ey = 0.03, rx = 0.043 * f.eyeS, ry = 0.05 * f.eyeS;
  const parts: React.ReactNode[] = [];
  for (const side of [1, -1] as const) {
    // ---- the eye: a solid octagon, cut by the upper lid (from the top) and the lower lid
    const cx = side * ex + f.px * 0.014, cy = ey - Math.max(0, f.browY - 0.4) * 0.04; // raised brows: the eyes sit a touch lower
    let P = octagon(cx, cy, rx, ry);
    const lid = Math.min(0.9, f.lid);
    if (lid > 0.02) P = clipY(P, cy + ry - 2 * ry * lid, false);
    if (f.lower > 0.02) P = clipY(P, cy - ry + 2 * ry * f.lower * 0.6, true);
    if (P.length >= 3) parts.push(<mesh key={`e${side}`} geometry={decalGeo(`stEye${side}|${q(f.px)}|${q(lid)}|${q(f.lower)}|${q(f.eyeS)}`, P)} material={decalMat(INK)} />);
    // ---- the brow: a thick bar; angry = inner end down, worried = inner end up; one brow can go way up (asym)
    const mine = side === 1 ? f.browAsym : -f.browAsym;
    const up = f.browY * 0.048 + Math.max(0, mine) * 0.055 - Math.max(0, -mine) * 0.012;
    const by = Math.min(0.138, cy + ry + 0.022 + up); // stays on the flat front, clear of the hair fringe
    const xi = side * 0.035, xo = side * 0.155, tilt = f.browA * 0.028;
    parts.push(<mesh key={`b${side}`} geometry={decalGeo(`stBrow${side}|${q(by, 0.005)}|${q(tilt, 0.005)}`, bar(xi, by - tilt, xo, by + tilt * 0.5, 0.03), 0.008)} material={decalMat(brow)} />);
  }
  // ---- the mouth: a thin dark bar, a touch of tilt (smirk) or bend (curve); it never moves with the voice
  const mw = f.mouthW * K.headW, my = -0.112;
  const yl = my + f.curve * 0.008 - Math.max(0, -f.smirk) * 0.014, yr = my + f.curve * 0.008 + Math.max(0, f.smirk) * 0.018;
  const mid = my - f.curve * 0.008;
  const M: P2[] = [[-mw, yl - 0.007], [0, mid - 0.007], [mw, yr - 0.007], [mw, yr + 0.007], [0, mid + 0.007], [-mw, yl + 0.007]];
  if (f.open > 0.15) {
    // a shout: a STATIC open mouth (a dark rounded trapezoid, wider at the top), optional gritted teeth strip on top
    const ow = mw * 1.05, oh = 0.018 + f.open * 0.06, top = my + 0.012 + f.curve * 0.004;
    const O: P2[] = [[-ow, top], [-ow * 0.98, top - oh * 0.55], [-ow * 0.7, top - oh], [ow * 0.7, top - oh], [ow * 0.98, top - oh * 0.55], [ow, top]].reverse() as P2[];
    parts.push(<mesh key="m" geometry={decalGeo(`stOpen|${q(ow, 0.005)}|${q(oh, 0.004)}|${q(top, 0.004)}`, O)} material={decalMat("#2a1216")} />);
    if (f.teeth > 0.3) {
      const th = 0.014 + f.teeth * 0.01;
      parts.push(<mesh key="t" geometry={decalGeo(`stTeeth|${q(ow, 0.005)}|${q(th, 0.002)}|${q(top, 0.004)}`, [[-ow * 0.92, top - th], [ow * 0.92, top - th], [ow * 0.92, top - 0.004], [-ow * 0.92, top - 0.004]], 0.006)} material={decalMat("#f4f1ea")} />);
    }
  } else {
    parts.push(<mesh key="m" geometry={decalGeo(`stMouth|${q(mw, 0.005)}|${q(yl, 0.004)}|${q(yr, 0.004)}|${q(mid, 0.004)}`, M)} material={decalMat("#3a1e22")} />);
  }
  parts.push(<mesh key="n" geometry={NOSE()} material={polyMat(shade(skin, 0.94))} position={[0, -0.045, 0]} />);
  return <group>{parts}</group>;
};

// ------------------------------------------------------------------ hair
const Hair: React.FC<{ st: FigState }> = ({ st }) => {
  const sp = st.spec, m = polyMat(sp.hair), hw = K.headW, hh = K.headH, hd = K.headD;
  const top = hh / 2;
  // a cap that hugs the top, back and sides of the head (every style starts from it)
  const cap = (h = 0.1, back = 0.3) => (
    <>
      <mesh geometry={polyBox(hw + 0.03, h, hd + 0.03, 0.05)} material={m} position={[0, top - h / 2 + 0.035, -0.004]} />
      <mesh geometry={polyBox(hw + 0.025, back, 0.06, 0.02)} material={m} position={[0, top - back / 2 + 0.02, -hd / 2 - 0.012]} />
      <mesh geometry={polyBox(0.05, 0.16, hd * 0.75, 0.015)} material={m} position={[hw / 2 + 0.008, top - 0.07, -hd * 0.12]} />
      <mesh geometry={polyBox(0.05, 0.16, hd * 0.75, 0.015)} material={m} position={[-hw / 2 - 0.008, top - 0.07, -hd * 0.12]} />
    </>
  );
  switch (sp.hairStyle) {
    case "twists": {
      // short black twists / coils: a cap, then rows of small 5-sided cones pointing up and out over the crown
      const tw: { p: [number, number, number]; r: [number, number, number]; s: number }[] = [];
      let i = 0;
      for (const [rz, nx, yy] of [[0.17, 7, 0.035], [0.06, 7, 0.06], [-0.06, 7, 0.06], [-0.17, 6, 0.035]] as const) {
        for (let k = 0; k < nx; k++) {
          const x = (k / (nx - 1) - 0.5) * (hw - 0.05);
          tw.push({ p: [x, top + yy + 0.008 * Math.sin(i * 2.1), rz], r: [rz * 1.8 + 0.12 * Math.sin(i * 1.3), 0, -x * 2.4 + 0.1 * Math.sin(i * 0.7)], s: 0.9 + 0.2 * Math.abs(Math.sin(i * 1.7)) });
          i++;
        }
      }
      return (
        <group>
          {cap(0.1, 0.3)}
          {tw.map((x, k) => <mesh key={k} geometry={polyIco(0.042, 1, 1.3, 1)} material={m} position={x.p} rotation={x.r} scale={x.s} />)}
        </group>
      );
    }
    case "curls": {
      // a mop of copper curls: a cap plus faceted balls of different sizes, a few flopping onto the forehead
      const balls: [number, number, number, number][] = [];
      for (let k = 0; k < 24; k++) {
        const a = k * 2.39996, r = 0.06 + 0.2 * Math.sqrt((k + 0.5) / 24);
        balls.push([Math.cos(a) * r, top + 0.07 - r * r * 0.9 + 0.02 * Math.sin(k * 1.7), Math.sin(a) * r * 0.92 - 0.01, 0.07 + 0.025 * ((k * 37) % 5) / 4]);
      }
      const fringe: [number, number, number, number][] = [[-0.13, top - 0.01, hd / 2 - 0.035, 0.056], [-0.04, top - 0.02, hd / 2 - 0.02, 0.06], [0.06, top - 0.012, hd / 2 - 0.025, 0.056], [0.15, top - 0.005, hd / 2 - 0.04, 0.05]];
      return (
        <group>
          {cap(0.12, 0.26)}
          {[...balls, ...fringe].map(([x, y, z, r], k) => <mesh key={k} geometry={polyIco(r, 1, 0.86, 1)} material={m} position={[x, y, z]} rotation={[k * 0.7, k * 1.3, 0]} />)}
        </group>
      );
    }
    case "flattop":
      return <group>{cap(0.1, 0.28)}<mesh geometry={polyBox(hw + 0.04, 0.16, hd + 0.03, 0.03)} material={m} position={[0, top + 0.06, -0.01]} /></group>;
    case "spiky":
      return <group>{cap(0.1, 0.26)}{[-0.15, -0.05, 0.05, 0.15].map((x, k) => <mesh key={k} geometry={polyCone(0.07, 0.18, 4)} material={m} position={[x, top + 0.09, 0]} rotation={[0, 0, -x * 2]} />)}</group>;
    case "puff":
      return <group>{cap(0.08, 0.2)}<mesh geometry={polyBall(0.27, 1, 0.62, 0.95, 7)} material={m} position={[0, top + 0.07, -0.04]} /></group>;
    case "bob":
      return (
        <group>
          {cap(0.12, 0.36)}
          <mesh geometry={polyBox(0.07, 0.34, hd + 0.04, 0.02)} material={m} position={[hw / 2 + 0.02, top - 0.14, -0.01]} />
          <mesh geometry={polyBox(0.07, 0.34, hd + 0.04, 0.02)} material={m} position={[-hw / 2 - 0.02, top - 0.14, -0.01]} />
        </group>
      );
    default:
      return <group>{cap(0.07, 0.22)}</group>;
  }
};

// ------------------------------------------------------------------ the phone (a generic video app, no logos)
/** a generic video player: a cartoon clip (a stick figure jumping), the title, views, a progress bar, suggestions */
const drawScreen = (g: CanvasRenderingContext2D, W: number, H: number, t: number, title: string) => {
  g.fillStyle = "#101318"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#e9edf2"; g.font = `700 ${W * 0.06}px sans-serif`; g.fillText("9:41", W * 0.06, H * 0.045);
  g.fillStyle = "#ff8a1e"; g.beginPath(); g.moveTo(W * 0.06, H * 0.075); g.lineTo(W * 0.06, H * 0.115); g.lineTo(W * 0.1, H * 0.095); g.fill();
  g.fillStyle = "#e9edf2"; g.font = `800 ${W * 0.065}px sans-serif`; g.fillText("Clips", W * 0.13, H * 0.112);
  const vy = H * 0.15, vh = W * 0.62;
  g.fillStyle = "#8fd0ff"; g.fillRect(0, vy, W, vh * 0.65); g.fillStyle = "#6cc46a"; g.fillRect(0, vy + vh * 0.65, W, vh * 0.35);
  const b = Math.abs(Math.sin(t * 5.5)) * vh * 0.14, cx = W * 0.5, cy = vy + vh * 0.42 - b;
  g.strokeStyle = "#1d2433"; g.lineWidth = W * 0.025; g.lineCap = "round";
  g.beginPath(); g.arc(cx, cy - vh * 0.13, vh * 0.07, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(cx, cy - vh * 0.06); g.lineTo(cx, cy + vh * 0.12); g.moveTo(cx, cy); g.lineTo(cx - vh * 0.13, cy - vh * 0.06 - b * 0.4); g.moveTo(cx, cy); g.lineTo(cx + vh * 0.13, cy - vh * 0.06 - b * 0.4);
  g.moveTo(cx, cy + vh * 0.12); g.lineTo(cx - vh * 0.08, cy + vh * 0.24 + b * 0.5); g.moveTo(cx, cy + vh * 0.12); g.lineTo(cx + vh * 0.08, cy + vh * 0.24 + b * 0.5); g.stroke();
  g.fillStyle = "#3a4458"; g.fillRect(0, vy + vh, W, H * 0.012); g.fillStyle = "#ff8a1e"; g.fillRect(0, vy + vh, W * (0.18 + ((t * 0.05) % 0.8)), H * 0.012);
  g.fillStyle = "#ffffff"; g.font = `800 ${W * 0.085}px sans-serif`;
  let line = "", y = vy + vh + H * 0.075;
  for (const w of title.split(" ")) { if (g.measureText(line + w).width > W * 0.88 && line) { g.fillText(line.trim(), W * 0.06, y); line = ""; y += W * 0.095; } line += `${w} `; }
  g.fillText(line.trim(), W * 0.06, y);
  g.fillStyle = "#9aa7bd"; g.font = `600 ${W * 0.055}px sans-serif`; g.fillText("1.2M views · 9 yrs ago", W * 0.06, y + W * 0.085);
  for (let k = 0; k < 3; k++) { const yy = y + W * 0.16 + k * H * 0.11; g.fillStyle = "#262c38"; g.fillRect(W * 0.06, yy, W * 0.36, H * 0.085); g.fillStyle = "#3a4458"; g.fillRect(W * 0.47, yy + H * 0.012, W * 0.44, H * 0.018); g.fillRect(W * 0.47, yy + H * 0.045, W * 0.3, H * 0.014); }
};
/** a phone: a dark slab with the lit screen on its +z face (w wide) */
export const Phone: React.FC<{ t: number; w?: number; title?: string }> = ({ t, w = 0.085, title = "VINES 2015 COMPILATION" }) => {
  const h = w * 1.95;
  const scr = React.useMemo(() => { const c = document.createElement("canvas"); c.width = 360; c.height = 640; return { c, tex: Object.assign(new THREE.CanvasTexture(c), { colorSpace: THREE.SRGBColorSpace }) }; }, []);
  drawScreen(scr.c.getContext("2d")!, 360, 640, t, title);
  scr.tex.needsUpdate = true;
  return (
    <group>
      <mesh geometry={polyBox(w + 0.008, h + 0.008, 0.012, 0.004)} material={polyMat("#22252d")} />
      <mesh geometry={geoOf(`stPhoneScr${w}`, () => new THREE.PlaneGeometry(w, h))} position={[0, 0, 0.0065]}>
        <meshBasicMaterial map={scr.tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** a mitten hand (thumb on +x) */
export const Mitten: React.FC<{ skin: string; flip?: boolean }> = ({ skin, flip }) => (
  <group scale={[flip ? -1 : 1, 1, 1]}>
    <mesh geometry={polyBox(0.1, 0.12, 0.075, 0.02)} material={polyMat(skin)} />
    <mesh geometry={polyBox(0.035, 0.06, 0.04, 0.01)} material={polyMat(skin)} position={[0.055, 0.015, 0.01]} rotation={[0, 0, -0.5]} />
  </group>
);

export const Kid: React.FC<{ st: FigState; t: number; cam?: readonly number[] }> = ({ st, t, cam }) => {
  const sp = st.spec, s = st.s;
  const faceOn = !cam || faceAngle(st, cam) <= FACE_CULL;
  const hip = hipY(st.sit);
  const skin = polyMat(sp.skin), top = polyMat(sp.top), trim = polyMat(sp.trim), pants = polyMat(sp.pants), shoes = polyMat(sp.shoes);
  const armY = K.torsoH - 0.07;
  const sleeveLong = sp.topStyle !== "tee";
  const UA = K.armL * 0.5, FA = K.armL * 0.4, rA = K.armW / 2;
  const el = st.elbow ?? [0.12, 0.12];
  const arm = (side: 1 | -1, a: [number, number], elbow: number) => (
    <group position={[side * (K.torsoW / 2 + rA - 0.01), armY, 0]} rotation={[-a[0], 0, side * a[1]]}>
      <mesh geometry={polyLimb(rA * 1.05, rA, UA + 0.04)} material={sleeveLong ? top : skin} position={[0, 0.04, 0]} />
      {sleeveLong ? null : <mesh geometry={polyLimb(rA * 1.32, rA * 1.26, 0.16)} material={top} position={[0, 0.06, 0]} />}
      <group position={[0, -UA + 0.02, 0]} rotation={[-elbow, 0, 0]}>
        <mesh geometry={polyLimb(rA * 0.98, rA * 0.9, FA)} material={sleeveLong ? top : skin} />
        {sp.topStyle === "bomber" ? <mesh geometry={polyLimb(rA * 1.04, rA * 1.04, 0.05)} material={trim} position={[0, -FA + 0.05, 0]} /> : null}
        <group position={[0, -FA - 0.05, 0.005]}><Mitten skin={sp.skin} flip={side < 0} /></group>
      </group>
    </group>
  );
  const rL = K.legW / 2;
  const pocket = (side: 1 | -1, sit: boolean) => (sp.cargo ? (sit
    ? <mesh geometry={polyBox(0.035, 0.1, 0.12, 0.01)} material={polyMat(shade(sp.pants, 0.86))} position={[side * (rL + 0.012), 0, 0.2]} />
    : <mesh geometry={polyBox(0.035, 0.12, 0.1, 0.01)} material={polyMat(shade(sp.pants, 0.86))} position={[side * (rL + 0.012), -0.18, 0]} />) : null);
  const shoe = (z: number, y: number) => (
    <group position={[0, y, z]}>
      <mesh geometry={polyBox(K.legW + 0.04, 0.09, 0.27, 0.03)} material={shoes} position={[0, 0.015, 0]} />
      <mesh geometry={polyBox(K.legW + 0.045, 0.03, 0.28, 0.008)} material={polyMat("#f4f4f0")} position={[0, -0.035, 0]} />
    </group>
  );
  const leg = (side: 1 | -1) => (st.sit ? (
    <group position={[side * 0.13, 0, 0]}>
      <mesh geometry={polyLimb(rL * 1.15, rL * 1.05, 0.42)} material={pants} position={[0, 0, -0.06]} rotation={[-Math.PI / 2, 0, 0]} />
      {pocket(side, true)}
      <mesh geometry={polyLimb(rL * 1.05, rL, K.seatH - 0.08)} material={pants} position={[0, 0, 0.33]} />
      {shoe(0.38, -K.seatH + 0.05)}
    </group>
  ) : (
    <group position={[side * 0.13, 0, 0]}>
      <mesh geometry={polyLimb(rL * 1.12, rL, K.legH - 0.08)} material={pants} position={[0, 0.02, 0]} />
      {pocket(side, false)}
      {shoe(0.04, -K.legH + 0.05)}
    </group>
  ));
  return (
    <group position={[st.x, 0, st.z]} rotation={[0, st.yaw, 0]} scale={s}>
      <group position={[0, hip + st.bob / s, 0]}>
        {leg(1)}{leg(-1)}
        <group rotation={[st.lean, 0, st.tilt * 0.4]}>
          <mesh geometry={polyBox(K.torsoW, K.torsoH, K.torsoD, 0.05)} material={top} position={[0, K.torsoH / 2, 0]} />
          {sp.topStyle === "bomber" ? (
            <>
              {/* the open front shows the tee; ribbed collar + waistband in the trim colour; a zip pull */}
              <mesh geometry={polyBox(0.15, K.torsoH - 0.08, 0.02, 0.005)} material={polyMat(sp.inner ?? "#f4f4f0")} position={[0, K.torsoH / 2 + 0.02, K.torsoD / 2 + 0.002]} />
              <mesh geometry={polyBox(K.torsoW + 0.02, 0.06, K.torsoD + 0.02, 0.015)} material={trim} position={[0, 0.03, 0]} />
              <mesh geometry={polyTorus(0.105, 0.025, 4, 10)} material={trim} position={[0, K.torsoH - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.15, 1, 1]} />
              <mesh geometry={polyBox(0.022, 0.055, 0.012, 0.003)} material={polyMat("#c9c9c9")} position={[0.085, K.torsoH * 0.62, K.torsoD / 2 + 0.006]} />
            </>
          ) : sp.topStyle === "hoodie" ? (
            <mesh geometry={polyBox(K.torsoW * 0.62, 0.14, 0.03, 0.01)} material={top} position={[0, K.torsoH * 0.24, K.torsoD / 2 + 0.008]} />
          ) : (
            <mesh geometry={polyBox(K.torsoW + 0.008, 0.06, K.torsoD + 0.008, 0.012)} material={trim} position={[0, K.torsoH * 0.58, 0]} />
          )}
          {sp.chain ? <mesh geometry={polyTorus(0.1, 0.011, 4, 14)} material={polyMat(sp.chain, { rough: 0.5 })} position={[0, K.torsoH - 0.03, K.torsoD / 2 - 0.08]} rotation={[Math.PI / 2 - 0.62, 0, 0]} scale={[1, 1.25, 1]} /> : null}
          {arm(1, st.armL, el[0])}{arm(-1, st.armR, el[1])}
          {st.pose === "phone" ? <group position={[0, 0.37, 0.45]} rotation={[0.5, Math.PI, 0]}><Phone t={t} /></group> : null}
          <mesh geometry={polyLimb(0.085, 0.085, 0.1, 6)} material={skin} position={[0, K.torsoH + 0.07, 0]} />
          <group position={[0, K.torsoH + K.neck + K.headH / 2, 0]} rotation={[st.headPitch, st.headYaw, st.tilt]}>
            <mesh geometry={polyBox(K.headW, K.headH, K.headD, HB)} material={skin} />
            {faceOn ? <Face f={st.face} skin={sp.skin} brow={sp.brow} /> : null}
            <mesh geometry={polyBox(0.04, 0.09, 0.07, 0.012)} material={skin} position={[K.headW / 2 + 0.012, -0.02, 0]} />
            <mesh geometry={polyBox(0.04, 0.09, 0.07, 0.012)} material={skin} position={[-K.headW / 2 - 0.012, -0.02, 0]} />
            <Hair st={st} />
          </group>
        </group>
      </group>
    </group>
  );
};
