"""Display text vs spoken text. The script keeps what viewers read ("$54 million", "2007", "Pearson v. Chung"); the
voice gets normalized words ("fifty-four million dollars", "two thousand seven", "Pearson versus Chung"). Each display
word keeps the list of spoken words it produced, so word timings map back to the exact display text for captions.
"""
from __future__ import annotations

import re

from num2words import num2words

SCALE = {"thousand", "million", "billion", "trillion"}
TAGS = re.compile(r"\[[^\]]*\]")


def year_words(n: int) -> str:
    if 2000 <= n <= 2009:
        return num2words(n).replace(" and ", " ")
    if 1100 <= n <= 2099:
        hi, lo = divmod(n, 100)
        if lo == 0:
            return f"{num2words(hi)} hundred"
        return f"{num2words(hi)} {'oh ' + num2words(lo) if lo < 10 else num2words(lo)}"
    return num2words(n)


def _num(tok: str, nxt: str | None, dollar: bool) -> tuple[list[str], bool]:
    """Spoken words for one numeric token. Returns (words, consumed_next)."""
    core = tok.replace(",", "")
    pct = core.endswith("%")
    core = core.rstrip("%")
    try:
        val = float(core)
    except ValueError:
        return [tok], False
    is_int = val.is_integer() and "." not in core
    if (is_int and not dollar and not pct and "," not in tok and 1100 <= val <= 2099 and len(core) == 4
            and (nxt is None or nxt.lower() not in SCALE)):
        words = year_words(int(val))
    elif is_int:
        words = num2words(int(val))
    else:
        words = num2words(val)
    words = words.replace(",", "").replace(" and ", " ")  # American style: "two thousand seven", "one hundred five"
    out = words.split()
    consumed = False
    if nxt and nxt.lower().strip(".,;:!?") in SCALE:
        out.append(nxt.lower().strip(".,;:!?"))
        consumed = True
    if pct:
        out.append("percent")
    if dollar:
        out.append("dollar" if (is_int and val == 1 and not consumed) else "dollars")
    return out, consumed


UNITS = [(r"(\d)\s*°\s*F\b", r"\1 degrees Fahrenheit"), (r"(\d)\s*°\s*C\b", r"\1 degrees Celsius"),
         (r"(\d)\s*°", r"\1 degrees"), (r"\((\d[^)]*degrees[^)]*)\)", r", or \1,")]


def normalize(display: str, pron: dict[str, str] | None = None) -> list[dict]:
    """[{display, spoken: [words]}] for one line. Emotion tags from other providers are removed, never spoken."""
    pron = {k.lower(): v for k, v in (pron or {}).items()}
    clean = TAGS.sub("", display)
    for pat, rep in UNITS:  # "140 °F (60 °C)" -> "140 degrees Fahrenheit, or 60 degrees Celsius,"
        clean = re.sub(pat, rep, clean)
    clean = re.sub(r"\s*,(\s*,)+", ",", clean)
    toks = clean.split()
    out, i = [], 0
    while i < len(toks):
        t = toks[i]
        nxt = toks[i + 1] if i + 1 < len(toks) else None
        lead = re.match(r"^[\"'(]*", t).group(0)
        trail = re.search(r"[\"'),.;:!?]*$", t).group(0)
        core = t[len(lead): len(t) - len(trail)] if trail else t[len(lead):]
        key = t.lower().strip("\"'(),;:!?")
        if key in pron:
            out.append({"display": t, "spoken": pron[key].split(), "fixed": True})
        elif re.fullmatch(r"\$\d[\d,]*(?:\.\d+)?", core):
            words, used = _num(core[1:], nxt, dollar=True)
            disp = t + (" " + nxt if used else "")
            out.append({"display": disp, "spoken": words})
            i += 2 if used else 1
            continue
        elif re.fullmatch(r"\d[\d,]*(?:\.\d+)?%?", core):
            words, used = _num(core, nxt, dollar=False)
            disp = t + (" " + nxt if used else "")
            out.append({"display": disp, "spoken": words})
            i += 2 if used else 1
            continue
        elif re.fullmatch(r"\d{4}s", core):
            out.append({"display": t, "spoken": (year_words(int(core[:4])) + "s").replace("ys", "ies").split()})
        elif core == "&":
            out.append({"display": t, "spoken": ["and"]})
        else:
            out.append({"display": t, "spoken": [core] if core else []})
        i += 1
    out = [w for w in out if w["spoken"]]
    for w in out:  # keep sentence punctuation on the spoken side so the narrator still pauses naturally
        if w.pop("fixed", False):
            continue  # a pronunciation entry (e.g. "v." -> "versus") owns its punctuation
        trail = re.search(r"[,.;:!?]*$", w["display"].rstrip("\"')")).group(0)
        if trail and not w["spoken"][-1].endswith(trail):
            w["spoken"][-1] = w["spoken"][-1].rstrip(",.;:!?") + trail
    return out


def bare(word: str) -> str:
    """Compare-form of a word: lowercase, letters/digits/apostrophes/hyphens only."""
    return re.sub(r"[^a-z0-9'\-]", "", word.lower())


def spoken_text(display: str, pron: dict | None = None) -> str:
    return " ".join(" ".join(w["spoken"]) for w in normalize(display, pron))


def word_count(display: str) -> int:
    return sum(len(w["spoken"]) for w in normalize(display))
