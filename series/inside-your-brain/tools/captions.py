# Word-synced captions from the real audio: script words + whisper word timings (tools/check_voices.py).
# Usage: python3 tools/captions.py episodes/ep01 -> src/episodes/<ep>/captions.json (Remotion Caption[] with speaker) + episodes/<ep>/captions.srt
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
ep = pathlib.Path(sys.argv[1]).resolve(); T = json.load(open(ep / "timeline.json"))
caps = []
for L in T["lines"]:
    script = L["text"].replace("...", "… ").split(); heard = L.get("words") or []
    if len(heard) == len(script):
        times = [(w["s"], w["e"]) for w in heard]
    else:  # fall back: spread the line's real speech span over the script words by length
        s0 = heard[0]["s"] if heard else L["start"]; e0 = heard[-1]["e"] if heard else L["end"]
        n = [len(w) + 2 for w in script]; tot = sum(n); acc = 0; times = []
        for k in n: times.append((s0 + (e0 - s0) * acc / tot, s0 + (e0 - s0) * (acc + k) / tot)); acc += k
    for w, (s, e) in zip(script, times):
        caps.append({"text": " " + w, "startMs": int(s * 1000), "endMs": int(e * 1000), "timestampMs": int((s + e) * 500), "confidence": 1, "speaker": L["who"]})
out = ROOT / "src" / "episodes" / T["id"]; out.mkdir(parents=True, exist_ok=True)
json.dump(caps, open(out / "captions.json", "w"), indent=0)
# SRT: one cue per line of dialogue, speaker-labelled
def ts(x): h, r = divmod(int(x * 1000), 3600000); m, r = divmod(r, 60000); s, ms = divmod(r, 1000); return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
srt = []
for i, L in enumerate(T["lines"]):
    w = L.get("words") or []; s = w[0]["s"] if w else L["start"]; e = w[-1]["e"] if w else L["end"]
    srt.append(f"{i + 1}\n{ts(s)} --> {ts(e)}\n{L['who'].upper()}: {L['text']}\n")
open(ep / "captions.srt", "w").write("\n".join(srt))
print(len(caps), "caption words;", len(srt), "srt cues")
