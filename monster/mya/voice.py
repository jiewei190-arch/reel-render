"""Local narration with Kokoro-82M on CPU. Strict: if local synthesis fails, the job stops with a clear error. There is
no remote or paid fallback in this module, by design.

Each scene is synthesized separately and cached by (spoken text, voice, speed, model): a narration change re-voices
only the scenes whose text changed. Word timestamps come from Kokoro's own token timings.
"""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np

from .util import promote, stable_hash

SR = 24000
_pipes: dict = {}
MODEL_REPO = "hexgrad/Kokoro-82M"


class VoiceError(RuntimeError):
    pass


def _pipe(lang: str):
    if os.environ.get("MYA_FORCE_TTS_FAIL"):
        raise VoiceError("local narration failed (forced by MYA_FORCE_TTS_FAIL for testing); no fallback is configured")
    if lang not in _pipes:
        try:
            from kokoro import KPipeline
            _pipes[lang] = KPipeline(lang_code=lang, repo_id=MODEL_REPO)
        except Exception as e:  # noqa: BLE001
            raise VoiceError(f"Kokoro could not load locally ({e}); no remote voice fallback is allowed") from e
    return _pipes[lang]


def versions() -> dict:
    try:
        import kokoro
        return {"tts": "kokoro", "kokoro": getattr(kokoro, "__version__", "?"), "model": MODEL_REPO}
    except Exception:  # noqa: BLE001
        return {"tts": "kokoro", "kokoro": "not installed"}


def synth(text: str, voice: str, speed: float, out: Path) -> dict:
    """Synthesize one scene to out (WAV). Returns {seconds, tokens:[{text,start,end}]}."""
    import soundfile as sf
    pipe = _pipe(voice[0])
    chunks, toks, offset = [], [], 0.0
    try:
        for r in pipe(text, voice=voice, speed=speed):
            a = r.audio.numpy() if hasattr(r.audio, "numpy") else np.asarray(r.audio)
            for t in (r.tokens or []):
                toks.append({"text": t.text, "start": None if t.start_ts is None else round(offset + t.start_ts, 3),
                             "end": None if t.end_ts is None else round(offset + t.end_ts, 3)})
            chunks.append(a)
            offset += len(a) / SR
    except Exception as e:  # noqa: BLE001
        raise VoiceError(f"local narration failed for '{text[:60]}': {e}; no fallback is configured") from e
    if not chunks:
        raise VoiceError(f"Kokoro produced no audio for '{text[:60]}'")
    audio = np.concatenate(chunks).astype(np.float32)
    tmp = out.with_name(out.stem + ".tmp.wav")
    sf.write(tmp, audio, SR, subtype="PCM_16")

    def ok(p):
        d = sf.info(p).duration
        if d < 0.3:
            raise VoiceError(f"synthesized audio is too short ({d:.2f}s)")
    promote(tmp, out, ok)
    return {"seconds": round(len(audio) / SR, 3), "tokens": toks}


def scene_key(spoken: str, voice: str, speed: float) -> str:
    return stable_hash({"spoken": spoken, "voice": voice, "speed": speed, "v": versions()})[:16]
