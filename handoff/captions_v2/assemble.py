# Combine batch1-4.json into jobs/<reel>/caption_short_<reel>.txt + handoff/CAPTIONS_V2.md (all captions in one page).
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[2]; d = root / "handoff/captions_v2"
items = sorted(sum((json.load(open(d / f"batch{i}.json")) for i in range(1, 5)), []), key=lambda x: x["ep"])
assert [x["ep"] for x in items] == list(range(1, 105)), "EPs missing or duplicated"
md = ["# New captions (Oct 28): short hook + search line + comment question + 4-5 hashtags", "",
      "Same text works on TikTok, YouTube Shorts (description) and Instagram. Each episode's upload folder has it as caption.txt.", ""]
for x in items:
    (root / "jobs" / x["reel"] / f"caption_short_{x['reel']}.txt").write_text(x["caption"].strip() + "\n")
    md += [f"## EP {x['ep']} · {x['reel']}", f"**YouTube title:** {x['youtube_title']}", "", "```", x["caption"].strip(), "```", ""]
(root / "handoff/CAPTIONS_V2.md").write_text("\n".join(md))
print(len(items), "captions written")
