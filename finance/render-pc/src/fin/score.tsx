// credit-score-weights: "One habit makes up 35 percent." A bright hall with a five-segment SCORE TOWER built from the
// published weights of a widely used credit score (payment history 35, amounts owed 30, length of history 15, new
// credit 10, credit mix 10). Saver pays on time; the twist: the 30 % slice is how much of your limit you use (Spender's
// nearly maxed card). No brand on screen. Times from src/shorts/credit_score_weights.plan.gen.ts.
import React from "react";
import { NeonSign } from "../library/props";
import { PENNY, SAVER, SPENDER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/credit_score_weights.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, ChartBoard, CoinStack, FlipCalendar, Hall, Label, PAL } from "./props";
import { body, fitted, manual } from "./f2kit";
import SCRIPT from "./scripts/credit_score_weights";

// ------------------------------------------------------------------ the published weights (sum 100)
const SEG = [
  { k: "ON TIME", v: 35, c: "#f0b020" },
  { k: "OWED", v: 30, c: "#ff6a3a" },
  { k: "HISTORY", v: 15, c: "#3a8ae8" },
  { k: "NEW", v: 10, c: "#8a5ae0" },
  { k: "MIX", v: 10, c: "#2fb8a8" },
];
const UNIT = 0.03; // m per percentage point: the full tower is 3.0 m
const base = (n: number) => SEG.slice(0, n).reduce((a, s) => a + s.v * UNIT, 0);

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const S = { saver: 1.0, spender: 1.0, penny: 0.75 };
const TOWER: V3 = [0.9, 0, -1.7];
const P_SV: V3 = [-0.35, 0, 0.1];
const P_PN: V3 = [2.05, 0, -0.9];
const BOX: V3 = [-1.75, 0, -1.25];
const P_PAY: V3 = [-1.25, 0, -0.35];
const CAL: V3 = [-1.2, 2.55, -3.44];
const BOARD: V3 = [-3.1, 0, -3.1];
const METER: V3 = [3.0, 0, -0.9];
const P_SP: V3 = [2.1, 0, 0.3];
const MINI = [2.4, 3.15, 3.9].map((x) => [x, 0, -3.0] as V3);
const MINI_MIX = [[0.4, 0.25, 0.15, 0.1, 0.1], [0.3, 0.35, 0.1, 0.15, 0.1], [0.38, 0.28, 0.2, 0.06, 0.08]];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
void T;

