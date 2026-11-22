// storytime cast: chunky low-poly kids (block torso, box arms, short legs, a BIG rounded head) with a 2D face decal
// redrawn every frame from the compiled face vector (src/storytime/face.ts). Leads get a 512 px face; the background
// classmates a 256 px one with simple dot eyes. Hair is a few flat-shaded blocks or cones per style.
import React from "react";
import * as THREE from "three";
import { geoOf, plastic, rbox } from "../blocky/mat";
import type { FigState } from "./compile";
import { drawFace } from "./face";
import { K, hipY } from "./layout";

const flat = (c: string) => plastic(c, { flat: true, rough: 0.75 });

// one canvas + texture per figure id (each render tab has its own module state)
const faceTex = new Map<string, { c: HTMLCanvasElement; t: THREE.CanvasTexture; m: THREE.MeshStandardMaterial }>();
const faceOf = (id: string, size: number) => {
  let f = faceTex.get(id);
  if (!f) {
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 0.8, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    f = { c, t, m };
    faceTex.set(id, f);
  }
  return f;
};

const Hair: React.FC<{ st: FigState }> = ({ st }) => {
  const sp = st.spec, m = flat(sp.hair), hw = K.headW, hh = K.headH, hd = K.headD;
  const top = hh / 2;
  switch (sp.hairStyle) {
    case "flattop":
      return (
        <group>
          <mesh geometry={rbox(hw + 0.04, 0.16, hd + 0.04, 0.03)} material={m} position={[0, top + 0.05, -0.005]} castShadow />
          <mesh geometry={rbox(hw + 0.045, 0.1, 0.12, 0.02)} material={m} position={[0, top - 0.02, hd / 2 - 0.03]} />
          <mesh geometry={rbox(0.06, 0.2, hd + 0.03, 0.02)} material={m} position={[hw / 2 + 0.005, top - 0.08, -0.03]} />
          <mesh geometry={rbox(0.06, 0.2, hd + 0.03, 0.02)} material={m} position={[-hw / 2 - 0.005, top - 0.08, -0.03]} />
          <mesh geometry={rbox(hw + 0.03, 0.26, 0.06, 0.02)} material={m} position={[0, top - 0.1, -hd / 2 - 0.01]} />
        </group>
      );
    case "spiky": {
      const cone = geoOf("stSpike", () => new THREE.ConeGeometry(0.075, 0.2, 5));
      const spikes: [number, number, number, number, number][] = [[-0.16, 0.03, 0.13, 0.45, -0.3], [-0.05, 0.08, 0.15, 0.25, -0.15], [0.07, 0.07, 0.14, -0.15, -0.2], [0.17, 0.02, 0.12, -0.4, -0.3], [-0.11, 0.06, -0.02, 0.3, 0.1], [0.02, 0.1, 0.0, 0, 0.1], [0.14, 0.06, -0.03, -0.3, 0.15], [-0.08, 0.04, -0.15, 0.25, 0.35], [0.08, 0.04, -0.15, -0.25, 0.35]];
      return (
        <group>
          <mesh geometry={rbox(hw + 0.035, 0.1, hd + 0.035, 0.03)} material={m} position={[0, top, 0]} castShadow />
          <mesh geometry={rbox(hw + 0.04, 0.08, 0.08, 0.02)} material={m} position={[0, top - 0.035, hd / 2 - 0.02]} />
          {spikes.map(([x, y, z, rz, rx], i) => <mesh key={i} geometry={cone} material={m} position={[x, top + 0.09 + y, z]} rotation={[rx, 0, rz]} castShadow />)}
          <mesh geometry={rbox(0.05, 0.18, hd, 0.02)} material={m} position={[hw / 2 + 0.005, top - 0.07, -0.02]} />
          <mesh geometry={rbox(0.05, 0.18, hd, 0.02)} material={m} position={[-hw / 2 - 0.005, top - 0.07, -0.02]} />
        </group>
      );
    }
    case "puff":
      return (
        <group>
          <mesh geometry={geoOf("stPuff", () => new THREE.IcosahedronGeometry(0.29, 1))} material={m} position={[0, top + 0.06, -0.05]} scale={[1, 0.62, 0.95]} castShadow />
        </group>
      );
    case "bob":
      return (
        <group>
          <mesh geometry={rbox(hw + 0.06, 0.12, hd + 0.06, 0.04)} material={m} position={[0, top + 0.02, 0]} castShadow />
          <mesh geometry={rbox(0.07, 0.36, hd + 0.04, 0.03)} material={m} position={[hw / 2 + 0.02, top - 0.14, -0.01]} />
          <mesh geometry={rbox(0.07, 0.36, hd + 0.04, 0.03)} material={m} position={[-hw / 2 - 0.02, top - 0.14, -0.01]} />
          <mesh geometry={rbox(hw + 0.06, 0.38, 0.07, 0.03)} material={m} position={[0, top - 0.14, -hd / 2 - 0.02]} />
        </group>
      );
    default: // buzz
      return <mesh geometry={rbox(hw + 0.02, 0.07, hd + 0.02, 0.03)} material={m} position={[0, top - 0.005, -0.005]} castShadow />;
  }
};

