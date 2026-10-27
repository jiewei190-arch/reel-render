# cartoon: vertical 1080x1920 flat 2D cartoon (Canvas2D, deterministic)
Recipe: bold rounded shapes, thick dark outlines (10-16 px), flat fills with ONE shade tone (crescent lower-right), squash-and-stretch on every move (C.xf with sx/sy), big expressive eyes (C.eyes moods), bright saturated palette, simple layered backgrounds. Fonts: Fredoka 700 and Lilita One (OFL, from styles/popup/fonts/fonts.css).
API: `C=createCT(canvas)`; C.begin(t,bg); C.shape(pathFn, fill, {shade,lw,off}); path builders C.rr/ell/blob/poly/star; C.xf(x,y,sx,sy,rot,fn); C.eyes/mouth/cheeks; C.txt/pill/burst/arrow/tube; C.bg/ground; C.iris(u,cx,cy,fn) wipe. Helpers: boing(t,t0) squash wobble, backOut, ss, eo, ramp, hash.
Pitfalls: arcs in rr() use arcTo so r<=min(w,h)/2; keep shade `off` small on small shapes; outline widths scale with xf, so counter-scale if needed.
Demo reel: hiccup (facts in sources_hiccup.md).
