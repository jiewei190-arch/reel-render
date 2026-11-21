// The tech3d demo objects, built from low-poly primitives (original designs, no brand marks). Object space: metres at
// scale 1, y up, the object's "front" (nose / screen / bow) as noted. Every part has an id (camera target, actions,
// labels), an explode vector and a role (shell = cut by the slice plane, inner = revealed by it).
import type { V3 } from "../blocky/motion";
import type { ObjDef, Part, Prim } from "./cutaway";
import { TP } from "./palette";

const HALF_PI = Math.PI / 2;
const along_x: V3 = [0, 0, -HALF_PI]; // a cylinder / cone's +y turned to +x
const along_mx: V3 = [0, 0, HALF_PI]; // ... turned to -x
const along_z: V3 = [HALF_PI, 0, 0]; // ... turned to +z
const flat: V3 = [-HALF_PI, 0, 0]; // a prism drawn in top view (x, -z) lies flat
const P = (id: string, prim: Prim, p: V3, color: string, o: Partial<Part> = {}): Part => ({ id, prim, p, color, ...o });

// ------------------------------------------------------------------ AIRPLANE (nose toward +x, wings along z), on its gear
const FY = 0.95; // fuselage axis height
const wing = (side: 1 | -1): [number, number][] => [[0.55, -0.38 * side], [-0.45, -0.38 * side], [-1.15, -2.55 * side], [-0.72, -2.55 * side]];
const hstab = (side: 1 | -1): [number, number][] => [[-2.05, -0.2 * side], [-2.5, -0.2 * side], [-2.85, -1.05 * side], [-2.62, -1.05 * side]];
const seats: Part[] = [0, 1, 2, 3, 4].map((k) => P(`seats${k + 1}`, { k: "box", s: [0.22, 0.24, 0.6] }, [0.9 - k * 0.5, FY - 0.08, 0], TP.blue, { role: "inner", ex: [0, 0.22, 0] }));
export const AIRPLANE: ObjDef = {
  id: "airplane", name: "Airplane", half: [3.1, 1.15, 2.6], centre: [0, 1.15, 0], grounded: true,
  slice: { axis: "z", keep: "neg", stop: 0.02 },
  parts: [
    P("fuselage", { k: "cyl", r: 0.42, h: 4.2, seg: 12 }, [0, FY, 0], TP.white, { r: along_x, role: "shell", rough: 0.45 }),
    P("stripe", { k: "box", s: [3.9, 0.07, 0.862] }, [-0.1, FY - 0.08, 0], TP.blue, { role: "shell" }),
    P("nose", { k: "cone", r: 0.42, h: 0.9, seg: 12 }, [2.55, FY, 0], "#E3E9F2", { r: along_x, role: "shell", ex: [1.5, 0, 0], label: "RADOME" }),
    P("windows", { k: "box", s: [0.32, 0.12, 0.5] }, [1.98, FY + 0.27, 0], TP.navy, { role: "shell", ex: [0.9, 0.55, 0] }),
    P("tailcone", { k: "cone", r: 0.42, h: 1.0, seg: 12 }, [-2.6, FY, 0], TP.white, { r: along_mx, role: "shell", ex: [-1.3, 0, 0] }),
    P("ilsAntenna", { k: "box", s: [0.1, 0.26, 0.36] }, [2.42, FY, 0], TP.mint, { role: "inner", ex: [0.95, 0.1, 0], label: "ILS ANTENNA", emissive: TP.mint, ei: 0.25 }),
    P("ilsReceiver", { k: "box", s: [0.26, 0.2, 0.3] }, [1.62, FY - 0.12, 0.08], TP.orange, { role: "inner", ex: [0.4, 1.35, 0], label: "RADIO RECEIVER" }),
    P("autopilot", { k: "box", s: [0.32, 0.26, 0.34] }, [1.25, FY - 0.1, -0.06], TP.mintDeep, { role: "inner", ex: [0, 1.75, 0], label: "AUTOPILOT", emissive: TP.mint, ei: 0.15 }),
    P("cabinFloor", { k: "box", s: [3.2, 0.05, 0.7] }, [-0.2, FY - 0.24, 0], "#DDE5F0", { role: "inner" }),
    ...seats,
    P("wingR", { k: "prism", pts: wing(1), depth: 0.09 }, [0, FY - 0.25, 0], TP.white, { r: flat, ex: [0, 0, 1.4], label: "WING" }),
    P("wingL", { k: "prism", pts: wing(-1), depth: 0.09 }, [0, FY - 0.25, 0], TP.white, { r: flat, ex: [0, 0, -1.4], label: "WING" }),
    P("tipR", { k: "box", s: [0.42, 0.1, 0.08] }, [-0.93, FY - 0.25, 2.55], TP.orange, { ex: [0, 0, 1.75] }),
    P("tipL", { k: "box", s: [0.42, 0.1, 0.08] }, [-0.93, FY - 0.25, -2.55], TP.orange, { ex: [0, 0, -1.75] }),
    P("engineR", { k: "cyl", r: 0.2, r2: 0.22, h: 0.78, seg: 12 }, [0.25, FY - 0.42, 1.05], "#DDE5F0", { r: along_x, ex: [0.2, -0.28, 1.95], label: "ENGINE" }),
    P("engineL", { k: "cyl", r: 0.2, r2: 0.22, h: 0.78, seg: 12 }, [0.25, FY - 0.42, -1.05], "#DDE5F0", { r: along_x, ex: [0.2, -0.28, -1.95], label: "ENGINE" }),
    P("intakeR", { k: "torus", r: 0.2, tube: 0.035, seg: 16 }, [0.66, FY - 0.42, 1.05], TP.mint, { r: [0, HALF_PI, 0], ex: [0.2, -0.28, 1.95], emissive: TP.mint, ei: 0.3 }),
    P("intakeL", { k: "torus", r: 0.2, tube: 0.035, seg: 16 }, [0.66, FY - 0.42, -1.05], TP.mint, { r: [0, HALF_PI, 0], ex: [0.2, -0.28, -1.95], emissive: TP.mint, ei: 0.3 }),
    P("vstab", { k: "prism", pts: [[-1.75, 0.3], [-2.3, 0.3], [-2.95, 1.35], [-2.55, 1.35]], depth: 0.07 }, [0, FY, 0], TP.blue, { ex: [-0.35, 1.0, 0], label: "TAIL FIN" }),
    P("hstabR", { k: "prism", pts: hstab(1), depth: 0.06 }, [0, FY + 0.12, 0], TP.blue, { r: flat, ex: [-0.3, 0.25, 1.0] }),
    P("hstabL", { k: "prism", pts: hstab(-1), depth: 0.06 }, [0, FY + 0.12, 0], TP.blue, { r: flat, ex: [-0.3, 0.25, -1.0] }),
    P("noseGear", { k: "cyl", r: 0.035, h: 0.4, seg: 6 }, [1.6, 0.35, 0], TP.greyDark, { ex: [0.7, 0, 0] }),
    P("noseWheel", { k: "cyl", r: 0.12, h: 0.1, seg: 10 }, [1.6, 0.12, 0], "#2A3447", { r: along_z, ex: [0.7, 0, 0] }),
    P("gearR", { k: "cyl", r: 0.04, h: 0.36, seg: 6 }, [-0.25, 0.36, 0.5], TP.greyDark, { ex: [0, 0, 0.85], label: "LANDING GEAR" }),
    P("gearL", { k: "cyl", r: 0.04, h: 0.36, seg: 6 }, [-0.25, 0.36, -0.5], TP.greyDark, { ex: [0, 0, -0.85] }),
    P("wheelR", { k: "cyl", r: 0.16, h: 0.14, seg: 12 }, [-0.25, 0.16, 0.5], "#2A3447", { r: along_z, ex: [0, 0, 0.85] }),
    P("wheelL", { k: "cyl", r: 0.16, h: 0.14, seg: 12 }, [-0.25, 0.16, -0.5], "#2A3447", { r: along_z, ex: [0, 0, -0.85] }),
  ],
};

