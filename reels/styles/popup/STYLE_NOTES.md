# popup: vertical paper pop-up book (1080x1920, Canvas2D)

Ported from the Lemo paper-popup grammar (MIT; technique only, no code or assets copied). Files: popup.js (kit), demo.html (`?scene=hook|inside`, wombat proof), still.py (`python3 still.py <scene> <t> <out.jpg>`), fonts/ (Fredoka, OFL).

## API (popup.js)
- `card(key, w, h, draw(g,w,h), {border,pad})`: ink art -> white border + cardboard edge + paper grain + blurred cut-out shadow; cached by key.
- `pop(g, cd, bx, by, k, {scale, flip, sway, lean, shadowA})`: stands the card up around its bottom edge (k 0 flat to 1 upright; feed `back(ramp(...))` for overshoot). `foldTab()` draws the little V-fold the card hangs from.
- `desk(g)`, `book(g)`, `board(g,key,art,k)` (standing back board on the fold line, `BOOK.fold` = 980), `sign(...)` (cardboard sign on strings, swing angle), `subtitle(g,text)` (`**bold**` = accent), `label(g,text,x,y,{sub})`.
- Art helpers: `wobble`, `ink`, `crescent` (hard shade crescent), `bez`. Easing: `ramp`, `ease`, `back`.
- Pop-up order: back to front with growing delay (board 0.25 s, trees 0.8-1.1 s, hero 1.5 s, props 1.8-2.1 s, sign drops 2.3 s).

## Palette
Desk #a9764a, cover #2f6f73, page #f6ecd6, ink #4a2f2a (never black), border #fff8ea, edge #c9bfae, sky #9fd8e8, greens #8fcf86/#5fb36f/#3f9a63, accent coral #ff7a59, gut pinks #ffb7c4/#c9556f, poop browns #7a5334/#5f3e27.

## Cost
Per-frame seek: about 70-190 ms at 1080x1920 (first frame after a scene change up to ~270 ms because cards are cached on first draw). 25 s per 10 min worker roughly: an 70 s reel at 30 fps ~ 2100 frames ~ 6 min per worker.

## Pitfalls
- Cards are cached by key: change the key when the art changes.
- Subtitle width clamps at 980 px; keep lines under ~38 characters.
- Shadows lie toward the lower right; keep hero cards 120+ px away from the right page edge.
- The wombat reads slightly bear-like at thumbnail size; flatter nose and smaller ears would help.
- Not done yet: page turns, pull tabs, camera pan/zoom (draw into a larger offscreen and transform), sound events.
