# lantern (paper-cut shadow box, vertical 1080x1920, Canvas2D)
- Box window BOX (940x1350) inside a wooden lamp frame; subtitle strip below y~1500.
- makeSheet(w,h,draw,{col}): cut-card layer = shape + fibre grain + warm top rim + dark bottom band. putSheet adds soft cast shadow.
- glow() = emissive additive light (windows, moon). moon(g,x,y,r,theta): 0 new, pi full, waxing lit right.
- Parallax: each sheet offset by camera*depth; slide-in/out = paper on a stick. Back layers light, front dark.
- Pitfalls: sheets are 1100x1510 each (memory ok for ~5); keep tags inside BOX; fill box background so slides never show the frame.
- Reel: t_phases.js (reference).
