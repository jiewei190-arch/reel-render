# crt: retro CRT phosphor terminal (1080x1920, 2D canvas)
createCRT(canvas) -> R {S (scene ctx), begin(), measure(), finish(t,{on,jitter})}. Draw bright green/amber on S; finish adds bloom (4x down + blur), scanline mask, rolling band, noise, flicker, vignette, CRT turn-on (on 0..1), transition jitter.
Font VT323 (OFL) in fonts/. Palette: GREEN #3dff7a, AMBER #ffb52e (accent), DIM. Captions typed in a boot-log box with block cursor. Example: t_boot.js.
