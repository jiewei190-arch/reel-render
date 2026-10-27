# Batch A (session A): build these 7 reels, one at a time

Read README.md first and follow every rule in it (female voice af_heart with leaf settings; ONE art style per reel taken from the downloaded style repos; sourced facts; never post anywhere). You are a full Claude session with your own machine: render one reel at a time (2 CPUs), delete frames/<name> after each encode, push each finished reel to jobs/<name>/ immediately so work is never lost.

Per reel: research with WebSearch/WebFetch (reputable sources only) -> sources_<name>.md (drop or attribute anything unverified) -> script 66-86 s with a hook in the first 2 s, one idea, beginner friendly, ending with a line worth sending to a friend -> style: use the suggestion below, or switch to a better repo style and say why in NOTES.md -> spec, voice, mix, render (reels/rq.sh <name> 9301 9302), encode (reels/enc_hq.sh <name>), then look at stills/frames of the final video for clipped text, blank starts and timing gaps -> push jobs/<name>/{<name>.mp4,caption_<name>.md,sources_<name>.md,NOTES.md}.

Voice model setup (once): pip install --break-system-packages kokoro-onnx soundfile; put kokoro-v1.0.onnx and voices-v1.0.bin (from the kokoro-onnx GitHub release model-files-v1.0) in ./tts. Clone the style repos listed in README into ./styles-src.

| name | topic and hook | suggested repo style |
|---|---|---|
| wifi | How WiFi passes through walls | Generative & neon |
| touch | How a touchscreen knows where your finger is | Explainers & data viz |
| tickle | Why you can't tickle yourself | Flat cartoon |
| tap | How tap-to-pay works without touching anything | Retro/terminal |
| onion | Why onions make you cry | Hand-drawn sketch |
| zipper | How a zipper locks | Papercut |
| hurricane | How a hurricane forms | Cinematic 3D |

When all 7 are pushed, stop and report: each name, duration, style used and why, and any unverified/dropped claims.