/** a held phone (the "phone" pose): screen toward the kid */
export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const scr = React.useMemo(() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 224;
    return { c, tex: Object.assign(new THREE.CanvasTexture(c), { colorSpace: THREE.SRGBColorSpace }) };
  }, []);
  const g = scr.c.getContext("2d")!;
  // a generic old-school video: a stick kid bouncing on a grey wall, a progress bar
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
      <mesh geometry={rbox(0.1, 0.18, 0.016, 0.012)} material={flat("#20232b")} castShadow />
      <mesh geometry={geoOf("stPhoneScr", () => new THREE.PlaneGeometry(0.086, 0.15))} position={[0, 0, -0.0095]} rotation={[0, Math.PI, 0]}>
        <meshBasicMaterial map={scr.tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Kid: React.FC<{ st: FigState; t: number }> = ({ st, t }) => {
  const sp = st.spec, s = st.s;
  const hip = hipY(st.sit);
  const skin = flat(sp.skin), top = flat(sp.top), trim = flat(sp.trim), pants = flat(sp.pants), shoes = flat(sp.shoes);
  const size = st.lead ? 512 : 256;
  const F = faceOf(st.id, size);
  drawFace(F.c.getContext("2d")!, size, st.face, { skin: sp.skin, brow: sp.brow, eye: sp.eye, freckles: sp.freckles, simple: !st.lead, lineW: st.lead ? 0.018 : 0.026 });
  F.t.needsUpdate = true;
  const armY = K.torsoH - 0.07;
  const arm = (side: 1 | -1, a: [number, number]) => (
    <group position={[side * (K.torsoW / 2 + K.armW / 2 + 0.005), armY, 0]} rotation={[-a[0], 0, side * a[1]]}>
      <mesh geometry={rbox(K.armW, K.armL * 0.62, K.armW, 0.03)} material={sp.topStyle === "tee" ? skin : top} position={[0, -K.armL * 0.31 + 0.04, 0]} castShadow />
      {sp.topStyle === "tee" ? <mesh geometry={rbox(K.armW + 0.02, 0.17, K.armW + 0.02, 0.03)} material={top} position={[0, -0.04, 0]} castShadow /> : null}
      <mesh geometry={rbox(K.armW * 0.92, K.armL * 0.36, K.armW * 0.92, 0.035)} material={skin} position={[0, -K.armL * 0.8 + 0.04, 0]} castShadow />
    </group>
  );
  const leg = (side: 1 | -1) => st.sit ? (
    <group position={[side * 0.13, 0, 0]}>
      <mesh geometry={rbox(K.legW, K.legW, 0.42, 0.03)} material={pants} position={[0, 0, 0.16]} castShadow />
      <mesh geometry={rbox(K.legW, K.seatH - 0.06, K.legW, 0.03)} material={pants} position={[0, -(K.seatH - 0.06) / 2, 0.34]} castShadow />
      <mesh geometry={rbox(K.legW + 0.03, 0.08, 0.27, 0.03)} material={shoes} position={[0, -K.seatH + 0.04, 0.38]} castShadow />
    </group>
  ) : (
    <group position={[side * 0.13, 0, 0]}>
      <mesh geometry={rbox(K.legW, K.legH - 0.06, K.legW, 0.03)} material={pants} position={[0, -(K.legH - 0.06) / 2, 0]} castShadow />
      <mesh geometry={rbox(K.legW + 0.03, 0.08, 0.27, 0.03)} material={shoes} position={[0, -K.legH + 0.04, 0.04]} castShadow />
    </group>
  );
  return (
    <group position={[st.x, 0, st.z]} rotation={[0, st.yaw, 0]} scale={s}>
      <group position={[0, hip + st.bob / s, 0]}>
        {leg(1)}{leg(-1)}
        <group rotation={[st.lean, 0, st.tilt * 0.4]}>
          {/* torso + top */}
          <mesh geometry={rbox(K.torsoW, K.torsoH, K.torsoD, 0.05)} material={top} position={[0, K.torsoH / 2, 0]} castShadow />
          {sp.topStyle === "hoodie" ? (
            <>
              <mesh geometry={rbox(K.torsoW * 0.78, 0.13, 0.12, 0.04)} material={top} position={[0, K.torsoH - 0.02, -K.torsoD / 2 - 0.02]} castShadow />
              <mesh geometry={rbox(K.torsoW * 0.6, 0.13, 0.03, 0.012)} material={plastic(sp.trim, { flat: true, rough: 0.8 })} position={[0, K.torsoH * 0.24, K.torsoD / 2 + 0.008]} />
              <mesh geometry={rbox(0.025, 0.16, 0.025, 0.01)} material={trim} position={[0.06, K.torsoH - 0.12, K.torsoD / 2 + 0.01]} />
              <mesh geometry={rbox(0.025, 0.16, 0.025, 0.01)} material={trim} position={[-0.06, K.torsoH - 0.12, K.torsoD / 2 + 0.01]} />
            </>
          ) : sp.topStyle === "jacket" ? (
            <mesh geometry={rbox(0.05, K.torsoH * 0.92, 0.02, 0.01)} material={trim} position={[0, K.torsoH / 2, K.torsoD / 2 + 0.006]} />
          ) : (
            <mesh geometry={rbox(K.torsoW + 0.004, 0.07, K.torsoD + 0.004, 0.02)} material={trim} position={[0, K.torsoH * 0.55, 0]} />
          )}
          {arm(1, st.armL)}{arm(-1, st.armR)}
          {st.pose === "phone" ? <group position={[0, 0.37, 0.45]} rotation={[0.5, 0, 0]}><Phone t={t} /></group> : null}
          {/* neck + head */}
          <mesh geometry={rbox(0.18, 0.08, 0.16, 0.03)} material={skin} position={[0, K.torsoH + 0.02, 0]} />
          <group position={[0, K.torsoH + K.neck + K.headH / 2, 0]} rotation={[st.headPitch, st.headYaw, st.tilt]}>
            <mesh geometry={rbox(K.headW, K.headH, K.headD, 0.1)} material={skin} castShadow />
            <mesh geometry={geoOf("stFacePlane", () => new THREE.PlaneGeometry(K.headW * 0.96, K.headH * 0.96))} material={F.m} position={[0, -0.005, K.headD / 2 + 0.004]} />
            {/* ears */}
            <mesh geometry={rbox(0.05, 0.11, 0.08, 0.02)} material={skin} position={[K.headW / 2 + 0.012, -0.03, 0]} />
            <mesh geometry={rbox(0.05, 0.11, 0.08, 0.02)} material={skin} position={[-K.headW / 2 - 0.012, -0.03, 0]} />
            <Hair st={st} />
          </group>
        </group>
      </group>
    </group>
  );
};
