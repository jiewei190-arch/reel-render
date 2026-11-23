// CC0 prop library loader (public/assets/cc0, built by tools/cc0_build.py; licences in public/assets/cc0/LICENSES.md).
//   <Asset id="tv" p={[0, 0.98, -0.6]} yaw={0.2} />
// Every asset is normalised on load: scaled to metres (catalogue `scale`), its pivot moved to the middle of its footprint
// with the bottom on y = 0 (so `p` is the point on the floor/counter it stands on), and turned so its front faces +z
// (the lens side in every set). Props and sets only; the cast stays our own Blocky.tsx characters.
// Loading is a pure function of the id: a module cache of GLTF promises + delayRender, so no frame renders before its
// models are in (Remotion renders frames in parallel tabs; each tab loads once).
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { V3 } from "../../blocky/motion";
import { CATALOG } from "./assets.catalog.gen";
import type { AssetEntry } from "./assets.catalog.gen";

export type { AssetEntry };
export const ASSETS: Record<string, AssetEntry> = Object.fromEntries(CATALOG.map((a) => [a.id, a]));
export type AssetId = string;
/** catalogue lookup (throws on a typo, so a recipe never silently drops a prop) */
export const assetOf = (id: AssetId): AssetEntry => {
  const a = ASSETS[id];
  if (!a) throw new Error(`no CC0 asset "${id}" (see public/assets/cc0/catalog.json)`);
  return a;
};
/** ids with all of the given tags */
export const assetsTagged = (...tags: string[]) => CATALOG.filter((a) => tags.every((t) => a.tags.includes(t))).map((a) => a.id);
/** final size [w, h, d] in metres at scale 1 (for layout and the clip-QA boxes) */
export const assetSize = (id: AssetId, s = 1): V3 => {
  const z = assetOf(id).size;
  return [z[0] * s, z[1] * s, z[2] * s];
};
/** a QA box (centre + half sizes) for an asset standing at p, turned by yaw (rad), scaled by s */
export const assetBox = (id: AssetId, p: V3, s = 1, yaw = 0) => {
  const [w, h, d] = assetSize(id, s);
  return { name: id, c: [p[0], p[1] + h / 2, p[2]] as V3, h: [w / 2, h / 2, d / 2] as V3, yaw: yaw || undefined };
};

const cache = new Map<string, Promise<THREE.Group>>();
const loaded = new Map<string, THREE.Group>();
const load = (url: string) => {
  let p = cache.get(url);
  if (!p) {
    p = new Promise<THREE.Group>((res, rej) =>
      new GLTFLoader().load(
        url,
        (g) => {
          g.scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            m.castShadow = true;
            m.receiveShadow = true;
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            for (const x of mats) {
              const s = x as THREE.MeshStandardMaterial;
              if (s.isMeshStandardMaterial) {
                // match the kit's plastic look: no metal, soft highlights
                s.metalness = 0;
                s.roughness = Math.max(0.5, s.roughness);
                if (s.map) s.map.colorSpace = THREE.SRGBColorSpace;
              }
            }
          });
          loaded.set(url, g.scene);
          res(g.scene);
        },
        undefined,
        rej,
      ),
    );
    cache.set(url, p);
  }
  return p;
};
/** load the given assets up front; returns true once they are all in. Call it OUTSIDE the ThreeCanvas and mount the
 *  canvas only when it is true: the canvas draws on frame changes only, so a model that arrives later would not show. */
export const usePreload = (ids: AssetId[]) => {
  const key = [...new Set(ids)].sort().join(",");
  const urls = key ? key.split(",").map((id) => staticFile(assetOf(id).file)) : [];
  const [ready, setReady] = React.useState(() => urls.every((u) => loaded.has(u)));
  const h = React.useMemo(() => (ready ? null : delayRender(`cc0 preload ${key}`, { timeoutInMilliseconds: 120000 })), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (h === null) return;
    Promise.all(urls.map(load))
      .then(() => { setReady(true); continueRender(h); })
      .catch((e) => { console.error(e); setReady(true); continueRender(h); });
  }, [h]); // eslint-disable-line react-hooks/exhaustive-deps
  return ready;
};
/** LONG-FORM: load only the assets a window of shots needs (the current shot and the next), instead of every asset of
 *  a 10-minute video up front. The frame is held (delayRender) until they are in; the caller keeps its canvas MOUNTED
 *  (re-creating a WebGL canvas costs over a minute of shader compiles on a software GL), renders the scene only once
 *  `ready`, and calls `done()` after the canvas has redrawn with the models (the canvas only redraws on frame changes
 *  by itself). Models that left the window are released once more than `keep` are held (GPU buffers disposed). */
