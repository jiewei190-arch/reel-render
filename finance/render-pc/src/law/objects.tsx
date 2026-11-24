// law3d props: procedural low-poly exhibits and paperwork. Text on them (sign wording, headlines, nameplates, folder
// tabs) comes from the recipe, so every case brings its own. No real logos, seals or mastheads: everything is generic.
//   gavel      gavel + sound block; strikes on its `hits` (and on every "gavel" action of the shot)
//   paper      a document sheet (title + ruled text lines), e.g. "COMPLAINT"
//   folder     a manila case folder with a tab label
//   photo      an instant photo (a drawn subject: "pants" | "shop" | "person" | "blank")
//   pants      a pair of trousers (the exhibit), `color`
//   sign       a shop sign with `text` (two lines max, "\n")
//   money      a banded stack of bills
//   newspaper  a newspaper page with a `text` headline
//   nameplate  a desk nameplate: `text`, or the cast entry's plate (`of`)
//   box        an evidence box with a `text` label
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { LAW_HERO_BOX, LAW_HERO_KINDS, LawHero } from "./hero";
import type { LawHeroKind, LawHeroSpec } from "./hero";
import { LP } from "./palette";

//   + the HERO PROPS (src/law/hero.tsx): statue, hand, trousers, coffee, house, car, phone, contract, cash, bigGavel,
//     evidenceBag, frame, trophy, toy, food: generic close-up props to open a Short on (KIT_LAW3D.md "Hero props")
export type LawKit = "gavel" | "paper" | "folder" | "photo" | "pants" | "sign" | "money" | "newspaper" | "nameplate" | "box" | LawHeroKind;
export const KIT_IDS: LawKit[] = ["gavel", "paper", "folder", "photo", "pants", "sign", "money", "newspaper", "nameplate", "box", ...LAW_HERO_KINDS];
export const isLawHero = (k: string): k is LawHeroKind => (LAW_HERO_KINDS as string[]).includes(k);
/** a hero prop's box in the world, with its yaw (the frame-0 opener check: tools/frame0_hero.mjs) */
export const heroBox = (kind: LawHeroKind, pl: { p: V3; yaw: number; s: number }): { c: V3; h: V3; yaw: number } => {
  const b = LAW_HERO_BOX[kind], s = pl.s, cy = Math.cos(pl.yaw), sy = Math.sin(pl.yaw);
  const lx = b.c[0] * s, lz = b.c[2] * s;
  return { c: [pl.p[0] + lx * cy + lz * sy, pl.p[1] + b.c[1] * s, pl.p[2] - lx * sy + lz * cy], h: [b.h[0] * s, b.h[1] * s, b.h[2] * s], yaw: pl.yaw };
};
/** local bounding boxes (centre above the prop's origin, half sizes) for the QA and the camera targets, scale 1 */
export const KIT_BOX: Record<LawKit, { c: V3; h: V3 }> = {
  ...LAW_HERO_BOX,
  gavel: { c: [0, 0.07, 0], h: [0.2, 0.07, 0.12] },
  paper: { c: [0, 0.005, 0], h: [0.21, 0.005, 0.28] },
  folder: { c: [0, 0.01, 0], h: [0.25, 0.01, 0.32] },
  photo: { c: [0, 0.003, 0], h: [0.12, 0.003, 0.14] },
  pants: { c: [0, 0.6, 0], h: [0.28, 0.62, 0.08] },
  sign: { c: [0, 0.4, 0], h: [0.62, 0.4, 0.03] },
  money: { c: [0, 0.05, 0], h: [0.16, 0.05, 0.08] },
  newspaper: { c: [0, 0.38, 0], h: [0.3, 0.38, 0.01] },
  nameplate: { c: [0, 0.06, 0], h: [0.26, 0.06, 0.05] },
  box: { c: [0, 0.18, 0], h: [0.3, 0.18, 0.22] },
};

const FONT = "Poppins";
const wrap = (g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) => {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let cur = "";
    for (const w of para.split(/\s+/)) { const tr = cur ? `${cur} ${w}` : w; if (g.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; }
    lines.push(cur);
  }
  lines.forEach((l, i) => g.fillText(l, x, y + i * lh - ((lines.length - 1) * lh) / 2));
};
const lines = (g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, n: number, step: number, c: string) => {
  g.fillStyle = c;
  for (let k = 0; k < n; k++) { const w = (x1 - x0) * (k % 5 === 4 ? 0.55 : 0.85 + 0.15 * Math.sin(k * 7.3)); g.fillRect(x0, y0 + k * step, w, step * 0.36); }
};

