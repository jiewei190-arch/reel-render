// s009 "Scientists really call it spaghettification." — Dr Lin (lab coat, green lanyard) at the chalkboard, tired and deadpan,
// writes SPAGHETTIFICATION letter by letter on the word; the noodle hero (still stretched) stands sheepish in the corner.
import { registerShot } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, point, nod } from '/kits/toon3d/rig.js';
import { at, labScene, tag, ease, prog, clamp } from './_lib.js';

registerShot('s009', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) {
    s.model.update(t);
    const sc = at(info, 'Scientists', 0.14), sp = at(info, 'spaghettification', 1.38);
    const write = prog(t, sp, sp + 1.0); s.board.write(write);
    // Lin: finger up on "Scientists", turns to the board and writes (right arm reaching to the board), then turns back, deadpan
    const turn = ease.inOut(prog(t, sp - 0.3, sp)) * (1 - ease.inOut(prog(t, sp + 1.05, sp + 1.3)));
    const fingerUp = ease.out(prog(t, sc, sc + 0.25)) * (1 - turn);
    s.lin.rotation.y = -0.35 - turn * 1.1; s.lin.position.x = 1.25 - turn * 0.2;
    const scribble = Math.sin(t * 22) * 0.06 * (write > 0 && write < 1 ? 1 : 0);
    let p = addPose(POSE.relaxed, idle(t, 4));
    p = mixPose(p, { ...p, armL: [1.9, 0.1, 0], elbowL: 1.2, headTilt: 0.08 }, fingerUp);
    p = mixPose(p, { ...p, armR: [1.35 + scribble, 0.35 + scribble, 0], elbowR: 0.25, headTurn: -0.2 }, turn);
    s.lin.pose(p);
    const done = ease.inOut(prog(t, sp + 1.1, sp + 1.3));
    s.lin.face(mixExpr({ ...EXPR.bored, talk: 0, pupil: [-0.2, 0] }, { ...EXPR.deadpan, lid: 0.55, pupil: [0, 0], mouth: 'smirk' }, done), t);
    // the hero: still a noodle (stretched), embarrassed, rubbing the back of his head, eyes sliding away
    s.hero.scale.set(0.8, 1.5, 0.8);
    s.hero.pose(addPose({ ...POSE.stand, armR: [0.6, 1.9, 0.6], elbowR: 2.4, headTilt: 0.15, headNod: 0.1 }, idle(t, 9)));
    s.hero.face({ ...EXPR.worried, mouth: 'wavy', pupil: [0.6 + 0.2 * Math.sin(t * 1.5), -0.3], lid: 0.35 }, t);
    camMove(s.stage, t, [[0, { pos: [-0.35, 2.5, 11.4], look: [-0.3, 2.05, -0.6], fov: 40 }], [info.dur, { pos: [-0.3, 2.45, 10.6], look: [-0.3, 2.05, -0.6], fov: 40 }]], ease.sine);
  },
  overlay(g, t, info) { const sp = at(info, 'spaghettification', 1.38); tag(g, 'A REAL SCIENCE WORD', ease.out(prog(t, sp + 1.05, sp + 1.25)), 0.11, { size: 50 }); },
});
