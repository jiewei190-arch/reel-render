# Sources and maths: surprise-bill (FORMAT v1 story)

| VO line | figure | where it comes from |
|---|---|---|
| "this bill will follow him for two years" / hook text "A $1,000 BILL FOR 2 YEARS" | 26 months ≈ 2.2 years | the card simulation below |
| "One thousand dollars, due now. No savings." | $1,000 | stated example (EXAMPLE tag) |
| "a card: twenty-two percent, fifty a month" | 22 % APR, $50 flat | 22 % ≈ Fed G.19 average on accounts assessed interest (22.36 %) |
| "Month six. Month twelve. Still paying." | balance after 12 months ≈ $576 | simulation |
| "Twenty-six months later: paid off, plus 257 dollars of interest." | 26 months, $257.13 | simulation |
| "Saver ... paid it from his emergency fund. Done." | $1,000, $0 interest | |
| "63 percent of adults could cover a 400 dollar surprise with cash." | 63 % (2025) | Fed SHED 2025: would cover a $400 expense using cash or its equivalent (cash, savings, or a card paid in full at the next statement); "with cash" is the short form, the on-screen board says "PAY IN CASH" and the description gives the full definition |

The open loop ("And the worst part is still coming...") is the sealed FINAL TOTAL envelope; it pays off on "plus 257
dollars of interest" when it bursts open to +$257 INTEREST.

## Earlier details (unchanged)

Stated example (on screen as EXAMPLE): a **$1,000** bill; on a card at **22 % APR**, paying a flat **$50 a month**, no new
charges, no fees; interest each month = balance × 0.22/12, rounded to the cent.

| route | months | interest | VO |
|---|---|---|---|
| emergency fund (cash) | 0 | $0 | "it costs 1,000 dollars. Done." |
| card, $50 a month | **26** | **$257.13** | "Twenty-six months, and about 257 dollars of interest" → "can last two years" (26 months ≈ 2.2 years) |
| card, $100 a month | 12 | $114.90 | (not said) |

```python
def card(b, apr, pmt):
    m = paid = 0
    while b > 0.005:
        it = round(b * apr / 12, 2); p = min(pmt, b + it); b += it - p; paid += p; m += 1
    return m, round(paid - 1000, 2)
card(1000, .22, 50)   # (26, 257.13)
```

Sources:
- **22 % APR**: near the average rate on credit-card accounts assessed interest, Federal Reserve G.19 (22.36 % in the
  release of Nov 6, 2026). https://www.federalreserve.gov/releases/g19/current/default.htm
- **"only 63 percent of adults would cover a 400 dollar surprise with cash or savings"**: Federal Reserve, *Economic
  Well-Being of U.S. Households in 2025* (SHED, released May 13, 2026): 63 % would cover a hypothetical $400 expense
  using cash or its equivalent (unchanged from 2024; the Fed's measure counts cash, savings, or a credit card paid off
  at the next statement, hence the VO's "cash or savings").
  https://www.federalreserve.gov/publications/2026-economic-well-being-of-us-households-in-2025-executive-summary.htm
  https://www.federalreserve.gov/consumerscommunities/shed.htm

Hedges: "can last" (first line); one stated example; a different payment changes the result (table).
