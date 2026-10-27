# handdrawn: vertical 1080x1920 ink-on-dark-paper (Canvas2D, deterministic)
Repo style: HiAPIAI/awesome-opus-5-5-video-styles `styles/handdrawn.md` ("Hand-drawn, sketch & comic": wobbly pencil/ink lines redrawn every few frames, limited palette = ink + ONE accent, no gradients/3D, hand-lettered labels). Dark-paper palette (#15141b), chalk ink (#f1ede2), single orange accent (#ff8a24). Original code, Caveat font (OFL).
API: `D=createHD(canvas)`; D.begin(t); D.alpha(a) for crossfades; D.poly(pts,{col,w,draw,seed,dash}) draw-on wobbly line (boil @12 fps, double pass); D.ell/rect/cloud/arrow/cross/check/snow/sparkle; D.fill(pts,col,alpha); D.txt/tag/measure.
Demo reel: fog (sources_fog.md).
