// StoryFilm (LOW-POLY look): one compiled storytime recipe. One View: warm low-angle window light, flat-shaded matte
// kids and sets, no ink outline, low contrast, depth of field on close-ups and first-person POV shots only, no motion
// blur. The POV shots put the narrator's view rig (the homie's phone, my hands on my tray) in camera space. Then the 2D
// layer: the caption, and the hard cut to black (pure black from the cut on: no fade). No shakes, flashes or shards.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../engine/core/frame";
import { mk } from "../engine/core/moods";
import type { MoodPreset } from "../engine/core/moods";
import { View } from "../engine/core/View";
import { Kid, Mitten, Phone, PhoneCtx } from "./cast";
import type { Compiled } from "./compile";
import { FPS, headCenter } from "./compile";
import { StoryCaption, useCapFont } from "./hud";
import { polyLimb, polyMat } from "./poly";
import { SET_BG, SUN_CAF, SUN_CLASS, StorySet } from "./sets";
import type { CamS, V3 } from "./layout";
import type { CastSpec, SetId } from "./types";

const flatSky = (c: string) => ({ top: c, mid: c, bottom: c, cloudColor: c, cloudLit: "#ffffff", clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0, sun: { dir: [-0.6, 0.12, -1] as [number, number, number], color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1] as [number, number, number], color: "#ffffff", size: 4 }, moonOn: 0 });
/** a school room lit by a warm low sun through the windows: soft key from the window side, ambient fill, low contrast,
 *  NO ink outline, almost no vignette (flat-shaded low-poly). keyDir points from the scene toward the sun. */
const school = (fog: string, keyDir: [number, number, number]): MoodPreset => {
  const m = mk({
    note: "storytime low-poly window light", hemi: ["#fff6ea", "#b89a80", 1.15], key: ["#ffe0b0", 2.5, keyDir], rim: ["#fff2dc", 0.35, [-0.5, 0.5, -0.8]],
    fill: ["#dde4ff", 0.55, [-keyDir[0], 0.35, -keyDir[2]]], prac: ["#fff0d0", 0, "#fff0d0"], fog: [fog, 0.004], sky: flatSky(fog),
    toon: { shadowTint: [0.97, 0.94, 1.02], hiTint: [1.02, 1.0, 0.97], rimColor: "#fff2e0" },
    grade: { exposure: 1.0, contrast: 0.98, saturation: 1.1, shadowTint: "#7a6670", highlightTint: "#fff2dc", gain: "#fffaf4" }, bloomTint: "#ffe8c8", ink: "#3a2a30",
    camFill: ["#fff4e8", 0.35], cast: { rim: ["#fff0dc", 0.3], fill: ["#ffe8d0", 0.45] },
  });
  return { ...m, post: { ...m.post, outline: { ...m.post.outline, enabled: false, strength: 0 }, bloom: { ...m.post.bloom, threshold: 1.4, strength: 0.08 }, grade: { ...m.post.grade, lift: "#221a1c", sharpen: 0.1 }, vignette: { amount: 0.1, softness: 0.8, color: "#2a1a14" } } };
};
const sunKey = (v: V3, up = 0.42): [number, number, number] => { const x = -v[0], z = -v[2], l = Math.hypot(x, z); return [x / l, up, z / l]; };
const MOODS: Record<SetId, MoodPreset> = {
  classroom: school("#f0e6d6", sunKey(SUN_CLASS)),
  hallway: school("#eef0e0", sunKey(SUN_CLASS, 0.6)),
  cafeteria: school("#f6e6d0", sunKey(SUN_CAF)),
  detention: school("#ece2cf", sunKey([-0.9, -0.1, 0.4], 0.5)),
  gym: school("#eceae2", sunKey([0.3, -0.2, 1], 0.75)),
};