const failed = new Set<string>();
const doneHandles = new Set<number>();
export const useAssetWindow = (ids: AssetId[], keep = 48) => {
  const urls = [...new Set(ids)].sort().map((id) => staticFile(assetOf(id).file));
  const key = urls.join(",");
  const isIn = (u: string) => loaded.has(u) || failed.has(u);
  const [tick, bump] = React.useState(0);
  const h = React.useMemo(() => (urls.some((u) => !isIn(u)) ? delayRender(`cc0 window ${key}`) : null), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    release(new Set(urls), keep);
    if (h === null) return;
    Promise.all(urls.map((u) => load(u).catch((e) => { console.error(e); failed.add(u); })))
      .then(() => bump((x) => x + 1));
  }, [h, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = React.useCallback(() => { if (h !== null && !doneHandles.has(h)) { doneHandles.add(h); continueRender(h); } }, [h]);
  return { ready: urls.every(isIn), tick, done };
};
/** drop the oldest loaded models that are not in `inUse` until at most `keep` remain (dispose geometry/materials/maps) */
const release = (inUse: Set<string>, keep: number) => {
  if (loaded.size <= keep) return;
  for (const [u, g] of [...loaded]) {
    if (loaded.size <= keep) break;
    if (inUse.has(u)) continue;
    loaded.delete(u);
    cache.delete(u);
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry?.dispose();
      for (const x of Array.isArray(m.material) ? m.material : [m.material]) {
        const sm = x as THREE.MeshStandardMaterial;
        sm.map?.dispose();
        sm.dispose();
      }
    });
  }
};
const useModel = (url: string) => {
  const [, bump] = React.useState(0);
  const g = loaded.get(url) ?? null;
  // one delayRender per url that is not in yet (created during render, so the frame can never be captured early)
  const h = React.useMemo(() => (loaded.has(url) ? null : delayRender(`cc0 ${url}`)), [url]);
  React.useEffect(() => {
    if (h === null) return;
    load(url).then(() => { bump((x) => x + 1); continueRender(h); }).catch((e) => { console.error(e); continueRender(h); });
  }, [url, h]);
  return g;
};

export type AssetProps = {
  id: AssetId;
  /** the floor point it stands on (bottom centre), metres */
  p?: V3;
  /** extra turn about y (rad), on top of the catalogue's +z facing */
  yaw?: number;
  /** extra rotation (rad) about its own bottom centre, applied after yaw: [x, y, z] */
  r?: V3;
  /** uniform scale on top of the catalogue's metre scale; or [x, y, z] (squash/stretch about the floor point) */
  s?: number | V3;
  /** tint every material toward this colour (0..1 via tintK) */
  tint?: string;
  tintK?: number;
  /** emissive glow 0..1 (a gulp / a highlight) */
  glow?: number;
  /** hide while keeping the load (no pop-in when it appears) */
  visible?: boolean;
};
/** one CC0 model, floor-pivoted, facing +z */
export const Asset: React.FC<AssetProps> = ({ id, p = [0, 0, 0], yaw = 0, r = [0, 0, 0], s = 1, tint, tintK = 0.5, glow = 0, visible = true }) => {
  const a = assetOf(id);
  const src = useModel(staticFile(a.file));
  const obj = React.useMemo(() => {
    if (!src) return null;
    const c = src.clone(true);
    if (tint || glow) {
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const one = (x: THREE.Material) => {
          const s2 = (x as THREE.MeshStandardMaterial).clone();
          if (tint) s2.color.lerp(new THREE.Color(tint), tintK);
          if (glow) { s2.emissive = new THREE.Color(tint ?? "#ffcf40"); s2.emissiveIntensity = glow; }
          return s2;
        };
        m.material = Array.isArray(m.material) ? m.material.map(one) : one(m.material);
      });
    }
    return c;
  }, [src, tint, tintK, glow]);
  if (!obj) return null;
  const k = a.scale;
  const cx = (a.min[0] + a.max[0]) / 2, cz = (a.min[2] + a.max[2]) / 2;
  const sv: V3 = typeof s === "number" ? [s, s, s] : s;
  return (
    <group position={p} rotation={[0, yaw, 0]} visible={visible}>
      <group rotation={r} scale={sv}>
        <group rotation={[0, (a.yaw * Math.PI) / 180, 0]} scale={k}>
          <group position={[-cx, -a.min[1], -cz]}>
            <primitive object={obj} />
          </group>
        </group>
      </group>
    </group>
  );
};
