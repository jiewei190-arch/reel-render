# iso: a cute isometric infographic in a vertical 1080×1920 frame

Files: iso.js (the kit), demo.html (the octopus proof), still.py (renders stills; serves reels/ on :8791), fonts/ (Fredoka and others, OFL, from lemo core).
Run: `python3 styles/iso/still.py styles/iso/demo.html <outprefix> 2.6 9.5`, from inside reels/styles/iso.

## API (iso.js)
- `makeStage(el)` returns `{scene, cam, setCam(zoom,tx,ty,tz,panY), project(v3)->[x,y] in CSS px}`. True iso ortho camera on the (1,1,1) diagonal; frustum height = zoom (11–13 for a close-up, 17–20 for the diorama).
- `block(w,h,d,hex)`: a three-tone box sitting on y=0. Top is warm-lightened, the left (+z) face is base, the right (+x) face is cool-darkened, with white hairline edges.
- `hollowBox(w,h,d,hex)` plus `lidOpen(box,k)` and `cutaway(box,k)`: an open box whose lid hinges back and whose two front walls sink, to show what is inside.
- `sprite(tex,h)` plus `popScale(s,k)`: Fluent Emoji billboards anchored at the bottom, with a back-out pop.
- `vial(r,h,hex,fill)`, `lattice(size,step,y,color)`.
- `makeOverlay(root).label(html,'L'|'R'|'C',up,run,cls)` then `.at([x,y],k)`: a pin ring, then an ink leader that draws on, then a card. 'C' puts the card centred above (up>0) or below (up<0) the leader.
- `isotypeRow(root,src,n).set(t,t0,gap)`: icons pop in one at a time; give one sound per icon.

## Palette
Paper #FBF4EA with dot lattice #E9DCC9, ink #3A2E44, coral #FF8A73, lavender #B9A6F2, mint #8FDCC2, sky #8CC8F5, sun #FFC861, pink #FF9EC4, blue #4F7BEA. One hue per meaning: hearts are red, blood is blue, the body is lavender.
Type: Fredoka 600 for titles, kicker and cards; Poppins for small print. The subtitle is a map-label card at the bottom with an iso chip.

## Cost
About 250–330 ms per frame at 1080×1920 (swiftshader, 2 CPUs). That is roughly 75× cheaper than Lemo's shader demos (about 22 s per frame). An 80 s reel at 30 fps is about 10 min per worker.

## Pitfalls
- Vertical frames are narrow: a 7-unit board needs zoom ≥ 17. Put labels above or below ('C') rather than sideways near the edges.
- The lid swings toward the top-right, so keep mascots back-left (−x) or they get hidden.
- Sprites ignore lighting, so keep them from crossing walls. They render on top (renderOrder 5, no depthWrite).
- Call `renderer.render` before projecting labels, so the matrices are fresh.
- Lemo demo engines are hard-wired to 16:9; don't use them for vertical output, use this kit.
