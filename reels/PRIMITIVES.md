# Reusable pieces (read this INSTEAD of reading style source files)

Goal: Claude writes a short scene body per phrase and calls tested parts. Do not rewrite helpers.

## Tools (run these, don't hand-do them)
- `python3 -I newreel.py <name>`  -> scaffolds t_<name>.js (neon template, one V[i] stub per phrase with the spoken line as a comment).
  For another style, swap the createNeon import line for that style's factory (see table).
- `python3 -I contact.py <name>`  -> contact_<name>.jpg: ONE labelled 4x3 sheet (first frame, one per narration beat, last frame). Look at THIS, not individual frames. Open single frames only for tiles that look wrong.
- `lib/lib2d.js` primitives via `P = prims(S)`: text, shape, line, circ, rrect, arrow(draw-on), node (flowchart box), bar, counter (count-up), timeline, rings (pulse/sound/heat); easing: seg, ss, eo, bounce, lerp, hash; `phases(TL)` gives per-phrase {i, lt, u, fi, fo}.
- Existing pipeline unchanged: voice2.py -> mix2.py -> mkhtml.py -> rq.sh -> enc_hq.sh.

## Style modules (repo-style looks; factory = how to start a scene file)
| style | module | factory / example reel to copy from |
|---|---|---|
| Generative & neon | styles/neon/neon.js | createNeon(canvas) -> R.begin/finish, S ctx. example t_bats.js |
| Explainers & data viz | styles/dataviz/dataviz.js | createDV, text, rich, drawOn, arrow, rrect, count. example t_fridge.js |
| Flat cartoon | styles/cartoon/cartoon.js | example t_hiccup.js |
| Collage / cutout | styles/collage/collage.js | example t_vax.js |
| Retro / CRT terminal | styles/crt/crt.js | example t_boot.js |
| Low-poly | styles/lowpoly/lowpoly.js | example t_skyscr.js |
| Hand-drawn sketch | styles/handdrawn/handdrawn.js | example t_fog.js |
Each style folder may have STYLE_NOTES.md with palette/fonts/motion rules.

## Rule for new scenes
1. Use a primitive if one fits. 2. If you must write a new reusable drawing function (e.g. a gear, a wave, a thermometer), put it in lib/lib2d.js (or the style module) and add one line here, so the next reel gets it free.
