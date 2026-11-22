// Smooth plastic materials (MeshStandardMaterial, low metalness, soft specular): the blocky look has no toon ramp and
// no ink. Bounded caches keyed by value strings (never by Object3D.id), so every tab builds identical objects.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** bounded caches for long renders: when a cache is full, the least recently used half is dropped AND disposed (frees
 *  its GPU memory: geometries and textures; three.js re-uploads a disposed object if a mounted mesh still uses it). The objects are pure
 *  functions of their key, so eviction never changes a pixel. */
const lruGet = <T,>(m: Map<string, T>, key: string): T | undefined => {
  const v = m.get(key);
  if (v !== undefined) { m.delete(key); m.set(key, v); }
  return v;
};
const lruMake = <T extends { dispose: () => void }>(m: Map<string, T>, cap: number, free = true) => {
  if (m.size <= cap) return;
  let n = Math.ceil(m.size / 2);
  for (const [k, v] of m) { if (n-- <= 0) break; m.delete(k); if (free) v.dispose(); }
};
const mats = new Map<string, THREE.MeshStandardMaterial>();
export type PlasticOpts = { rough?: number; flat?: boolean; map?: THREE.Texture; alphaMap?: THREE.Texture; transparent?: boolean; opacity?: number; decal?: boolean; side?: THREE.Side; emissive?: string; ei?: number };
export const plastic = (color: string, o: PlasticOpts = {}) => {
  const key = [color, o.rough ?? 0.5, o.flat ? 1 : 0, o.map?.uuid ?? "", o.alphaMap?.uuid ?? "", o.transparent ? 1 : 0, o.opacity ?? 1, o.decal ? 1 : 0, o.side ?? 0, o.emissive ?? "", o.ei ?? 0].join("|");
  let m = lruGet(mats, key);
  if (!m) {
    lruMake(mats, 400, false); // materials: dropped, not disposed (a dispose can force a shader recompile)
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.5,
      metalness: 0,
      flatShading: o.flat ?? false,
      map: o.map ?? null,
      alphaMap: o.alphaMap ?? null,
      transparent: o.transparent || o.decal || false,
      opacity: o.opacity ?? 1,
      depthWrite: !(o.transparent || o.decal),
      side: o.side ?? THREE.FrontSide,
      emissive: o.emissive ?? "#000000",
      emissiveIntensity: o.ei ?? 0,
    });
    if (o.decal) {
      // decals sit >= 4 mm proud AND pull forward in depth: never z-fight with the surface under them
      m.polygonOffset = true;
      m.polygonOffsetFactor = -2;
      m.polygonOffsetUnits = -2;
    }
    mats.set(key, m);
  }
  return m;
};

/** BOARD TEXT ("sign") material: an unlit, opaque decal (alpha-tested corners) that marks its pixels with scene alpha 0.1.
 *  The post grade (engine/post/shaders.ts, uBoard) passes marked pixels through as their declared sRGB colour: no
 *  scene lighting, exposure, highlight shoulder, mood lift, saturation, split tone or bloom. A board then renders at
 *  the contrast the framing QA computes from its declared colours (tools/framing_qa.mjs rule R4). Before this, a lit
 *  decal under the store mood measured 2.2-3.0:1 for a declared 4.5:1 board. */
const signs = new Map<string, THREE.MeshBasicMaterial>();
export const signMat = (map: THREE.Texture) => {
  const key = map.uuid;
  let m = lruGet(signs, key);
  if (!m) {
    lruMake(signs, 200, false);
    m = new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, transparent: false, toneMapped: false, fog: false });
    m.polygonOffset = true;
    m.polygonOffsetFactor = -2;
    m.polygonOffsetUnits = -2;
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace("#include <dithering_fragment>", "#include <dithering_fragment>\n  gl_FragColor.a = 0.1;");
    };
    m.customProgramCacheKey = () => "board-sign";
    signs.set(key, m);
  }
  return m;
};

const geos = new Map<string, THREE.BufferGeometry>();
export const geoOf = (key: string, make: () => THREE.BufferGeometry) => {
  let g = lruGet(geos, key);
  if (!g) {
    lruMake(geos, 400);
    g = make();
    geos.set(key, g);
  }
  return g;
};
/** a box with softly rounded edges (plastic parts catch a highlight on the edge) */
export const rbox = (w: number, h: number, d: number, r: number) =>
  geoOf(`rb${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}|${r.toFixed(4)}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)));

const texs = new Map<string, THREE.CanvasTexture>();
/** a cached canvas texture (drawn once per key) */
export const canvasTexture = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) => {
  let t = lruGet(texs, key);
  if (!t) {
    lruMake(texs, 120);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    texs.set(key, t);
  }
  return t;
};
