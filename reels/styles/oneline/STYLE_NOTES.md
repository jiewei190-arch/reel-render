# one-line (ink on paper), vertical port
Technique from Lemo-Opuscar one-line STYLE.md (MIT); own code, no assets reused.
- ONE Path (polyline with pinned times). Speed -> pen pressure (0.66+0.8*exp(-v/300)), bleed halo, pooling at slow points, blot on holds.
- Pen never drawn, only a soft shadow + contact dot. Paper #F4EFE4, ink #1D1A17, one accent (blood #E2524B).
- Kinds per point (0 ink, 1 accent, 2+ connectors that fade) so travel lines can be "erased".
- Everything near the subject breathes through a warp(x,y) callback (heartbeat, squeeze).
- Handwriting (Caveat, OFL) written on with paper halo; bottom band is a paper knock-out for subtitles.
- Pitfalls: pins must increase and the last pin must sit on the last point; keep labels inside the camera's x range; high zoom pushes body-loop lines into the subtitle zone (band hides them).
