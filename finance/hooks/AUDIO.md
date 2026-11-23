# Audio available for the new finance format (music + SFX)

Checked: this repo at `finance/f2`, and `origin/iawaken/toon3d-fx` (the `toon3d:upbeat` library the history Shorts used).
Nothing new was downloaded.

## 1. toon3d library (recommended): `origin/iawaken/toon3d-fx`, `whatif/aitrends-2d-studio/kits/toon3d/audio/`

**Licence:** generated procedurally with numpy by `audio/gen_audio_assets.py`. There are no samples and no third-party
recordings. The README calls it "the owner's BEANMEN sound library (procedurally generated, royalty-free)". The generator's
header says "Everything is generated procedurally with numpy, so the engine has no third-party audio licensing." So
commercial use is OK: it is the owner's own generated audio. It is 44.1 kHz WAV, and `kits/toon3d/audio/mix.py`
resolves names as `toon3d:<name>`.

**Music beds (6), all loopable WAV:**

| name | bpm | length | feel / suggested use in a money story |
|---|---|---|---|
| `toon3d:upbeat` | 118 | 32.5 s | full drums, G major. The hook and the "happy" route (Saver) |
| `toon3d:tense` | 110 | 34.9 s | pulse drums, D minor. The debt trap and the minimum-payment spiral (best fit for the prototype) |
| `toon3d:curious` | 96 | 40.0 s | light drums. Explainer middles |
| `toon3d:mystery` | 80 | 48.0 s | no drums. A "wait for it" build before the twist |
| `toon3d:warm` | 84 | 45.7 s | no drums. A soft ending or a resolution |
| `toon3d:sad` | 72 | 53.3 s | no drums. A loss beat (interest pile, still owing) |

**SFX (54):** alarm beep bell boing boom buzz cash chime click clock coins crash creak crowd ding door drop engine fail
fire footsteps gasp glass gunshot heartbeat horn impact knock laugh magic metal paper pop punch rain riser rumble scratch
slide sparkle splash squeak stamp success suspense swoosh thud thunder tick type water whoosh wind zap.

Picks for the minimum-payment-trap prototype: `cash` and `coins` (the purchase and each payment), `stamp` (the bill),
`tick` and `clock` (the years flipping), `riser` into the twist, `impact`, `boom` or `thud` on the big number, `fail`
and `buzz` (the trap), `swoosh` and `whoosh` (cuts), `gasp` (the reaction), `success` and `chime` (the Saver route).
Skip `gunshot` on a money channel.

Mix recipe from the toon3d README: music at about -17 dB gain, ducked -9 dB under the voice, final master -14 LUFS / TP
-1.5. SFX on a beat (`at`) or on a spoken word (`word`, from the word timings), gains from -6 (impacts) to -12 (sparkles).

## 2. Other generators in the repo (also procedural, no licence needed)

- `whatif/aitrends-2d-studio/audio/music.py` (toon3d branch): a mood-driven procedural score with sections and an
  intensity of 0 to 1. Moods: mystery, tension, action, wonder, hopeful, sad, triumph, playful, calm, dark, epic. Use it
  for a custom-length bed with a build into the twist.
- `whatif/aitrends-2d-studio/audio/sfx.py` (toon3d branch): the plain-name procedural SFX (`whoosh` and so on).
- `series/inside-your-brain/tools/sfx.py` (toon3d branch): "original sound-effect library + music bed, synthesised from
  scratch (no samples, no licences needed)".

## 3. Not usable as music or SFX

- `whatif/what-if-dark/v2/voice_sample_*.mp3`: voice samples only.
- There are no third-party music files with commercial licences anywhere in the repo. If the redesign needs real
  recorded music (not synth), it needs a new source with a clear commercial licence. That would be a decision for the
  owner. I did not download any.

## How to use it in `finance/render-pc`

Copy the WAVs you need (e.g. `music/tense.wav`, `sfx/{cash,coins,stamp,tick,riser,impact,whoosh,fail}.wav`) into
`finance/render-pc/public/audio/` from `origin/iawaken/toon3d-fx`, then either place them as Remotion `<Audio>` / `<Sequence>`
or mix them after the render with ffmpeg next to `voice.wav`. The render-pc `tools/mux_voice.sh` currently muxes the voice
only.
