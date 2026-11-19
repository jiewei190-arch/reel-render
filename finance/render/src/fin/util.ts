// Small helpers shared by the stagings.
import type { Plan } from "./engine";

/** start time (s) of a shot by id */
export const T = (plan: Plan, id: string) => {
  const s = plan.SHOTS.find((x) => x.id === id);
  if (!s) throw new Error(`no shot ${id}`);
  return s.t;
};
/** the id of the shot that contains time t */
export const shotAt = (plan: Plan, t: number) => {
  let id = plan.SHOTS[0].id;
  for (const s of plan.SHOTS) if (t >= s.t) id = s.id;
  return id;
};
export const idx = (id: string) => parseInt(id.slice(1), 10);
export const money = (v: number, cents = true) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
