# H3 render pipeline scripts (restart recipe)

Each `<x>.sh` runs one reel end to end from reels/: (cues + mix where present) → `rq.sh <n> <port> <port>` (two render.py workers + tools.py assemble)
→ `enc_hq.sh` → copy to jobs/<n>/<n>.mp4 → qa.py → contact.py → 8 s preview → thumb.py → brand.py --ep N → qa.py again, touching
/tmp/claude-0/<x>.done and <x>2.done. au.sh still has the shared `flock /tmp/render.lock` line; the others render on their own port pairs.

Restart a reel from scratch: `cd reels && PORT=9341 python3 -I cues.py <n> && python3 -I mix2.py <n> && sh ../handoff/h3_pipeline/<x>.sh`
(voice first with `python3 -I voice2.py <n>` if specs/<n>.json changed).

In flight (Oct 28 ~12:00 UTC): auroras (EP 63, WebGL impasto, ~65% of frames; end card to be trimmed in post to ≤3 s, then brand --ep 63),
thunder (EP 83) then catfeet (EP 84) rendering. Audio note: if qa.py WARNs true peak, re-encode only the audio:
`ffmpeg -i <n>.mp4 -c:v copy -af alimiter=limit=0.75:level=false:latency=true -c:a aac -b:a 128k ...` then re-run brand.py and qa.py.
