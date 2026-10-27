# lowpoly: a cute floating low-poly island in a vertical 1080x1920 frame

Our vertical port of the Lemo-Opuscar lowpoly-island grammar (MIT; technique only, original code and assets). Lemo's demo is 16:9 and uses GPU post (GTAO, bloom), so it is not used directly.

Files: lowpoly.js (kit), demo.html (DST proof), still.py (stills; serves reels/ on :8795), fonts/ (Fredoka etc., OFL, from lemo core).
Run from reels/styles/lowpoly: `python3 still.py styles/lowpoly/demo.html <outprefix> 3.2 7.4`. Page contract is the same as the iso kit: `window.DUR`, `window.seek(t)`, `window.ready`.

## API (lowpoly.js)
- `makeStage(el)`: ortho camera at 45/35 deg, `setCam(zoom,tx,ty,tz,panY,panX)` (frustum height = zoom; 16-18.5 shows the whole island), a sun DirectionalLight and a HemisphereLight; `st.setTod(tod)` sets their colour and intensity. `st.right/up/toCam` are the screen axes in world space.
- Sky: `TOD.noon|late|dusk`, `todMix(a,b,k)`, `applySky(el,tod)` sets a CSS gradient behind the transparent canvas (zenith, horizon, a deeper bottom band so white subtitles stay legible).
- World: `makeIsland()` returns a group with `userData.{tiles, top, rock}` (19 hex tiles, a pond and a sand path, 4 rock strata plus a cone). `hexPos(q,r)`, `hexTile`, `house(wall,roof,w,d,h)`, `tree(h,pine)`, `clockTower()` with `userData.setMinutes(m)` (m = minutes since 12:00; turns the hour and minute hands on both faces), `makeSun()`/`placeSun(st,o,sx,sy,depth)` (also used for clouds), `cloud(s)`, `sparkles(n)` with `userData.update(t)`.
- Arrivals: `pop(k)` (25% overshoot), `drop(k)` (fall then a damped bounce), `arrivePop(o,k)`, `arriveDrop(o,k,fromY,baseY)` with squash.
- Text: HTML overlay in demo.html: kicker, a title whose letters rise and pop one by one, a 2:00 AM to 1:00 AM chip, and a no-box subtitle (warm white with a blue drop shadow, a tile icon).

## Palette
Pastel, no black. Grass #9BD98A family, sand #F3DDA8, soil #D9A877, rock #A9A3B8, water #7CC4F2, walls cream/peach/lilac/mint, roofs coral/sky/violet/orange, sun #FFC861. Sky keys: noon #9FD4FF to #EAF6FF; dusk #BFA7F0 to #FFC6A5; bottom band #5E9FE0 to #5B4C9E.

## Cost
About 210-290 ms per frame at 1080x1920 in swiftshader (still mode, includes the screenshot). An 80 s reel at 30 fps is about 2,400 frames, roughly 10 min on 2 workers. No post-processing.

## Pitfalls
- Light intensities in r170 are physically scaled: directional about 2.4 and hemisphere about 1.5 look right. Dusk needs a warm, brighter ambient or the grass goes muddy olive.
- The strata rings must be wider than the tile patch (top radius 4.6) or the tile sides hide them. Rotate them by 30 deg to match the pointy-top hex region.
- Keep the sun and clouds out of the title band (top 230 px): place the sun by screen position at sy about 3.2 or lower.
- At zoom under about 16 the island's left and right corners crop; keep zoom 16.5+ at this island size, or shrink the island.
- Hands: the minute hand turns counter-clockwise during the rewind because minutes go from 120 to 60 (the minute hand turns a full lap backwards).
- Sprites and DOM labels are not used in this kit. Use the iso kit for leader-line labels if needed.
- TOD also has dawn and night (night: deep indigo sky, cool light; window emissive boost looks good).
