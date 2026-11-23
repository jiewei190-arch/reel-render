// cyber3d HERO PROPS: generic, labelled props a recipe places and closes up on, so the opening frame shows what the
// heist is about (a phone lighting up with a bank alert, an ATM spitting cash, a USB stick). All procedural ORIGINAL
// designs: no real logo, trademark artwork or bank / network marks. Each takes `color` (the neon accent: cyan by
// default, magenta, or red ONLY for an alert / money leaving), a short `label` (plain text: "BANK ALERT", "USB",
// "BTC"; brand names are refused at compile time), `lines` (the body text of phone / laptop / doc), `at`, `scale`
// (or `s`) and `spin`.
// HERO SCALE: about 0.5-1.6 m (2-3x life size) so the kit's closeUp / hookZoom lenses fill the frame at their default
// distances. The look: dark steel bodies, emissive neon edges and screens (the bloom picks them up).
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { docTex, fitText, hmat, HERO_FONT, wrap } from "../library/hero";
import { CP } from "./palette";
import { neon } from "./sets";

export type CyberHeroKind = "phone" | "laptop" | "envelope" | "card" | "usb" | "server" | "atm" | "padlock" | "coin" | "doc";
export const CYBER_HERO_KINDS: CyberHeroKind[] = ["phone", "laptop", "envelope", "card", "usb", "server", "atm", "padlock", "coin", "doc"];
export const CYBER_HERO_DEFAULT: Record<CyberHeroKind, { color: string; label: string; what: string }> = {
  phone: { color: CP.red, label: "BANK ALERT", what: "a phone with a notification (lines = its text)" },
  laptop: { color: CP.red, label: "ACCESS DENIED", what: "a laptop with a warning screen (lines = its text)" },
  envelope: { color: CP.cyan, label: "INVOICE", what: "an email envelope with the subject on it" },
  card: { color: CP.cyan, label: "DEBIT", what: "a bank card (no network logo)" },
  usb: { color: CP.magenta, label: "USB", what: "a USB stick with a blinking LED" },
  server: { color: CP.cyan, label: "SERVER 07", what: "a server rack, LEDs blinking" },
  atm: { color: CP.red, label: "CASH", what: "an ATM pushing out cash (red = money leaving)" },
  padlock: { color: CP.cyan, label: "LOCKED", what: "a padlock" },
  coin: { color: "#F5B324", label: "BTC", what: "a crypto coin standing on its edge" },
  doc: { color: CP.cyan, label: "WIRE ORDER", what: "a document: headline + body lines" },
};
export const CYBER_HERO_BOX: Record<CyberHeroKind, { c: V3; h: V3 }> = {
  phone: { c: [0, 0.46, 0], h: [0.22, 0.45, 0.07] },
  laptop: { c: [0, 0.31, -0.08], h: [0.5, 0.31, 0.38] },
  envelope: { c: [0, 0.29, 0], h: [0.41, 0.28, 0.06] },
  card: { c: [0, 0.3, 0], h: [0.43, 0.29, 0.06] },
  usb: { c: [0, 0.38, 0], h: [0.12, 0.38, 0.07] },
  server: { c: [0, 0.8, 0], h: [0.36, 0.8, 0.31] },
  atm: { c: [0, 0.78, 0.02], h: [0.42, 0.78, 0.34] },
  padlock: { c: [0, 0.36, 0], h: [0.26, 0.36, 0.1] },
  coin: { c: [0, 0.33, 0], h: [0.31, 0.31, 0.05] },
  doc: { c: [0, 0.43, 0], h: [0.33, 0.43, 0.08] },
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const PLANE = () => geoOf("chPlane", () => new THREE.PlaneGeometry(1, 1));
const CYL = (rt: number, rb: number, h: number, seg = 40) => geoOf(`chCyl${rt}|${rb}|${h}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
const steel = (c: string = CP.steel, rough = 0.35) => hmat(c, { rough, metal: 0.3 });
/** a thin glowing edge strip (emissive, picked up by the bloom) */
const Edge: React.FC<{ p: V3; s: V3; c: string; o?: number }> = ({ p, s, c, o = 1 }) => <mesh geometry={geoOf("chBox", () => new THREE.BoxGeometry(1, 1, 1))} material={neon(c, o)} position={p} scale={s} />;
/** the four edges of a w x h front face at depth z */
const Frame: React.FC<{ w: number; h: number; y: number; z: number; c: string; t?: number }> = ({ w, h, y, z, c, t = 0.012 }) => (
  <>
    <Edge p={[0, y + h / 2, z]} s={[w, t, t]} c={c} />
    <Edge p={[0, y - h / 2, z]} s={[w, t, t]} c={c} />
    <Edge p={[-w / 2, y, z]} s={[t, h, t]} c={c} />
    <Edge p={[w / 2, y, z]} s={[t, h, t]} c={c} />
  </>
);

/** a dark glass screen: an alert banner (label + lines) on a phone, a warning panel on a laptop / ATM */
const screenTex = (kind: "phone" | "laptop" | "atm", label: string, lines: readonly string[], col: string) => canvasTexture(`chScr|${kind}|${label}|${lines.join("¦")}|${col}`, kind === "phone" ? 360 : 640, kind === "phone" ? 720 : 400, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0A1226"); gr.addColorStop(1, "#05070D"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // scan lines
  g.fillStyle = "rgba(25,230,255,0.05)"; for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
  g.textBaseline = "middle"; g.textAlign = "center";
  if (kind === "phone") {
    g.fillStyle = "#EAF6FF"; g.font = `bold ${Math.round(W * 0.2)}px ${HERO_FONT}`; g.fillText("03:17", W / 2, H * 0.14);
    // the notification card
    const x = W * 0.06, y = H * 0.25, w = W * 0.88, h = H * 0.52;
    g.fillStyle = "rgba(10,15,28,0.95)"; g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.roundRect(x, y, w, h, 26); g.fill(); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(x + 44, y + 48, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#05070D"; g.font = `bold 30px ${HERO_FONT}`; g.fillText("!", x + 44, y + 50);
    g.textAlign = "left"; g.fillStyle = col; fitText(g, label, 44, w - 100); g.fillText(label, x + 82, y + 50);
    g.fillStyle = "#EAF6FF"; g.font = `${26}px ${HERO_FONT}`;
    const body = lines.length ? lines : ["New sign-in to your account.", "Transfer of $9,800 sent.", "Not you? Tap to secure."];
    let yy = y + 110;
    for (const l of body.slice(0, 4)) for (const s of wrap(g, l, w - 40)) { if (yy > y + h - 20) break; g.fillText(s, x + 22, yy); yy += 38; }
  } else {
    // a warning: a big triangle, the label, the lines
    const cx = W / 2, ty = H * (kind === "atm" ? 0.3 : 0.3), r = H * 0.17;
    g.strokeStyle = col; g.lineWidth = H * 0.025; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx, ty - r); g.lineTo(cx + r * 1.1, ty + r * 0.8); g.lineTo(cx - r * 1.1, ty + r * 0.8); g.closePath(); g.stroke();
    g.fillStyle = col; g.font = `bold ${Math.round(r * 1.1)}px ${HERO_FONT}`; g.fillText("!", cx, ty + r * 0.2);
    fitText(g, label, Math.round(H * 0.15), W * 0.9); g.fillText(label, cx, H * 0.66);
    g.fillStyle = "#EAF6FF"; g.font = `${Math.round(H * 0.06)}px ${HERO_FONT}`;
    const body = lines.length ? lines : [kind === "atm" ? "DISPENSING..." : "Your files are locked.", kind === "atm" ? "TAKE YOUR CASH" : "Pay to unlock: 72:00:00"];
    body.slice(0, 2).forEach((l, i) => { fitText(g, l, Math.round(H * 0.06), W * 0.9, "normal"); g.fillText(l, cx, H * (0.8 + i * 0.09)); });
  }
});
const labelTex = (key: string, label: string, col: string, W: number, H: number, bg = "#0A0F1C", px = 0.6) => canvasTexture(`chLab|${key}|${label}|${col}|${W}x${H}|${bg}`, W, H, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col;
  fitText(g, label, Math.round(H * px), W * 0.88); g.fillText(label, W / 2, H * 0.54);
});

export const CyberHero: React.FC<{ kind: CyberHeroKind; color?: string; label?: string; lines?: string[]; t: number; seed: number }> = ({ kind, color, label, lines, t, seed }) => {
  const D = CYBER_HERO_DEFAULT[kind];
  const col = color ?? D.color;
  const lab = (label ?? D.label).toUpperCase();
  const pulse = 0.75 + 0.25 * Math.sin(t * 4 + seed);
  const glass = hmat("#05070D", { rough: 0.08, metal: 0.2 });
  switch (kind) {
    case "phone": {
      const tex = screenTex("phone", lab, lines ?? [], col);
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.08, 0, 0]}>
          <mesh geometry={rbox(0.44, 0.88, 0.05, 0.06)} material={steel(CP.ink, 0.25)} position={[0, 0.44, 0]} castShadow />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 0.44, 0.0255]} scale={[0.4, 0.82, 1]} />
          <Frame w={0.445} h={0.885} y={0.44} z={0} c={col} t={0.01} />
          <pointLight position={[0, 0.5, 0.9]} color={col} intensity={0.6 * pulse} distance={2.4} decay={2} />
        </group>
      );
    }
    case "laptop": {
      const tex = screenTex("laptop", lab, lines ?? [], col);
      const keys = canvasTexture("chKeys", 256, 160, (g, W, H) => { g.fillStyle = "#0A0F1C"; g.fillRect(0, 0, W, H); for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { g.fillStyle = hash(r * 13 + c) < 0.12 ? "#19E6FF" : "#1A2436"; g.fillRect(6 + c * 19, 8 + r * 20, 15, 15); } });
      return (
        <group>
          <mesh geometry={rbox(1.0, 0.04, 0.68, 0.02)} material={steel()} position={[0, 0.02, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, keys)} position={[0, 0.0405, -0.08]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.86, 0.36, 1]} />
          <Edge p={[0, 0.02, 0.34]} s={[1.0, 0.008, 0.008]} c={col} />
          <group position={[0, 0.04, -0.33]} rotation={[-0.28, 0, 0]}>
            <mesh geometry={rbox(1.0, 0.64, 0.03, 0.02)} material={steel()} position={[0, 0.32, 0]} castShadow />
            <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 0.33, 0.0155]} scale={[0.92, 0.575, 1]} />
            <Frame w={0.94} h={0.595} y={0.33} z={0.017} c={col} t={0.008} />
          </group>
          <pointLight position={[0, 0.45, 0.2]} color={col} intensity={1.0 * pulse} distance={2.4} decay={2} />
        </group>
      );
    }
    case "envelope": {
      const tex = canvasTexture(`chEnv|${lab}|${col}`, 820, 540, (g, W, H) => {
        g.fillStyle = "#0B1424"; g.fillRect(0, 0, W, H);
        g.strokeStyle = col; g.lineWidth = 10; g.lineJoin = "round";
        g.beginPath(); g.moveTo(14, 14); g.lineTo(W / 2, H * 0.52); g.lineTo(W - 14, 14); g.stroke();
        g.globalAlpha = 0.5; g.beginPath(); g.moveTo(14, H - 14); g.lineTo(W * 0.36, H * 0.48); g.moveTo(W - 14, H - 14); g.lineTo(W * 0.64, H * 0.48); g.stroke(); g.globalAlpha = 1;
        g.fillStyle = "rgba(5,7,13,0.92)"; g.fillRect(W * 0.1, H * 0.6, W * 0.8, H * 0.28);
        g.fillStyle = "#EAF6FF"; g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, lab, Math.round(H * 0.17), W * 0.74); g.fillText(lab, W / 2, H * 0.745);
        g.fillStyle = col; g.beginPath(); g.arc(W * 0.86, H * 0.18, H * 0.1, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#05070D"; g.font = `bold ${Math.round(H * 0.12)}px ${HERO_FONT}`; g.fillText("@", W * 0.86, H * 0.185);
      });
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.06, 0, 0]}>
          <mesh geometry={rbox(0.82, 0.54, 0.03, 0.01)} material={steel(CP.panel)} position={[0, 0.27, 0]} castShadow />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 0.27, 0.0155]} scale={[0.8, 0.52, 1]} />
          <Frame w={0.825} h={0.545} y={0.27} z={0} c={col} t={0.012} />
          <pointLight position={[0, 0.3, 0.9]} color={col} intensity={0.5 * pulse} distance={2.2} decay={2} />
        </group>
      );
    }
    case "card": {
      const tex = canvasTexture(`chCard|${lab}|${col}`, 860, 540, (g, W, H) => {
        const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#111A30"); gr.addColorStop(1, "#05070D"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.strokeStyle = col; g.globalAlpha = 0.35; g.lineWidth = 3; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(W * 0.45 + k * 40, 0); g.lineTo(W * 0.45 + k * 40, H * 0.3); g.lineTo(W * 0.6 + k * 40, H * 0.45); g.stroke(); } g.globalAlpha = 1;
        g.fillStyle = "#D9B65A"; g.beginPath(); g.roundRect(W * 0.08, H * 0.36, W * 0.14, H * 0.22, 10); g.fill();
        g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = col; fitText(g, lab, Math.round(H * 0.16), W * 0.5); g.fillText(lab, W * 0.08, H * 0.18);
        g.fillStyle = "#EAF6FF"; g.font = `bold ${Math.round(H * 0.11)}px ${HERO_FONT}`; g.fillText("5104  2231  8890  0442", W * 0.08, H * 0.74);
        g.font = `${Math.round(H * 0.07)}px ${HERO_FONT}`; g.fillText("VALID THRU 09/28", W * 0.08, H * 0.88);
      });
      return (
        <group position={[0, 0.03, 0]} rotation={[-0.12, 0, 0]}>
          <mesh geometry={rbox(0.86, 0.54, 0.018, 0.04)} material={glass} position={[0, 0.27, 0]} castShadow />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 0.27, 0.0095]} scale={[0.84, 0.525, 1]} />
          <Frame w={0.865} h={0.545} y={0.27} z={0} c={col} t={0.008} />
        </group>
      );
    }
    case "usb": {
      const tex = labelTex("usb", lab, CP.white, 256, 128, "#0A0F1C", 0.55);
      const led = Math.sin(t * 9 + seed) > 0 ? 1 : 0.25;
      return (
        <group>
          <mesh geometry={rbox(0.22, 0.5, 0.11, 0.04)} material={steel(CP.ink, 0.3)} position={[0, 0.25, 0]} castShadow />
          <mesh geometry={rbox(0.15, 0.2, 0.06, 0.008)} material={hmat("#C5CCD6", { rough: 0.18, metal: 0.55 })} position={[0, 0.6, 0]} castShadow />
          {[-0.035, 0.035].map((x) => <mesh key={x} geometry={PLANE()} material={neon("#05070D", 1)} position={[x, 0.63, 0.031]} scale={[0.03, 0.03, 1]} />)}
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 0.26, 0.0555]} rotation={[0, 0, Math.PI / 2]} scale={[0.36, 0.17, 1]} />
          <Edge p={[0, 0.25, 0.056]} s={[0.012, 0.44, 0.004]} c={col} o={0.4} />
          <mesh geometry={geoOf("chLed", () => new THREE.SphereGeometry(0.018, 10, 8))} material={neon(col, led)} position={[0, 0.05, 0.056]} />
          <pointLight position={[0, 0.1, 0.2]} color={col} intensity={0.6 * led} distance={1.2} decay={2} />
        </group>
      );
    }
    case "server": {
      const tex = labelTex("srv", lab, col, 512, 96, "#05070D", 0.62);
      return (
        <group>
          <mesh geometry={rbox(0.72, 1.6, 0.62, 0.02)} material={steel(CP.ink, 0.45)} position={[0, 0.8, 0]} castShadow receiveShadow />
          {Array.from({ length: 9 }, (_, k) => {
            const y = 0.18 + k * 0.145;
            return (
              <group key={k}>
                <mesh geometry={rbox(0.64, 0.12, 0.02, 0.005)} material={steel(CP.steel, 0.3)} position={[0, y, 0.31]} />
                {Array.from({ length: 6 }, (_, j) => { const on = Math.sin(t * (5 + hash(k * 7 + j) * 9) + k + j * 1.7) > 0.1; const c = col === CP.red && (k + j) % 4 === 0 ? CP.red : (k + j) % 3 === 0 ? CP.magenta : CP.cyan; return <mesh key={j} geometry={PLANE()} material={neon(c, on ? 1 : 0.2)} position={[0.08 + j * 0.035, y, 0.322]} scale={[0.018, 0.018, 1]} />; })}
                <mesh geometry={PLANE()} material={neon("#1A2436", 1)} position={[-0.17, y, 0.322]} scale={[0.22, 0.04, 1]} />
              </group>
            );
          })}
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 1.53, 0.312]} scale={[0.6, 0.11, 1]} />
          <Frame w={0.725} h={1.6} y={0.8} z={0.31} c={col} t={0.012} />
          <pointLight position={[0, 1.0, 1.5]} color={col} intensity={0.45} distance={3.2} decay={2} />
        </group>
      );
    }
    case "atm": {
      const tex = screenTex("atm", lab, lines ?? [], col);
      const keyTex = canvasTexture("chKeypad", 192, 256, (g, W, H) => { g.fillStyle = "#0A0F1C"; g.fillRect(0, 0, W, H); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold 34px ${HERO_FONT}`; ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].forEach((k, i) => { const x = 32 + (i % 3) * 64, y = 32 + Math.floor(i / 3) * 64; g.fillStyle = "#1A2436"; g.fillRect(x - 26, y - 26, 52, 52); g.fillStyle = "#EAF6FF"; g.fillText(k, x, y + 2); }); });
      const out = 0.5 + 0.5 * Math.sin(t * 2.2 + seed); // the bills slide out and back
      return (
        <group>
          <mesh geometry={rbox(0.84, 1.56, 0.6, 0.04)} material={steel(CP.steel, 0.4)} position={[0, 0.78, 0]} castShadow receiveShadow />
          <mesh geometry={rbox(0.84, 0.1, 0.68, 0.03)} material={steel(CP.ink, 0.4)} position={[0, 1.52, 0.03]} />
          <Edge p={[0, 1.47, 0.36]} s={[0.84, 0.014, 0.01]} c={col} />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 1.2, 0.302]} scale={[0.64, 0.4, 1]} />
          <Frame w={0.66} h={0.42} y={1.2} z={0.303} c={col} t={0.01} />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, keyTex)} position={[-0.16, 0.78, 0.302]} scale={[0.24, 0.32, 1]} />
          <mesh geometry={rbox(0.2, 0.03, 0.04, 0.01)} material={steel(CP.ink)} position={[0.2, 0.86, 0.31]} />
          <Edge p={[0.2, 0.86, 0.332]} s={[0.16, 0.008, 0.004]} c={CP.cyan} />
          {/* the cash slot: bills sliding out, lit from inside */}
          <mesh geometry={rbox(0.44, 0.06, 0.06, 0.01)} material={steel(CP.ink)} position={[0, 0.5, 0.31]} />
          <Edge p={[0, 0.5, 0.342]} s={[0.4, 0.012, 0.004]} c={col} />
          {[0, 1, 2].map((k) => <mesh key={k} geometry={rbox(0.36, 0.012, 0.2, 0.003)} material={hmat("#7FBF7A", { rough: 0.7, emissive: col, ei: 0.15 })} position={[0, 0.49 + k * 0.014, 0.34 + 0.12 * out + k * 0.02]} rotation={[0.25, 0, 0]} castShadow />)}
          <pointLight position={[0, 0.9, 1.4]} color={col} intensity={0.5 * pulse} distance={3} decay={2} />
        </group>
      );
    }
    case "padlock": {
      const tex = labelTex("lock", lab, col, 512, 160, "#0A0F1C", 0.58);
      return (
        <group>
          <mesh geometry={geoOf("chShackle", () => new THREE.TorusGeometry(0.15, 0.04, 14, 32, Math.PI))} material={hmat("#C5CCD6", { rough: 0.15, metal: 0.55 })} position={[0, 0.44, 0]} castShadow />
          {[-0.15, 0.15].map((x) => <mesh key={x} geometry={CYL(0.04, 0.04, 0.12, 14)} material={hmat("#C5CCD6", { rough: 0.15, metal: 0.55 })} position={[x, 0.4, 0]} />)}
          <mesh geometry={rbox(0.5, 0.42, 0.18, 0.05)} material={steel(CP.steel, 0.3)} position={[0, 0.21, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, tex)} position={[0, 0.27, 0.0905]} scale={[0.42, 0.13, 1]} />
          <mesh geometry={geoOf("chKeyhole", () => new THREE.CircleGeometry(0.025, 16))} material={neon(col, pulse)} position={[0, 0.12, 0.0905]} />
          <Edge p={[0, 0.07, 0.0905]} s={[0.012, 0.07, 0.002]} c={col} o={pulse} />
          <Frame w={0.5} h={0.42} y={0.21} z={0.09} c={col} t={0.008} />
        </group>
      );
    }
    case "coin": {
      const face = canvasTexture(`chCoin|${lab}|${col}`, 512, 512, (g, W, H) => {
        const gr = g.createRadialGradient(W * 0.4, H * 0.35, 10, W / 2, H / 2, W / 2); gr.addColorStop(0, "#FFE9A8"); gr.addColorStop(0.6, col); gr.addColorStop(1, "#8A5A12"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.strokeStyle = "rgba(90,55,10,0.7)"; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H / 2, W * 0.42, 0, Math.PI * 2); g.stroke();
        // generic circuit traces (no real currency mark)
        g.lineWidth = 6; for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * W * 0.3, H / 2 + Math.sin(a) * W * 0.3); g.lineTo(W / 2 + Math.cos(a) * W * 0.4, H / 2 + Math.sin(a) * W * 0.4); g.stroke(); }
        g.fillStyle = "#5A370A"; g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, lab, Math.round(H * 0.26), W * 0.56); g.fillText(lab, W / 2, H * 0.52);
      });
      return (
        <group position={[0, 0.33, 0]} rotation={[0, 0, 0.0]}>
          <mesh geometry={CYL(0.3, 0.3, 0.06, 64)} material={hmat(col, { rough: 0.25, metal: 0.55 })} rotation={[Math.PI / 2, 0, 0]} castShadow />
          {[1, -1].map((sd) => <mesh key={sd} geometry={geoOf("chCoinF", () => new THREE.CircleGeometry(0.29, 64))} material={hmat("#ffffff", { map: face, rough: 0.25, metal: 0.4, emissive: col, ei: 0.12 })} position={[0, 0, sd * 0.0305]} rotation={[0, sd > 0 ? 0 : Math.PI, 0]} />)}
          <mesh geometry={geoOf("chCoinRim", () => new THREE.TorusGeometry(0.3, 0.012, 8, 64))} material={neon(CP.cyan, 0.5 + 0.3 * pulse)} position={[0, 0, 0.031]} />
        </group>
      );
    }
    case "doc": {
      const tex = docTex(`cy${seed}`, label ?? D.label, lines, { paper: "#E9F1F8", ink: "#0A0F1C", accent: col === CP.cyan ? "#0A8FB0" : col, rule: "#6F86A8" });
      const scan = 0.06 + ((t * 0.35 + seed * 0.1) % 1) * 0.74;
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.1, 0, 0]}>
          <mesh geometry={rbox(0.66, 0.86, 0.008, 0.003)} material={hmat("#E9F1F8", { rough: 0.8 })} position={[0, 0.43, 0]} castShadow />
          <mesh geometry={PLANE()} material={hmat("#ffffff", { map: tex, rough: 0.8, emissive: "#ffffff", emissiveMap: tex, ei: 0.35 })} position={[0, 0.43, 0.0045]} scale={[0.64, 0.84, 1]} />
          <Edge p={[0, scan, 0.008]} s={[0.66, 0.006, 0.002]} c={col} o={0.8} />
          <Frame w={0.665} h={0.865} y={0.43} z={0} c={col} t={0.006} />
        </group>
      );
    }
  }
  return null;
};