// ------------------------------------------------------------------ lenses
const sv = (bust = false) => body(P_SV, S.saver, bust);
const tower = (h = 3.0): V3[] => [[TOWER[0] - 0.6, 0, TOWER[2]], [TOWER[0] + 0.6, h, TOWER[2]]];
const hook = fitted([...sv(), ...tower(), [TOWER[0] - 0.6, 3.3, TOWER[2]]], 12, 0.08, D.S01, { mood: "store", fov: 54, face: 0.55, m: 0.06 });
const seg = (n: number, dist = 2.1, yaw = 8) => manual([TOWER[0], base(n) + (SEG[n].v * UNIT) / 2, TOWER[2]], yaw, dist, 0.05, { mood: "store" });
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: hook,
  S02: seg(0, 2.0, 10),
  S03: fitted([[BOARD[0] - 1.05, 0.9, BOARD[2]], [BOARD[0] + 1.05, 2.35, BOARD[2]]], 12, 0.05, D.S03, { mood: "store" }),
  S04: fitted([...body(P_PAY, S.saver), [BOX[0] - 0.4, 0, BOX[2]], [CAL[0], CAL[1] + 0.5, CAL[2]]], 14, 0.08, D.S04, { mood: "store" }),
  S05: seg(0, 2.0, -8),
  S06: fitted(tower(base(2) + 0.2), 10, 0.05, D.S06, { mood: "store" }),
  S07: fitted(tower(base(3) + 0.2), -8, 0.05, D.S07, { mood: "store" }),
  S08: fitted(tower(base(4) + 0.2), 8, 0.05, D.S08, { mood: "store" }),
  S09: fitted([...tower(3.2), ...body(P_PN, S.penny)], -6, 0.12, D.S09, { mood: "store", fov: 54 }),
  S10: fitted(body(P_SP, S.spender, true), -18, 0.04, D.S10, { mood: "whisper", face: 0.5 }),
  S11: seg(1, 2.0, -10),
  S12: fitted([[METER[0] - 0.4, 0, METER[2]], [METER[0] + 0.4, 2.35, METER[2]], ...body(P_SP, S.spender, true)], -22, 0.06, D.S12, { mood: "whisper" }),
  S13: fitted([...body(P_PAY, S.spender), [BOX[0] - 0.4, 0, BOX[2]], [CAL[0], CAL[1] + 0.5, CAL[2]]], 18, 0.08, D.S13, { mood: "whisper" }),
  S14: manual([METER[0], 1.7, METER[2]], -14, 1.7, 0.05, { mood: "whisper" }),
  S15: fitted(tower(3.4), 6, 0.1, D.S15, { mood: "whisper" }),
  S16: fitted([[MINI[0][0] - 0.4, 0, MINI[0][2]], [MINI[2][0] + 0.4, 1.9, MINI[2][2]]], -10, 0.15, D.S16, { mood: "ending" }),
  S17: hook,
};
export const SCORE_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ scene
const shownAt = (i: number) => (i === 1 || i === 2 || i === 17 ? 5 : i <= 3 ? 0 : i <= 5 ? 1 : i === 6 ? 2 : i === 7 ? 3 : i === 8 ? 4 : 5);
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  const loop = i === 1 || i === 17;
  const n = shownAt(i);
  const actors: React.ReactNode[] = [];
  // Saver by the tower (hook, loop), paying on time (S04)
  if (loop || i === 2 || i === 4 || i === 5) {
    const p = i === 4 ? P_PAY : P_SV;
    let pose: Pose = { ...stand(p[0], p[2], i === 4 ? yawTo(p, BOX) * 0.6 + yawTo(p, [0, 0, 5]) * 0.4 : yawTo(p, TOWER) * 0.35 + yawTo(p, [0, 0, 5]) * 0.65, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "curious";
    if (loop) { pose = { ...pose, armR: 1.9, outR: 0.3, headYaw: 0.35 }; }
    if (i === 4) { pose = { ...pose, armR: 1.25 }; emo = "happy"; }
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} held={i === 4 ? { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={2} s={1.2} /> } : undefined} />);
  }
  // Penny cheers the full tower (S09)
  if (i === 9) actors.push(<Act key="pn" look={PENNY} pose={{ ...stand(P_PN[0], P_PN[2], yawTo(P_PN, [0, 0, 5]), S.penny), armL: 2.4, armR: 2.4, outL: 0.4, outR: 0.4 }} emotion="joy" s={S.penny} t={t} seed={6} />);
  // Spender with the nearly maxed card (S10-S14)
  if (i >= 10 && i <= 14) {
    const p = i === 13 ? P_PAY : P_SP;
    let pose: Pose = { ...stand(p[0], p[2], i === 13 ? yawTo(p, BOX) * 0.6 + yawTo(p, [0, 0, 5]) * 0.4 : yawTo(p, METER) * 0.3 + yawTo(p, [0, 0, 5]) * 0.7, S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "curious";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 10 || i === 12) { pose = { ...pose, armR: 1.6, outR: 0.1 }; held = { side: "R", node: <Label p={[0, 0.12, 0.05]} text={["CARD"]} w={0.3} h={0.19} bg={PAL.debt} fg="#fff4c8" /> }; emo = i === 12 ? "shock" : "sly"; }
    if (i === 13) { pose = { ...pose, armR: 1.25 }; held = { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={2} s={1.2} /> }; emo = "happy"; }
    actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} held={held} />);
  }
  const grow = (k: number) => (k < n - 1 ? 1 : i >= 4 && i <= 9 && k === n - 1 ? ss(0.0, 0.5, tau) : 1);
  const used = i === 12 ? 0.9 * ss(0.05, 0.8, tau) : i === 14 ? 0.9 + 0.05 * ss(0.0, 0.6, tau) : i >= 13 ? 0.9 : 0.25;
  const squash = i === 15 ? ss(0.35, 0.6, tau) : 0;
  const drop = i === 15 ? 1 - ss(0.0, 0.4, tau) : 0;
  const glowBase = loop || i === 2 || i === 5 ? 0.6 + 0.3 * Math.sin(t * 6) : 0.1;
  const glowOwed = i === 11 || i === 15 ? 0.7 + 0.3 * Math.sin(t * 8) : 0.1;
  let y = 0;
  const blocks: React.ReactNode[] = [];
  SEG.forEach((s, k) => {
    if (k >= n) return;
    const h = s.v * UNIT * grow(k) * (k === 1 ? 1 - 0.25 * squash : 1);
    blocks.push(<BigBlock key={k} p={[TOWER[0], y, TOWER[2]]} size={[1.2, Math.max(0.03, h), 1.0]} color={k === 1 && (i === 11 || i === 15) ? PAL.debt : s.c} text={h > 0.2 ? `${s.k} ${s.v}%` : ""} glow={k === 0 ? glowBase : k === 1 ? glowOwed : 0.1} />);
    y += h;
  });
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#e86a9a" stripe="#ffd23a">
        <NeonSign p={[0.9, 3.65, -3.42]} text="SCORE" w={1.3} h={0.4} color="#ffd23a" />
      </Hall>
      {blocks}
      {loop ? <Label p={[TOWER[0] - 0.95, 1.2, TOWER[2] + 0.55]} r={[0, 0.3, 0]} text={["?"]} w={0.3} h={0.36} bg="#ffd23a" fg={PAL.ink} /> : null}
      {n >= 5 && (i === 9 || i === 16) ? <Label p={[TOWER[0], 3.3, TOWER[2] + 0.5]} text={["= 100%"]} w={0.8} h={0.24} bg="#fff4c8" fg={PAL.ink} /> : null}
      {/* the weight that drops on the 30 % slice (S15) */}
      {i === 15 ? <BigBlock p={[TOWER[0], y + 2.0 * drop, TOWER[2]]} size={[0.9, 0.4, 0.8]} color="#3a3f58" text="LIMIT 95%" /> : null}
      {/* the bills box + the on-time calendar */}
      <BigBlock p={BOX} size={[0.7, 1.0, 0.5]} color="#3a3f58" text="BILLS" />
      <FlipCalendar p={CAL} title="DUE DATE" value="✓" sub="PAID ON TIME" color={PAL.cash} />
      {/* the board */}
      <ChartBoard p={BOARD} title="PUBLISHED SCORE BREAKDOWN" values={[]} w={2.0} h={1.3} board="#2a1a3a" />
      <Label p={[BOARD[0], 1.5, BOARD[2] + 0.05]} text={["35 · 30 · 15 · 10 · 10", "A WIDELY USED SCORE"]} w={1.75} h={0.55} bg="#2a1a3a" fg="#ffd23a" />
      {/* the card-limit meter */}
      <BigBlock p={METER} size={[0.6, 2.0, 0.3]} color="#c8c8d4" text="" />
      <BigBlock p={[METER[0], 0.05, METER[2] + 0.16]} size={[0.5, Math.max(0.03, 1.9 * used), 0.04]} color={used > 0.7 ? PAL.debt : PAL.cash} text="" glow={used > 0.7 ? 0.5 : 0.1} />
      <Label p={[METER[0], 2.25, METER[2]]} text={["LIMIT USED", `${Math.round(used * 100)}%`]} w={0.8} h={0.36} bg={PAL.night} fg={used > 0.7 ? "#ff7a6a" : "#7ee8a0"} glow={0.4} />
      {/* three small towers: weights vary by person */}
      {MINI.map((p, j) => {
        let yy = 0;
        return (
          <group key={j}>
            {MINI_MIX[j].map((w, k) => {
              const h = w * 1.6;
              const node = <BigBlock key={k} p={[p[0], yy, p[2]]} size={[0.5, h, 0.4]} color={SEG[k].c} text="" />;
              yy += h;
              return node;
            })}
          </group>
        );
      })}
      {i === 16 ? <Label p={[MINI[1][0], 2.0, MINI[1][2] + 0.3]} text={["VARIES BY PERSON"]} w={1.4} h={0.26} bg="#fff4c8" fg={PAL.ink} /> : null}
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const GOLD = "#ffd23a", RED = "#ff6a5f";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  void t;
  if (i >= 10 && i <= 15) return { lines: [{ text: "OWED 30%", color: RED }, { text: i >= 12 ? `LIMIT USED ${i === 12 ? 90 : i === 13 ? 90 : 95}%` : "HOW MUCH OF YOUR LIMIT", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
  if (i === 16) return { lines: [{ text: "WEIGHTS VARY", color: GOLD }, { text: "BY PERSON AND BY SCORE", color: "#ffffff", size: 40 }], accent: "#ffe27a" };
  const n = shownAt(i);
  const sum = SEG.slice(0, n).reduce((a, s) => a + s.v, 0);
  if (i === 1 || i === 2 || i === 17 || n <= 1) return { lines: [{ text: "ON TIME = 35%", color: GOLD }, { text: "THE BIGGEST SLICE", color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  return { lines: [{ text: SEG.slice(0, n).map((s) => s.v).join(" + ") + ` = ${sum}%`, color: GOLD }, { text: `+ ${SEG[n - 1].k} ${SEG[n - 1].v}%`, color: "#ffffff", size: 42 }], accent: "#ffe27a" };
};

export const SCORE_SPEC: FinSpec = {
  slug: "credit-score-weights",
  shots: SCORE_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "PUBLISHED WEIGHTS",
  bg: "#2a1f5a",
};
