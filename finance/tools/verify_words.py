"""Whisper word check for a finance Short: does the voice say every word of script.txt, and nothing else?
Normalises numbers/currency both ways ("$8.70" == "eight seventy", "$1" == "one dollar", "4%" == "four percent").

    python finance/tools/verify_words.py finance/shorts/<slug>      (needs faster-whisper; uses small.en)
Writes <slug>/vo/whisper_check.md and exits 1 if any word differs.
"""
import difflib, re, sys
from pathlib import Path

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def n2w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
    if n < 1000: return ONES[n // 100] + " hundred" + (" " + n2w(n % 100) if n % 100 else "")
    for div, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):
        if n >= div:
            return n2w(n // div) + " " + name + (" " + n2w(n % div) if n % div else "")


def year2w(y):
    hi, lo = divmod(y, 100)
    return n2w(hi) + " " + ("hundred" if lo == 0 else ("oh-" + ONES[lo] if lo < 10 else n2w(lo)))


def num(raw):
    n = int(raw.replace(",", ""))
    return year2w(n) if "," not in raw and len(raw) == 4 and 1100 <= n <= 2099 else n2w(n)


def norm(s):
    s = s.replace("’", "'")
    s = re.sub(r"\$(\d[\d,]*)\.(\d\d)\b", lambda m: num(m.group(1)) + " " + num(m.group(2)), s)  # $8.70 -> eight seventy
    s = re.sub(r"\$(\d[\d,]*)", lambda m: num(m.group(1)) + " dollar", s)
    s = re.sub(r"(\d+)\.(\d+)", lambda m: num(m.group(1)) + " point " + " ".join(ONES[int(c)] for c in m.group(2)), s)
    s = s.replace("%", " percent")
    s = re.sub(r"\d{1,3}(?:,\d{3})+|\d+", lambda m: num(m.group(0)), s)
    s = s.lower().replace("-", " ")
    s = re.sub(r"\ba (hundred|thousand|million)\b", r"one \1", s)
    s = re.sub(r"\bu\.?s\.?\b", "us", s)
    w = re.findall(r"[a-z']+", s)
    return ["dollar" if x == "dollars" else ("maths" if x == "math" else x) for x in w]


def main(d):
    d = Path(d)
    from faster_whisper import WhisperModel
    m = WhisperModel("small.en", device="cpu", compute_type="int8")
    segs, info = m.transcribe(str(d / "voice.wav"), beam_size=5, language="en")
    heard = " ".join(s.text.strip() for s in segs)
    want = (d / "script.txt").read_text(encoding="utf8")
    a, b = norm(want), norm(heard)
    diffs = [(op, " ".join(a[i1:i2]), " ".join(b[j1:j2]))
             for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes() if op != "equal"]
    ok = not diffs
    out = [f"# Whisper word check: {d.name}", "", f"- model: faster-whisper small.en (beam 5), audio {info.duration:.2f} s",
           f"- script words (normalised): {len(a)}; heard: {len(b)}", f"- result: **{'PASS: every word matches' if ok else 'DIFFERENCES'}**", "",
           "## Heard", "", heard, ""]
    if diffs:
        out += ["## Differences (script | heard)", ""] + [f"- {op}: `{x}` | `{y}`" for op, x, y in diffs]
    (d / "vo").mkdir(exist_ok=True)
    (d / "vo" / "whisper_check.md").write_text("\n".join(out) + "\n", encoding="utf8")
    print(d.name, "PASS" if ok else f"DIFF {diffs}")
    return ok


if __name__ == "__main__":
    sys.exit(0 if all([main(x) for x in sys.argv[1:]]) else 1)