// ------------------------------------------------------------------ SMARTPHONE (screen toward +z), standing; layers explode along z
const PW = 0.8, PH = 1.62, PD = 0.11;
export const SMARTPHONE: ObjDef = {
  id: "smartphone", name: "Smartphone", half: [PW / 2, PH / 2, PD / 2 + 0.01], centre: [0, PH / 2, 0], grounded: true,
  slice: { axis: "x", keep: "neg", stop: 0.1 },
  parts: [
    P("glass", { k: "box", s: [PW - 0.02, PH - 0.02, 0.012] }, [0, PH / 2, PD / 2 + 0.004], "#E6F2FF", { role: "shell", opacity: 0.35, rough: 0.1, ex: [0, 0, 1.35], label: "GLASS" }),
    P("screen", { k: "box", s: [PW - 0.06, PH - 0.06, 0.014] }, [0, PH / 2, PD / 2 - 0.012], "#ffffff", { role: "shell", tex: "phoneUi", ex: [0, 0, 0.95], label: "SCREEN", emissive: "#2F80ED", ei: 0.15 }),
    P("frameL", { k: "box", s: [0.04, PH, PD] }, [-PW / 2 + 0.02, PH / 2, 0], TP.grey, { role: "shell", rough: 0.3 }),
    P("frameR", { k: "box", s: [0.04, PH, PD] }, [PW / 2 - 0.02, PH / 2, 0], TP.grey, { role: "shell", rough: 0.3 }),
    P("frameT", { k: "box", s: [PW - 0.08, 0.04, PD] }, [0, PH - 0.02, 0], TP.grey, { role: "shell", rough: 0.3 }),
    P("frameB", { k: "box", s: [PW - 0.08, 0.04, PD] }, [0, 0.02, 0], TP.grey, { role: "shell", rough: 0.3 }),
    P("band1", { k: "box", s: [0.045, 0.03, PD + 0.004] }, [-PW / 2 + 0.02, PH * 0.82, 0], TP.orange, { role: "shell", label: "ANTENNA" }),
    P("band2", { k: "box", s: [0.045, 0.03, PD + 0.004] }, [PW / 2 - 0.02, PH * 0.18, 0], TP.orange, { role: "shell" }),
    P("board", { k: "box", s: [0.6, 0.5, 0.02] }, [0, PH * 0.71, 0.012], TP.mintDeep, { role: "inner", ex: [0, 0.05, 0.5], label: "LOGIC BOARD" }),
    P("chip", { k: "box", s: [0.16, 0.16, 0.025] }, [0.08, PH * 0.73, 0.034], TP.navy, { role: "inner", ex: [0, 0.05, 0.62], label: "PROCESSOR" }),
    P("chip2", { k: "box", s: [0.1, 0.08, 0.02] }, [-0.16, PH * 0.66, 0.032], "#2A3447", { role: "inner", ex: [0, 0.05, 0.58], label: "MEMORY" }),
    P("battery", { k: "box", s: [0.6, 0.78, 0.045] }, [0, PH * 0.3, 0], "#33435E", { role: "inner", ex: [0, -0.02, -0.5], label: "BATTERY" }),
    P("batteryTab", { k: "box", s: [0.6, 0.06, 0.047] }, [0, PH * 0.3 + 0.34, 0], TP.orange, { role: "inner", ex: [0, -0.02, -0.5] }),
    P("camera", { k: "cyl", r: 0.075, h: 0.05, seg: 14 }, [-0.22, PH * 0.84, -0.035], TP.navy, { r: along_z, role: "inner", ex: [0, 0, -0.85], label: "CAMERA" }),
    P("camera2", { k: "cyl", r: 0.06, h: 0.05, seg: 14 }, [-0.22, PH * 0.75, -0.035], TP.navy, { r: along_z, role: "inner", ex: [0, 0, -0.85] }),
    P("lensRing", { k: "torus", r: 0.075, tube: 0.012, seg: 16 }, [-0.22, PH * 0.84, -0.062], TP.mint, { role: "inner", ex: [0, 0, -0.85], emissive: TP.mint, ei: 0.3 }),
    P("speaker", { k: "box", s: [0.3, 0.06, 0.04] }, [0, 0.1, 0], "#2A3447", { role: "inner", ex: [0, -0.32, 0.15], label: "SPEAKER" }),
    P("back", { k: "box", s: [PW - 0.02, PH - 0.02, 0.012] }, [0, PH / 2, -PD / 2 + 0.004], TP.blue, { role: "shell", rough: 0.25, ex: [0, 0, -1.15], label: "BACK GLASS" }),
  ],
};

