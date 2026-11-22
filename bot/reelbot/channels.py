"""Channel profiles: one bot, five channels. Each channel has its own niche, writing rules, voice, look (render kit),
disclaimers and analytics folder. Pick one with --channel or REELBOT_CHANNEL; the choice is stored in script.json so
every later stage (voice, recipe, render, editor) uses the same channel.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path

from .config import BOT_DIR, CFG


@dataclass(frozen=True)
class Channel:
    id: str
    name: str
    brief: str                      # one paragraph: what the channel is and who it's for (research + hooks)
    prompt: str                     # system prompt template in prompts/
    doc: str = ""                   # channel rules in prompts/channels/<id>.md (story channels)
    voices: tuple = ()              # voice names in CFG.voices, rotated (Shorts)
    long_voices: tuple = ()         # voices for long-form videos (default: same as voices)
    kit: str | None = None          # render kit id ("law3d", ...); None = Block Money's original engine
    entry: str = "src/index.toolkit.ts"   # Remotion entry that registers the kit's compositions
    styles: tuple = ("story",)
    disclaimers: tuple = ("Voice is synthetic.",)
    analytics: str = ""             # folder name under analytics/raw/<date>/
    folder: str = ""                # output folder name under the videos dir
    hook_rules: str = ""            # what a winning first line looks like on this channel
    cast_rule: str = ""             # who may appear on screen
    renders: bool = True            # False = this channel's videos are rendered by another engine (bot stops after voice)


CHANNELS: dict[str, Channel] = {c.id: c for c in (
    Channel(
        id="blockmoney", name="Block Money",
        brief="Block Money: finance Shorts with two blocky 3D characters, Spender (red) and Saver (green). US audience.",
        prompt="blockmoney_script.md", voices=("Tyler", "Christopher"), kit=None, entry="src/index.toolkit.ts",
        styles=("S1", "S2", "S3", "S4", "S5", "S6"),
        disclaimers=("Educational only, not financial advice.", "Voice is synthetic."),
        analytics="block_money", folder="BlockMoney",
        hook_rules="12 words or fewer, talks to 'you', a dollar figure or a money myth in the first sentence.",
        cast_rule="Use only the SPENDER and SAVER cast."),
    Channel(
        id="justin", name="Justin clips: weird true history",
        brief=("Justin clips: weird TRUE history told as fast, gripping stories (strange events, odd people, bizarre "
               "facts with real sources), animated in a Toon 3D style. US audience 16-40."),
        prompt="story_script.md", doc="justin.md", voices=("Liam",), long_voices=("Russ",), kit="toon3d",
        entry="(justin engine: whatif/aitrends-2d-studio)", renders=False,
        disclaimers=("Voice is synthetic.",), analytics="justin", folder="JustinClips",
        hook_rules=("12 words or fewer; the strangest true fact of the story in sentence one, said so the viewer "
                    "can't believe it and has to hear the rest."),
        cast_rule="Generic stylized characters only; no real person's likeness beyond public-domain historical depiction."),
    Channel(
        id="law", name="Court Of Weird (weird true court cases)",
        brief=("A channel of weird TRUE court cases and lawsuits told as gripping stories: the claim nobody believes, "
               "the twist, the verdict. US adults 18-45. Stories only, never legal advice."),
        prompt="story_script.md", doc="law.md", voices=("Nichalia",), kit="law3d", entry="src/index.law.ts",
        disclaimers=("This is a true story told for entertainment and education, not legal advice. "
                     "Details come from court records and news reports listed below.", "Voice is synthetic."),
        analytics="law", folder="CourtOfWeird",
        hook_rules=("12 words or fewer; the absurd claim or the stake in sentence one (who sued whom for what, or the "
                    "dollar amount), framed so the viewer must know how it ended."),
        cast_rule="Use only the kit's generic court characters; never a real person's likeness."),
    Channel(
        id="biz", name="Billion Dollar Blunders (costly business mistakes)",
        brief=("A channel of TRUE business stories: the one decision that cost a company a fortune or killed it, and "
               "the lesson. US adults 18-45 interested in money and business."),
        prompt="story_script.md", doc="biz.md", voices=("Steven",), kit="biz3d", entry="src/index.biz.ts",
        disclaimers=("Educational only, not financial or investment advice. Figures come from the sources below.",
                     "Voice is synthetic."),
        analytics="biz", folder="BillionDollarBlunders",
        hook_rules="12 words or fewer; the dollar stake of the mistake in sentence one (\"could have bought X for Y\").",
        cast_rule="Use only the kit's generic executives; never a real logo or a real person's likeness."),
    Channel(
        id="cyber", name="Scam Files TV (true scams and hacks)",
        brief=("A channel of TRUE scams, hacks and data breaches told like heist stories, ending with how to spot it. "
               "US adults 18-45. Educational: story-level, never operational how-to."),
        prompt="story_script.md", doc="cyber.md", voices=("Todd",), kit="cyber3d", entry="src/index.cyber.ts",
        disclaimers=("Educational only. Based on public court records and news reports listed below. "
                     "Nothing here is instructions for committing a crime.", "Voice is synthetic."),
        analytics="cyber", folder="ScamFilesTV",
        hook_rules="12 words or fewer; the amount stolen or the shocking trick in sentence one, aimed at 'you' if it can be.",
        cast_rule="Use only the kit's generic figures; no real logos, agency seals or real faces."),
)}


def get(cid: str | None = None) -> Channel:
    cid = cid or os.environ.get("REELBOT_CHANNEL", "blockmoney")
    if cid not in CHANNELS:
        raise SystemExit(f"unknown channel '{cid}'; pick one of: {', '.join(CHANNELS)}")
    return CHANNELS[cid]


def of_folder(folder: Path) -> Channel:
    """The channel a Short was written for (stored in its script.json)."""
    p = folder / "script.json"
    if p.exists():
        return get(json.loads(p.read_text(encoding="utf-8")).get("channel") or "blockmoney")
    return get()


def doc(ch: Channel) -> str:
    if not ch.doc:
        return ""
    p = BOT_DIR / "prompts" / "channels" / ch.doc
    return p.read_text(encoding="utf-8") if p.exists() else ""


def output_dir(ch: Channel) -> Path:
    """Block Money keeps its existing folder; the other channels sit next to it."""
    return CFG.output_dir if ch.id == "blockmoney" else CFG.output_dir.parent / ch.folder


_active: Channel | None = None


def use(ch: Channel) -> Channel:
    """Set the channel every stage in this run works for."""
    global _active
    _active = ch
    return ch


def active() -> Channel:
    return _active or get()