const paperTex = (title: string) => canvasTexture(`lawPaper|${title}`, 384, 512, (g, W, H) => {
  g.fillStyle = LP.paper; g.fillRect(0, 0, W, H);
  g.fillStyle = LP.ink; g.font = `800 34px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  wrap(g, title.toUpperCase(), W / 2, 62, W - 60, 38);
  g.fillStyle = LP.goldDeep; g.fillRect(40, 104, W - 80, 4);
  lines(g, 40, 132, W - 40, 15, 22, "rgba(26,20,16,0.55)");
  g.strokeStyle = "rgba(26,20,16,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(W - 170, H - 56); g.bezierCurveTo(W - 140, H - 86, W - 110, H - 30, W - 60, H - 60); g.stroke();
});
/** the folder's CASE FILE stamp: 9.3:1 on the manila (framing QA R4; was LP.red, 3.0:1) */
const FOLDER_STAMP = "#85241e";
const folderTex = (label: string) => canvasTexture(`lawFolder|${label}`, 512, 640, (g, W, H) => {
  g.fillStyle = "#D8B46E"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(120,80,30,0.12)"; for (let k = 0; k < 40; k++) g.fillRect(0, k * 16, W, 2);
  g.fillStyle = LP.paper; g.fillRect(60, 70, W - 120, 120);
  g.strokeStyle = LP.ink; g.lineWidth = 3; g.strokeRect(60, 70, W - 120, 120);
  g.fillStyle = LP.ink; g.font = `800 46px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  wrap(g, label.toUpperCase(), W / 2, 130, W - 150, 50);
  g.fillStyle = FOLDER_STAMP; g.font = `800 64px ${FONT}`; g.save(); g.translate(W / 2, H * 0.68); g.rotate(-0.18); g.strokeStyle = FOLDER_STAMP; g.lineWidth = 8; g.strokeRect(-170, -50, 340, 100); g.fillText("CASE FILE", 0, 4); g.restore();
});
const photoTex = (kind: string) => canvasTexture(`lawPhoto|${kind}`, 256, 300, (g, W, H) => {
  g.fillStyle = "#f6f3ec"; g.fillRect(0, 0, W, H);
  const iw = W - 32, ih = H - 80;
  const gr = g.createLinearGradient(0, 16, 0, 16 + ih); gr.addColorStop(0, "#5a6e8a"); gr.addColorStop(1, "#2a3448");
  g.fillStyle = gr; g.fillRect(16, 16, iw, ih);
  g.fillStyle = "#c8c0b0";
  if (kind === "pants") { g.fillStyle = "#4a4e58"; g.beginPath(); g.moveTo(88, 40); g.lineTo(168, 40); g.lineTo(178, 200); g.lineTo(140, 200); g.lineTo(128, 90); g.lineTo(116, 200); g.lineTo(78, 200); g.closePath(); g.fill(); }
  if (kind === "shop") { g.fillStyle = "#d9cbb0"; g.fillRect(40, 70, 176, 130); g.fillStyle = "#3a5a8a"; g.fillRect(56, 110, 64, 90); g.fillStyle = "#f0d070"; g.fillRect(136, 110, 64, 50); g.fillStyle = "#8a2a2a"; g.fillRect(36, 54, 184, 22); }
  if (kind === "person") { g.fillStyle = "#1a2030"; g.beginPath(); g.arc(W / 2, 90, 34, 0, Math.PI * 2); g.fill(); g.fillRect(W / 2 - 60, 130, 120, 90); }
});
const signTex = (text: string) => canvasTexture(`lawSign|${text}`, 768, 496, (g, W, H) => {
  g.fillStyle = "#F7F1E2"; g.fillRect(0, 0, W, H);
  g.strokeStyle = LP.red; g.lineWidth = 22; g.strokeRect(22, 22, W - 44, H - 44);
  g.fillStyle = LP.red; g.font = `800 96px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  wrap(g, text.toUpperCase(), W / 2, H / 2, W - 110, 104);
});
const newsTex = (text: string) => canvasTexture(`lawNews|${text}`, 384, 512, (g, W, H) => {
  g.fillStyle = "#EDE6D6"; g.fillRect(0, 0, W, H);
  g.fillStyle = LP.ink; g.font = `800 30px serif`; g.textAlign = "center"; g.fillText("THE DAILY CHRONICLE", W / 2, 40);
  g.fillRect(20, 52, W - 40, 3); g.fillRect(20, 58, W - 40, 1);
  g.font = `800 44px ${FONT}`; g.textBaseline = "middle"; wrap(g, text.toUpperCase(), W / 2, 130, W - 40, 46);
  g.fillStyle = "#8f8a80"; g.fillRect(20, 200, W * 0.52, 150);
  lines(g, W * 0.56 + 10, 204, W - 20, 7, 21, "rgba(26,20,16,0.5)");
  lines(g, 20, 372, W / 2 - 14, 6, 21, "rgba(26,20,16,0.5)");
  lines(g, W / 2 + 6, 372, W - 20, 6, 21, "rgba(26,20,16,0.5)");
});
const plateTex = (text: string) => canvasTexture(`lawPlate|${text}`, 512, 128, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, LP.goldSoft); gr.addColorStop(0.5, LP.gold); gr.addColorStop(1, LP.goldDeep);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(60,40,10,0.6)"; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16);
  g.fillStyle = "#2a1c08"; g.font = `800 56px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text.toUpperCase(), W / 2, H / 2 + 3, W - 40);
});
const boxTex = (text: string) => canvasTexture(`lawBox|${text}`, 512, 320, (g, W, H) => {
  g.fillStyle = "#B08A5A"; g.fillRect(0, 0, W, H);
  g.fillStyle = LP.paper; g.fillRect(90, 90, W - 180, 140);
  g.fillStyle = LP.ink; g.font = `800 52px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; wrap(g, text.toUpperCase(), W / 2, 160, W - 200, 56);
});
const billTex = () => canvasTexture("lawBill", 256, 128, (g, W, H) => {
  g.fillStyle = "#9DB88E"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#3f5a3a"; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16);
  g.fillStyle = "#3f5a3a"; g.beginPath(); g.ellipse(W / 2, H / 2, 34, 40, 0, 0, Math.PI * 2); g.fill();
  g.font = `800 40px ${FONT}`; g.fillText("100", 18, 50); g.fillText("100", W - 88, H - 22);
});

const mt = (tex: THREE.Texture, rough = 0.85) => plastic("#ffffff", { rough, map: tex });

export type KitSpec = { kit: LawKit; text?: string; color?: string; photo?: string; size?: V3; held?: boolean } & Partial<Omit<LawHeroSpec, "kind" | "color" | "photo" | "act" | "move">>;
/** a kit prop in its local frame (origin on the surface it rests on, front toward +z) */
export const KitMesh: React.FC<{ sp: KitSpec; t: number; strike: number; seed?: number; act?: number; move?: number }> = ({ sp, t, strike, seed = 0, act = 0, move = 0 }) => {
  if (isLawHero(sp.kit)) return <LawHero sp={{ kind: sp.kit, color: sp.color, label: sp.label, lines: sp.lines, species: sp.species, variant: sp.variant, hair: sp.hair, bandage: sp.bandage, sale: sp.sale, steam: sp.steam, photo: sp.photo, lightbar: sp.lightbar, count: sp.count, act, move }} t={t} seed={seed} />;
  switch (sp.kit) {
    case "gavel": {
      // strike: 0 rest .. 1 raised (the compiler drives it: up before a hit, slams down on it)
      const a = -1.1 * strike;
      return (
        <>
          <mesh geometry={geoOf("lawBlock", () => new THREE.CylinderGeometry(0.11, 0.12, 0.05, 18))} material={plastic(LP.woodDark, { rough: 0.4 })} position={[0.08, 0.025, 0.02]} castShadow receiveShadow />
          <mesh geometry={geoOf("lawBlockBand", () => new THREE.TorusGeometry(0.115, 0.008, 4, 24))} material={plastic(LP.gold, { rough: 0.3, emissive: LP.goldDeep, ei: 0.25 })} position={[0.08, 0.04, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
          {/* held (a strike with no judge in the shot): a robed forearm comes in from the judge's side and grips the
              handle end, so the raised gavel never floats on its own (it read as a detached forearm in a close-up) */}
          {sp.held ? (
            <group position={[-0.3, 0.12, 0.02]}>
              <mesh geometry={geoOf("lawHeldSleeve", () => { const g = new THREE.CylinderGeometry(0.06, 0.075, 0.9, 8); g.translate(0, -0.45, 0); return g; })} material={plastic("#15151c", { rough: 0.8, flat: true })} rotation={[-0.5, 0, -1.85]} castShadow />
              <mesh geometry={geoOf("lawHeldCuff", () => new THREE.CylinderGeometry(0.062, 0.062, 0.04, 8))} material={plastic("#f4f1ea", { rough: 0.7, flat: true })} position={[-0.03, 0.008, -0.004]} rotation={[-0.5, 0, -1.85]} />
              <mesh geometry={geoOf("lawHeldHand", () => new THREE.IcosahedronGeometry(0.05, 1))} material={plastic("#d9a07a", { rough: 0.7, flat: true })} position={[0.02, 0, 0]} />
            </group>
          ) : null}
          {/* the gavel pivots at the handle end (x -0.3), head over the block */}
          <group position={[-0.3, 0.12, 0.02]} rotation={[0, 0, -a]}>
            <mesh geometry={geoOf("lawGHandle", () => new THREE.CylinderGeometry(0.014, 0.019, 0.38, 8))} material={plastic(LP.woodLight, { rough: 0.45 })} position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
            <mesh geometry={geoOf("lawGHead", () => new THREE.CylinderGeometry(0.045, 0.045, 0.17, 12))} material={plastic(LP.woodDark, { rough: 0.35 })} position={[0.38, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow />
            {[-1, 1].map((k) => <mesh key={k} geometry={geoOf("lawGBand", () => new THREE.CylinderGeometry(0.047, 0.047, 0.018, 12))} material={plastic(LP.gold, { rough: 0.3, emissive: LP.goldDeep, ei: 0.3 })} position={[0.38, -0.02, k * 0.05]} rotation={[Math.PI / 2, 0, 0]} />)}
          </group>
        </>
      );
    }
    case "paper": return <mesh geometry={geoOf("lawSheet", () => new THREE.BoxGeometry(0.42, 0.006, 0.56))} material={mt(paperTex(sp.text ?? "COMPLAINT"))} position={[0, 0.003, 0]} rotation={[0, 0, 0]} castShadow receiveShadow />;
    case "folder":
      return (
        <>
          <mesh geometry={geoOf("lawFolderB", () => new THREE.BoxGeometry(0.5, 0.012, 0.64))} material={plastic("#C9A15C", { rough: 0.9 })} position={[0, 0.006, 0]} castShadow />
          <mesh geometry={geoOf("lawFolderT", () => new THREE.BoxGeometry(0.5, 0.006, 0.64))} material={mt(folderTex(sp.text ?? "CASE"))} position={[0.005, 0.016, 0.005]} />
          <mesh geometry={geoOf("lawFolderTab", () => new THREE.BoxGeometry(0.16, 0.012, 0.05))} material={plastic("#C9A15C", { rough: 0.9 })} position={[0.12, 0.012, -0.34]} />
          <mesh geometry={geoOf("lawFolderPaper", () => new THREE.BoxGeometry(0.46, 0.004, 0.6))} material={plastic(LP.paper, { rough: 0.9 })} position={[0.02, 0.011, -0.015]} rotation={[0, 0.04, 0]} />
        </>
      );
    case "photo": return <mesh geometry={geoOf("lawPhotoM", () => new THREE.BoxGeometry(0.24, 0.004, 0.28))} material={mt(photoTex(sp.photo ?? "pants"), 0.4)} position={[0, 0.002, 0]} castShadow />;
    case "pants": {
      // trousers on a coat hanger, cuffs at the origin (they hang or float as an exhibit), front toward +z
      const c = sp.color ?? "#3c414c";
      const m = plastic(c, { rough: 0.85, flat: true });
      const dk = plastic("#1d2028", { rough: 0.8 });
      return (
        <group>
          <mesh geometry={geoOf("lawPWaist", () => new THREE.BoxGeometry(0.46, 0.07, 0.13))} material={plastic(c, { rough: 0.7 })} position={[0, 1.0, 0]} castShadow />
          <mesh geometry={geoOf("lawPSeat", () => { const g = new THREE.CylinderGeometry(0.33, 0.31, 0.2, 4); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.42); return g; })} material={m} position={[0, 0.87, 0]} castShadow />
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.115, 0.8, 0]} rotation={[0, 0, k * 0.04]}>
              <mesh geometry={geoOf("lawPLeg", () => { const g = new THREE.CylinderGeometry(0.15, 0.115, 0.76, 4, 2); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.62); g.translate(0, -0.38, 0); return g; })} material={m} castShadow />
              <mesh geometry={geoOf("lawPCrease", () => new THREE.BoxGeometry(0.01, 0.7, 0.01))} material={dk} position={[0, -0.38, 0.072]} />
              <mesh geometry={geoOf("lawPCuff", () => { const g = new THREE.CylinderGeometry(0.122, 0.122, 0.06, 4); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.64); return g; })} material={plastic(c, { rough: 0.7 })} position={[0, -0.76, 0]} />
            </group>
          ))}
          {[-0.16, -0.05, 0.05, 0.16].map((x) => <mesh key={x} geometry={geoOf("lawPLoop", () => new THREE.BoxGeometry(0.018, 0.07, 0.01))} material={dk} position={[x, 1.0, 0.068]} />)}
          <mesh geometry={geoOf("lawPButton", () => new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8))} material={plastic(LP.gold, { rough: 0.3 })} position={[0, 1.0, 0.07]} rotation={[Math.PI / 2, 0, 0]} />
          {/* the hanger: a bar, two arms and a hook */}
          <mesh geometry={geoOf("lawHBar", () => new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6))} material={plastic(LP.woodLight, { rough: 0.4 })} position={[0, 1.04, 0]} rotation={[0, 0, Math.PI / 2]} />
          {[-1, 1].map((k) => <mesh key={k} geometry={geoOf("lawHArm", () => new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6))} material={plastic(LP.woodLight, { rough: 0.4 })} position={[k * 0.12, 1.11, 0]} rotation={[0, 0, k * 1.02]} />)}
          <mesh geometry={geoOf("lawHHook", () => new THREE.TorusGeometry(0.04, 0.006, 4, 12, Math.PI * 1.4))} material={plastic("#c8c8d0", { rough: 0.2 })} position={[0, 1.22, 0]} />
        </group>
      );
    }
    case "sign":
      return (
        <>
          <mesh geometry={geoOf("lawSignB", () => new THREE.BoxGeometry(1.24, 0.8, 0.04))} material={plastic(LP.woodDark, { rough: 0.6 })} position={[0, 0.4, -0.01]} castShadow />
          <mesh geometry={geoOf("lawSignF", () => new THREE.PlaneGeometry(1.16, 0.74))} material={mt(signTex(sp.text ?? "SIGN"), 0.6)} position={[0, 0.4, 0.012]} />
        </>
      );
    case "money":
      return (
        <>
          {Array.from({ length: 7 }, (_, k) => <mesh key={k} geometry={geoOf("lawBill", () => new THREE.BoxGeometry(0.31, 0.012, 0.15))} material={mt(billTex())} position={[0.006 * Math.sin(k * 3), 0.006 + k * 0.013, 0.004 * Math.cos(k * 2)]} rotation={[0, 0.04 * Math.sin(k * 5), 0]} castShadow />)}
          <mesh geometry={geoOf("lawBand", () => new THREE.BoxGeometry(0.06, 0.098, 0.154))} material={plastic(LP.gold, { rough: 0.5 })} position={[0, 0.049, 0]} />
        </>
      );
    case "newspaper": return <mesh geometry={geoOf("lawNewsM", () => new THREE.BoxGeometry(0.6, 0.76, 0.006))} material={mt(newsTex(sp.text ?? "HEADLINE"))} position={[0, 0.38, 0]} rotation={[0, 0, 0.02 * Math.sin(t * 0.9)]} castShadow />;
    case "nameplate":
      return (
        <>
          <mesh geometry={geoOf("lawPlateW", () => { const s = new THREE.Shape(); s.moveTo(-0.06, 0); s.lineTo(0.06, 0); s.lineTo(0.02, 0.12); s.lineTo(-0.02, 0.12); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.52, bevelEnabled: false }); g.translate(0, 0, -0.26); g.rotateY(Math.PI / 2); return g; })} material={plastic(LP.woodDark, { rough: 0.5, flat: true })} castShadow />
          <mesh geometry={geoOf("lawPlateG", () => new THREE.PlaneGeometry(0.48, 0.105))} material={mt(plateTex(sp.text ?? "PLAINTIFF"), 0.3)} position={[0, 0.06, 0.042]} rotation={[-0.32, 0, 0]} />
        </>
      );
    case "box":
      return (
        <>
          <mesh geometry={rbox(0.6, 0.36, 0.44, 0.01)} material={plastic("#B08A5A", { rough: 0.95 })} position={[0, 0.18, 0]} castShadow receiveShadow />
          <mesh geometry={geoOf("lawBoxLbl", () => new THREE.PlaneGeometry(0.5, 0.31))} material={mt(boxTex(sp.text ?? "EVIDENCE"))} position={[0, 0.18, 0.222]} />
          <mesh geometry={rbox(0.62, 0.06, 0.46, 0.01)} material={plastic("#A07A4A", { rough: 0.95 })} position={[0, 0.37, 0]} />
        </>
      );
  }
};