// ------------------------------------------------------------------ CARGO SHIP (bow toward +x), sitting on its keel
const hullPts: [number, number][] = [[-2.5, -0.5], [1.6, -0.5], [2.6, 0], [1.6, 0.5], [-2.5, 0.5]];
const boxCols = [TP.blue, TP.orange, TP.mint, TP.white, TP.blueDeep];
const containers: Part[] = [];
for (let k = 0; k < 5; k++) for (let lv = 0; lv < 2; lv++) {
  containers.push(P(`box${k}${lv}`, { k: "box", s: [0.56, 0.24, 0.84] }, [-1.25 + k * 0.6, 0.995 + lv * 0.25, 0], boxCols[(k * 2 + lv * 3) % boxCols.length], { ex: [(k - 2) * 0.12, 0.7 + 0.45 * lv + 0.08 * k, 0], label: k === 2 && lv === 1 ? "CONTAINERS" : undefined }));
}
export const SHIP: ObjDef = {
  id: "ship", name: "Cargo ship", half: [2.65, 0.95, 0.55], centre: [0.05, 0.95, 0], grounded: true,
  slice: { axis: "z", keep: "neg", stop: 0.0 },
  parts: [
    P("hullLow", { k: "prism", pts: hullPts, depth: 0.42 }, [0, 0.21, 0], TP.orange, { r: flat, role: "shell", rough: 0.6, label: "HULL" }),
    P("hullTop", { k: "prism", pts: hullPts, depth: 0.42 }, [0, 0.63, 0], TP.blue, { r: flat, role: "shell", rough: 0.5 }),
    P("deck", { k: "box", s: [4.1, 0.04, 0.98] }, [-0.45, 0.86, 0], "#F0F4FA", { role: "shell" }),
    P("ballastL", { k: "box", s: [3.6, 0.14, 0.36] }, [-0.3, 0.1, -0.26], "#7FB2F5", { role: "inner", label: "BALLAST TANK", ex: [0, -0.0, 0] }),
    P("ballastR", { k: "box", s: [3.6, 0.14, 0.36] }, [-0.3, 0.1, 0.26], "#7FB2F5", { role: "inner" }),
    P("hold", { k: "box", s: [2.9, 0.5, 0.86] }, [-0.1, 0.48, 0], "#E3E9F2", { role: "inner", label: "CARGO HOLD", opacity: 0.9 }),
    P("engine", { k: "box", s: [0.6, 0.38, 0.5] }, [-1.95, 0.42, 0], TP.greyDark, { role: "inner", label: "ENGINE", ex: [0, 0, 0] }),
    P("shaft", { k: "cyl", r: 0.03, h: 0.62, seg: 8 }, [-2.45, 0.2, 0], TP.grey, { r: along_x, role: "inner" }),
    P("propeller", { k: "ico", r: 0.13, detail: 0 }, [-2.68, 0.2, 0], TP.orange, { label: "PROPELLER", ex: [-0.6, 0, 0] }),
    P("rudder", { k: "box", s: [0.22, 0.36, 0.04] }, [-2.86, 0.32, 0], TP.blueDeep, { ex: [-0.8, 0, 0] }),
    P("bridge", { k: "box", s: [0.52, 0.62, 0.86] }, [-2.05, 1.19, 0], TP.white, { ex: [0, 1.1, 0], label: "BRIDGE" }),
    P("bridgeWin", { k: "box", s: [0.54, 0.1, 0.88] }, [-2.05, 1.38, 0], TP.navy, { ex: [0, 1.1, 0] }),
    P("funnel", { k: "cyl", r: 0.1, r2: 0.12, h: 0.36, seg: 10 }, [-2.2, 1.66, 0], TP.orange, { ex: [0, 1.25, 0] }),
    ...containers,
  ],
};

export const OBJECTS: Record<string, ObjDef> = { airplane: AIRPLANE, smartphone: SMARTPHONE, ship: SHIP };
export const OBJECT_IDS = Object.keys(OBJECTS);
