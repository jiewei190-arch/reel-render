// Shared helpers for the biz3d, cyber3d and law3d HERO PROPS (src/biz/hero.tsx, src/cyber/hero.tsx, src/law/hero.tsx): a small material cache
// with metalness, canvas text that fits its box, the document texture (a headline + body lines, never blank paper),
// and the label rule (a short ORIGINAL generic word; never a real brand name or logo artwork).
// Also used by the law3d hero props (src/law/hero.tsx). Nothing here is used by Block Money or tech3d.
import * as THREE from "three";
import { canvasTexture } from "../blocky/mat";

/** the canvas font for prop text (a system font, so a texture never caches a fallback drawn before a web font loads) */
export const HERO_FONT = "'DejaVu Sans', Arial, Helvetica, sans-serif";
export const HERO_SERIF = "'DejaVu Serif', Georgia, serif";

const mats = new Map<string, THREE.MeshStandardMaterial>();
export type HeroMatOpts = { rough?: number; metal?: number; map?: THREE.Texture; emissive?: string; ei?: number; emissiveMap?: THREE.Texture; opacity?: number; side?: THREE.Side };
/** a cached MeshStandardMaterial (value-keyed, deterministic); metalness is kept low (the sets have no env map) */
export const hmat = (color: string, o: HeroMatOpts = {}) => {
  const key = [color, o.rough ?? 0.45, o.metal ?? 0, o.map?.uuid ?? "", o.emissive ?? "", o.ei ?? 0, o.emissiveMap?.uuid ?? "", o.opacity ?? 1, o.side ?? 0].join("|");
  let m = mats.get(key);
  if (!m) {
    if (mats.size > 400) mats.clear();
    m = new THREE.MeshStandardMaterial({
      color, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0, map: o.map ?? null,
      emissive: o.emissive ?? "#000000", emissiveIntensity: o.ei ?? 0, emissiveMap: o.emissiveMap ?? null,
      transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, depthWrite: (o.opacity ?? 1) >= 1, side: o.side ?? THREE.FrontSide,
    });
    mats.set(key, m);
  }
  return m;
};

/** set the largest bold font (<= px) at which `text` fits in maxW; returns the size used */
export const fitText = (g: CanvasRenderingContext2D, text: string, px: number, maxW: number, weight = "bold", family = HERO_FONT) => {
  let s = px;
  g.font = `${weight} ${s}px ${family}`;
  const w = g.measureText(text).width;
  if (w > maxW) { s = Math.max(8, Math.floor(px * (maxW / w))); g.font = `${weight} ${s}px ${family}`; }
  return s;
};
/** wrap words into lines no wider than maxW (with the current font) */
export const wrap = (g: CanvasRenderingContext2D, text: string, maxW: number) => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/).filter(Boolean)) { const nx = cur ? `${cur} ${w}` : w; if (g.measureText(nx).width > maxW && cur) { out.push(cur); cur = w; } else cur = nx; }
  if (cur) out.push(cur);
  return out;
};

/** the default body lines of a document when the recipe gives none (plain, generic, readable) */
export const DOC_LINES = ["Dear Board,", "We have reviewed the offer", "and the numbers below.", "Our answer is final.", "Signed, the Office"];

export type DocLook = { paper: string; ink: string; accent: string; rule: string; glow?: boolean };
/** a document page: an accent bar, the HEADLINE big (wrapped, up to 3 lines), then the body lines in real text, a
 *  signature line. Body text is always drawn: blank paper is not allowed (KIT_BIZ3D / KIT_CYBER3D "Hero props"). */
