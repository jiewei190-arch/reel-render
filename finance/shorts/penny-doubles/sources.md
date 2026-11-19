# Sources and maths: penny-doubles

Pure arithmetic; no outside data is needed. The convention used everywhere: **day 1 = $0.01**, and each later day is
double the day before, so the value on day *n* is `0.01 × 2^(n−1)` dollars. The script talks about the penny's
value **on** a given day (not the running total of all days).

| claim in the VO | maths | result |
|---|---|---|
| "Day ten? Five dollars and twelve cents." | 0.01 × 2^9 = 0.01 × 512 | **$5.12** |
| "Day twenty? About five thousand." | 0.01 × 2^19 = 0.01 × 524,288 | **$5,242.88** |
| "Day twenty-five, over one hundred sixty thousand." | 0.01 × 2^24 = 0.01 × 16,777,216 | **$167,772.16** |
| "Day twenty-eight, one point three million." | 0.01 × 2^27 = 0.01 × 134,217,728 | **$1,342,177.28** |
| "Day thirty... five point three million dollars." | 0.01 × 2^29 = 0.01 × 536,870,912 | **$5,368,709.12** |
| "beats a million dollars" | $5,368,709.12 > $1,000,000 | true (from day 28 on) |
| "Still losing" (day 20) | $5,242.88 < $1,000,000 | true |
| "Half of it shows up on the very last day." | day 30 − day 29 = 5,368,709.12 − 2,684,354.56 = 2,684,354.56 = ½ × day 30 | true |

Check (Python): `[0.01 * 2**(d-1) for d in (10, 20, 25, 28, 30)]` → `[5.12, 5242.88, 167772.16, 1342177.28, 5368709.12]`.

Note: if you instead **add up** every day's amount, the total by day 30 is 0.01 × (2^30 − 1) = **$10,737,418.23**. We don't
use that number on screen, to avoid mixing the two readings.

Hedge / framing: this is a thought experiment about exponential growth. Nothing real doubles every day; on screen, the
tag "THOUGHT EXPERIMENT" appears in the first shot. Background on compounding (why growth on growth speeds up):
- Investor.gov (SEC), "Compound interest": https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest
- Investor.gov (SEC), Compound Interest Calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
