"""Rough running cost per Short, printed at the end of each run. Prices in USD per 1M tokens / per char."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Cost:
    claude_in: int = 0
    claude_out: int = 0
    claude_cache_read: int = 0
    claude_cache_write: int = 0
    gemini_calls: int = 0
    eleven_chars: int = 0
    cli_calls: int = 0
    sfx_generated: int = 0
    cli_estimate_usd: float = 0.0
    lambda_usd: float = 0.0
    api_slot: int = 0
    web_searches: int = 0

    # Claude Opus 5.5 list prices; Gemini and ElevenLabs are plan-dependent, shown as counts.
    IN = 4.00
    OUT = 20.00
    CACHE_READ = 0.20
    CACHE_WRITE = 5.00  # 5-minute cache writes bill at 1.25x input

    def add_claude(self, usage) -> None:
        self.claude_in += getattr(usage, "input_tokens", 0) or 0
        self.claude_out += getattr(usage, "output_tokens", 0) or 0
        self.claude_cache_read += getattr(usage, "cache_read_input_tokens", 0) or 0
        self.claude_cache_write += getattr(usage, "cache_creation_input_tokens", 0) or 0

    def claude_usd(self) -> float:
        return (self.claude_in * self.IN + self.claude_out * self.OUT + self.claude_cache_read * self.CACHE_READ
                + self.claude_cache_write * self.CACHE_WRITE) / 1e6

    def summary(self) -> str:
        sub = (f"Claude via subscription: {self.cli_calls} call(s) (API-equivalent ~${self.cli_estimate_usd:.2f}, "
               f"not billed; counts toward plan limits), ") if self.cli_calls else ""
        slot = f" via key slot {self.api_slot}" if self.api_slot else ""
        slot += f", {self.web_searches} web search(es)" if self.web_searches else ""
        return (sub + f"Claude API{slot} ~${self.claude_usd():.2f} ({self.claude_in:,} in / {self.claude_out:,} out tokens), "
                f"Gemini {self.gemini_calls} call(s), ElevenLabs {self.eleven_chars:,} characters + {self.sfx_generated} sound effect(s)"
                + (f", AWS Lambda rendering ~${self.lambda_usd:.2f}" if self.lambda_usd else ""))


COST = Cost()