export const docTex = (key: string, headline: string, lines: readonly string[] | undefined, look: DocLook, W = 640, H = 840) =>
  canvasTexture(`hDoc|${key}|${headline}|${(lines ?? []).join("¦")}|${look.paper}|${look.ink}|${look.accent}`, W, H, (g) => {
    g.fillStyle = look.paper; g.fillRect(0, 0, W, H);
    const m = W * 0.08;
    g.fillStyle = look.accent; g.fillRect(m, m * 0.8, W - 2 * m, H * 0.018);
    g.fillStyle = look.ink; g.textBaseline = "top"; g.textAlign = "left";
    g.font = `bold ${Math.round(W * 0.12)}px ${HERO_FONT}`;
    let hl = wrap(g, headline.toUpperCase(), W - 2 * m);
    if (hl.length > 3) { fitText(g, headline.toUpperCase(), Math.round(W * 0.12), (W - 2 * m) * 3 * 0.92); hl = wrap(g, headline.toUpperCase(), W - 2 * m).slice(0, 3); }
    const hs = parseInt(g.font.split(" ")[1], 10);
    let y = m * 0.8 + H * 0.05;
    for (const l of hl) { g.fillText(l, m, y); y += hs * 1.08; }
    y += H * 0.03;
    g.fillStyle = look.rule; g.fillRect(m, y, W - 2 * m, 3); y += H * 0.035;
    const body = lines && lines.length ? lines : DOC_LINES;
    const bs = Math.round(W * 0.056);
    g.fillStyle = look.ink;
    for (const l of body.slice(0, 7)) { fitText(g, l, bs, W - 2 * m, "normal"); g.fillText(l, m, y); y += bs * 1.45; if (y > H * 0.86) break; }
    g.fillStyle = look.rule; g.fillRect(W * 0.5, H * 0.9, W * 0.42, 3);
    g.font = `italic ${Math.round(W * 0.04)}px ${HERO_SERIF}`; g.fillStyle = look.ink; g.fillText("signature", W * 0.5, H * 0.915);
  });

/** famous marks a label must not spell (a brand NAME on a product in the brand's colours reads as its trade dress).
 *  Plain generic words are the rule: COLA, NEW, CLASSIC, CEREAL, FILM, SALE. The company card may still name a company. */
const MARKS = ["COCA", "COKE", "PEPSI", "NETFLIX", "BLOCKBUSTER", "KODAK", "FUJI", "APPLE", "IPHONE", "SAMSUNG", "NOKIA", "BLACKBERRY", "NIKE", "ADIDAS", "REEBOK", "MCDONALD", "BURGER KING", "WENDY", "STARBUCKS", "DUNKIN", "KELLOGG", "NESTLE", "AMAZON", "GOOGLE", "FACEBOOK", "MICROSOFT", "VISA", "MASTERCARD", "AMEX", "PAYPAL", "BITCOIN", "TWITTER", "TESLA", "SONY", "NINTENDO", "WALMART", "IKEA", "GUCCI", "PRADA", "LEGO", "DISNEY", "INSTAGRAM", "TIKTOK", "YOUTUBE", "UBER", "AIRBNB"];
/** the label rule: <= 14 characters and <= 2 words, plain generic text, no famous brand name. null = ok, else the error */
export const heroLabelError = (label: string | undefined, kind: string): string | null => {
  if (label === undefined) return null;
  const s = String(label).trim();
  if (!s) return kind === "letter" || kind === "doc" ? `label is empty: a ${kind} needs its headline (blank paper is not allowed)` : null; // "" = an unlabelled product
  if (s.length > 14) return `label "${s}" is ${s.length} characters: keep it <= 14 so it reads at phone size on the ${kind} (e.g. "COLA", "NEW", "SALE")`;
  if (s.split(/\s+/).length > 2) return `label "${s}" has more than 2 words: one or two generic words read best on the ${kind}`;
  const up = s.toUpperCase().replace(/[^A-Z ]/g, " ").replace(/\s+/g, " ").trim(), ws = up.split(" ");
  const hit = MARKS.find((mk) => (mk.includes(" ") ? up.includes(mk) : ws.some((w) => w.startsWith(mk))));
  if (hit) return `label "${s}" spells a real brand (${hit}): use an original generic word ("COLA", "NEW", "FILM", "SALE"); brand names belong on the company card, never on a product prop`;
  return null;
};
