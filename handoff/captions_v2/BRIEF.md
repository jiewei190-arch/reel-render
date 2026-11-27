# Caption rewrite brief (TikTok + YouTube Shorts + Instagram), Oct 28

Channel: "How It Really Works" (@howitreallyworkstudio): animated 70-85 s explainers of everyday science. The owner thinks the current captions aren't working. Problem with them: long paragraphs that give away the whole answer, sources in the caption, and generic hashtags.

## Format (one caption per reel, plain text)
```
<Line 1: the hook, max ~70 characters. It's the only line people see before "more". It creates curiosity and doesn't give away the answer. A surprising fact, a myth to bust, or a "you've noticed this" moment. 0-1 emoji.>
<Line 2: one short line with the search phrase people would type, in natural words (e.g. "Why do cats always land on their feet? It's not luck."). Keep the answer as a tease.>
<Line 3: a comment prompt: a specific, easy question people want to answer (e.g. "Has your cat ever NOT landed on its feet?"). Not "like and follow".>

#tag1 #tag2 #tag3 #tag4
```
- 4-5 hashtags: 2-3 specific to the topic (what people search, e.g. #glowstick #catsoftiktok), 1-2 broad niche (#science #howitworks #learnontiktok #physics #biology #chemistry). No #fyp/#foryou/#viral. Don't add #halloween to non-Halloween topics.
- Under 300 characters total, not counting hashtags.
- Plain, punchy and conversational. No "In this video", no "Did you know" opener every time (vary it), no clickbait that the reel doesn't pay off.

## Truth rule (owner's standing rule: every claim sourced)
Every fact in the caption must already be in that reel's own files: jobs/<reel>/caption_<reel>.md, sources_<reel>.md, hooks_<reel>.md, NOTES.md, or the spoken script in reels/specs/<reel>.json. Never add a new fact, number or claim. If a reel hedges something ("scientists think", "in one study"), keep the hedge. If unsure, leave the fact out and use curiosity instead.

## Also give a YouTube title
Max 60 characters, the question people search, plus at most 1 emoji. Example: "Why Do Cats Always Land on Their Feet? 🐈".

## Output
Write a JSON file handoff/captions_v2/batch<N>.json: a list of {"ep": int, "reel": str, "youtube_title": str, "caption": str} in EP order (caption with real newlines as \n). Read each reel's files before writing; don't guess what a reel is about from its folder name (e.g. "ship", "tap", "search", "window", "match" and "sleep" may not be what you think).
