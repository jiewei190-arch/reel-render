"""story_mix.py <CompId> <voice.wav> <audio_dir> <out_premix.wav>

FORMAT v1 premix: voice + the music bed from 0 s, ducked under the voice (sidechain), + SFX at the cues exported by
src/fin/v1/<short>.tsx (via tools/story_cues.mjs). Then set loudness with tools/mux_voice.sh (-14 LUFS, TP <= -1.5).
audio_dir holds music/<name>.wav and sfx/<name>.wav: the toon3d library (origin/iawaken/toon3d-fx,
whatif/aitrends-2d-studio/kits/toon3d/audio; procedurally generated, no third-party audio; see finance/hooks/AUDIO.md).
The bed is looped if the Short is longer than the file.
"""
import json
import os
import subprocess
import sys

comp, voice, adir, out = sys.argv[1:5]
here = os.path.dirname(os.path.abspath(__file__))
# STORY_CUES=<file>: a cue plan written by tools/recipe_build.mjs (out/tmp/<slug>.cues.json) instead of src/fin/v1
_cues = os.environ.get("STORY_CUES")
info = (json.load(open(_cues)) if _cues else json.loads(subprocess.check_output(["node", os.path.join(here, "story_cues.mjs")], cwd=os.path.dirname(here))))[comp]
dur = info["duration"]
# A kit may name a bed this PC's library doesn't have yet: use the closest mood instead of failing the whole Short.
NEAREST = {"suspense": ["tense", "mystery"], "dark": ["mystery", "tense"], "tense": ["suspense", "mystery"],
           "mystery": ["tense", "curious"], "upbeat": ["warm", "curious"], "warm": ["upbeat", "curious"],
           "sad": ["warm", "mystery"], "curious": ["mystery", "warm"]}
want = info["music"]
for name in [want, *NEAREST.get(want, []), "tense", "mystery", "curious", "warm", "upbeat"]:
    music = os.path.join(adir, "music", name + ".wav")
    if os.path.exists(music):
        break
else:
    sys.exit(f"no music bed in {os.path.join(adir, 'music')} (wanted {want})")
if name != want:
    print(f"story_mix: music '{want}' not in the library; using '{name}'")
    info["music"] = name
ins = ["-i", voice, "-stream_loop", "-1", "-i", music]
parts, labels = [], []
for c in sorted(info["cues"], key=lambda c: c["t"]):
    f = os.path.join(adir, "sfx", c["sfx"] + ".wav")
    if not os.path.exists(f):  # one missing effect shouldn't sink the Short
        print(f"story_mix: skipping missing sfx {f}")
        continue
    ins += ["-i", f]
    k = len(labels)
    j = 2 + k
    ms = max(0, int(round(c["t"] * 1000)))
    parts.append(f"[{j}:a]aresample=48000,aformat=channel_layouts=stereo,volume={c.get('db', 0) - 6}dB,adelay={ms}|{ms}[s{k}]")
    labels.append(f"[s{k}]")
fc = [
    f"[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={dur}[vo]",
    "[vo]asplit=2[vo1][key]",
    f"[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur},afade=t=out:st={max(0, dur - 0.35)}:d=0.35,volume={info['musicDb']}dB[mus]",
    "[mus][key]sidechaincompress=threshold=0.02:ratio=8:attack=8:release=220:makeup=1[bed]",
    *parts,
    f"[vo1][bed]{''.join(labels)}amix=inputs={2 + len(labels)}:normalize=0:duration=first,atrim=0:{dur}[mix]",
]
subprocess.check_call(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s16le", "-ar", "48000", out])
print(f"premix {comp}: {dur:.2f} s, music {info['music']}, {len(labels)} sfx -> {out}")