/** children in camera space: +x right, +y up, -z forward (into the frame) */
const CamRig: React.FC<{ cam: CamS; children: React.ReactNode }> = ({ cam, children }) => {
  const m4 = new THREE.Matrix4().lookAt(new THREE.Vector3(...cam.pos), new THREE.Vector3(...cam.look), new THREE.Vector3(0, 1, 0));
  const q = new THREE.Quaternion().setFromRotationMatrix(m4);
  if (cam.roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (cam.roll * Math.PI) / 180));
  return <group position={cam.pos} quaternion={q}>{children}</group>;
};
/** a forearm (sleeve) + mitten reaching in from below the frame edge toward `to` (camera space) */
const Reach: React.FC<{ to: V3; from: V3; sleeve: string; skin: string; flip?: boolean; cuff?: string }> = ({ to, from, sleeve, skin, flip, cuff }) => {
  const d = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.clone().normalize());
  return (
    <group position={from} quaternion={q}>
      <mesh geometry={polyLimb(0.06, 0.055, len)} material={polyMat(sleeve)} />
      {cuff ? <mesh geometry={polyLimb(0.063, 0.063, 0.05)} material={polyMat(cuff)} position={[0, -len + 0.05, 0]} /> : null}
      <group position={[0, -len - 0.05, 0]}><Mitten skin={skin} flip={flip} /></group>
    </group>
  );
};
/** the homie's thumb over the soundboard button: up, then down on each press (0.12 s before it to 0.18 s after) */
const Thumb: React.FC<{ skin: string }> = ({ skin }) => {
  const ph = React.useContext(PhoneCtx);
  const down = (ph.age >= 0 && ph.age < 0.18) ? 1 : ph.next < 0.12 ? 1 - ph.next / 0.12 : ph.age < 0.4 ? 1 - (ph.age - 0.18) / 0.22 : 0;
  const lift = 0.045 - 0.036 * Math.max(0, Math.min(1, down));
  // phone-local: the button centre is at y -0.023 (0.64 of the screen height); the thumb comes in from the lower right
  const A = new THREE.Vector3(0.15, -0.2, lift + 0.05), B = new THREE.Vector3(0.022, -0.045, lift);
  const d = B.clone().sub(A), len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.clone().normalize());
  return (
    <group position={A.toArray()} quaternion={q}>
      <mesh geometry={polyLimb(0.015, 0.012, len)} material={polyMat(skin)} />
    </group>
  );
};
const PovRig: React.FC<{ kind: "pov_phone" | "pov_tray" | "pov_press"; side: number; me: CastSpec; homie: CastSpec; eyes: CastSpec; t: number }> = ({ kind, side, me, homie, eyes, t }) => {
  if (kind === "pov_press") {
    // the homie's view down at his own phone: the soundboard big in frame, his left hand holding it, his right thumb on BRUH
    const w = 0.085;
    return (
      <group>
        <group position={[0, 0.0, -0.3]} rotation={[0.12, 0, 0]}>
          <Phone t={t} w={w} />
          <Thumb skin={homie.skin} />
        </group>
        <Reach from={[-0.2, -0.45, -0.18]} to={[-0.07, -0.14, -0.31]} sleeve={homie.skin} skin={homie.skin} flip />
      </group>
    );
  }
  if (kind === "pov_phone") {
    // the homie holds his phone up to my face from his side; the screen faces me
    return (
      <group>
        <group position={[0, 0.02, -0.5]} rotation={[0.04, -0.1 * side, 0.05 * side]}><Phone t={t} w={0.12} /></group>
        <group scale={0.55}><Reach from={[0.3 * side, -0.62, -0.92]} to={[0.12 * side, -0.24, -0.9]} sleeve={homie.skin} skin={homie.skin} flip={side < 0} /></group>
      </group>
    );
  }
  // the eyes' two hands resting on the tray edges (sleeves: a bomber's with ribbed cuffs; a tee shows bare forearms)
  const tee = eyes.topStyle === "tee";
  const sleeve = tee ? eyes.skin : eyes.top, cuff = eyes.topStyle === "bomber" ? eyes.trim : undefined;
  return (
    <group>
      <Reach from={[0.3, -0.5, -0.3]} to={[0.16, -0.2, -0.56]} sleeve={sleeve} cuff={cuff} skin={eyes.skin} />
      <Reach from={[-0.3, -0.5, -0.3]} to={[-0.16, -0.2, -0.56]} sleeve={sleeve} cuff={cuff} skin={eyes.skin} flip />
    </group>
  );
};
const posAhead = (cam: CamS, d: number): V3 => {
  const v = [cam.look[0] - cam.pos[0], cam.look[1] - cam.pos[1], cam.look[2] - cam.pos[2]], l = Math.hypot(...v);
  return [cam.pos[0] + (v[0] / l) * d, cam.pos[1] + (v[1] / l) * d, cam.pos[2] + (v[2] / l) * d];
};

export const StoryFilm: React.FC<{ c: Compiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  useCapFont();
  const t0 = n / FPS;
  const shot = c.shotAt(t0);
  const t = Math.min(Math.max(t0, shot.a), shot.b - 1e-4);
  const fx = c.fxAt(t0);
  if (fx.black) return <AbsoluteFill style={{ background: "#000" }}>{c.recipe.audio ? <Audio src={staticFile(c.recipe.audio)} /> : null}</AbsoluteFill>;
  const cam = c.camAt(t0);
  const figs = c.figsAt(t, shot);
  const cap = c.capAt(t0);
  const broken = Number.isFinite(c.brokenFrom) && t0 >= c.brokenFrom ? c.brokenFrom : null;
  const pov = c.povOf(shot);
  const p = shot.cam.preset;
  // depth of field: close-ups and POV only (focus on the subject / the held prop); wides and two-shots stay sharp
  const close = /closeup|punch_in|ots/.test(p);
  const subj = close ? figs.find((f) => f.id === shot.on) : undefined;
  const focus: V3 | undefined = pov ? (p === "pov_phone" ? posAhead(cam, 0.4) : p === "pov_press" ? posAhead(cam, 0.3) : cam.look) : subj ? headCenter(subj) : undefined;
  const blur = pov ? 2.2 : close ? 1.8 : 0;
  const ph = c.phoneAt(t0);
  const setProps = { board: c.recipe.props?.board, tray: c.tray };
  return (
    <AbsoluteFill style={{ background: SET_BG[shot.set] }}>
      {c.recipe.audio ? <Audio src={staticFile(c.recipe.audio)} /> : null}
      <PhoneCtx.Provider value={ph}>
      <View mood={MOODS[shot.set]} cam={cam} t={t} blur={blur} focus={focus} sky={false} width={c.layout.W} height={c.layout.H}>
        <StorySet id={shot.set} t={t} broken={broken} props={setProps} />
        {figs.map((st) => <Kid key={st.id} st={st} t={t} cam={cam.pos} />)}
        {pov ? <CamRig cam={cam}><PovRig kind={pov.kind} side={pov.homieSide} me={pov.me} homie={pov.homie} eyes={pov.eyes} t={t} /></CamRig> : null}
      </View>
      </PhoneCtx.Provider>
      {cap ? <StoryCaption c={cap.chunk} y={cap.y} t={t0} /> : null}
    </AbsoluteFill>
  );
};
