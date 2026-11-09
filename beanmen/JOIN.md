# BEANMEN ANIMATION.zip (sent by the owner via the Creator session)

The owner's full `BEANMEN ANIMATION.zip` (1,251,759,409 bytes), split into 13 parts of 95 MiB so GitHub accepts them.
Nothing in this branch has been changed or removed from the original zip.

## Re-join and unzip
```bash
git fetch origin beanmen/zip && git checkout beanmen/zip     # or: git worktree add ../beanmen origin/beanmen/zip
cd beanmen
sha256sum -c parts.sha256
cat BEANMEN_ANIMATION.zip.part* > BEANMEN_ANIMATION.zip
sha256sum -c zip.sha256        # expect 430554ac22432066e019973150342f83578623192cec8028cc902617fe4b098e
unzip -q BEANMEN_ANIMATION.zip -d .   # creates "BEANMEN ANIMATION/"
```

## What is inside (top folder `BEANMEN ANIMATION/`)
- A Remotion project, "stickmen-engine": 2D bean-man characters in 3D low-poly locations, making about 60 s vertical shorts (narration with edge-tts, captions, music, sfx).
  Read `.claude/skills/make-video/SKILL.md` and `.claude/skills/make-location/SKILL.md` first.
- `src/` (engine), `scripts/` (make.ts, still.ts, gen_audio_assets.py), `locations/*.json`, `stories/`, `archive/three-detailed/`, `public/` (6 music moods, 54 sfx, about 29 MB).
- `out/` (548 MB): 4 finished renders (ww1 rain 134 MB, emu war 121 MB, 1904 olympics 117 MB, Mona Lisa heist 89 MB) plus dev sheets.
- `references/` (263 MB): 9 reference videos (1920p30) from another channel, used for style reference only. Don't republish them.
- `node_modules/` (1.3 GB, Windows install). Delete it and run `npm install` on Linux.

Never post, upload or schedule anything from here without the owner's approval.
