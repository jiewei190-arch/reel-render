# urbansketch (pen & wash), vertical 1080x1920, 2D canvas
Own port of the grammar of the Lemo urban-sketch style (technique only, no assets). Font: Caveat (OFL, see fonts/).
API: createUS(canvas) -> R with begin(t)/finish(), pen(pts,{w,col,prog,seed,boil,over,gaps}), line, rect (4 strokes), circle, bez, dash, wash(pts,col,{a,seed,bloom,shade,dx,dy}), rectPts/circPts/fillCirc, text(s,x,y,{size,col,reveal,rot}), measure.
Rules: line before colour; wash is misregistered 3-5 px with a darker pooled edge; one coloured thing per beat; page-turn between pages; figures boil at 12 fps (boil:true).
Cost: about 0.1 s per frame, cheap. Used by t_elev.js.
