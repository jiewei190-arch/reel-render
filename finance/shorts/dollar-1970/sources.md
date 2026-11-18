# Sources and maths: dollar-1970

Index: **CPI-U, U.S. city average, all items, not seasonally adjusted (1982–84 = 100)**, BLS series CUUR0000SA0.
- BLS series page: https://data.bls.gov/timeseries/CUUR0000SA0
- BLS CPI Inflation Calculator (same series, month to month): https://www.bls.gov/data/inflation_calculator.htm
- Same data mirrored by the St. Louis Fed (FRED, CPIAUCNS): https://fred.stlouisfed.org/series/CPIAUCNS

| value | number | from |
|---|---|---|
| CPI-U, 1970 annual average | **38.8** (monthly 37.8 Jan → 39.8 Dec) | BLS API, series CUUR0000SA0, 1970 |
| CPI-U, October 2026 (latest month when written, 2026-11-18) | **337.511** | FRED CPIAUCNS (BLS data) |

Maths:
- Price ratio = 337.511 / 38.8 = **8.70** → "prices have climbed almost nine times"; "something that cost one dollar in
  1970 costs about eight seventy now" = $1 × 8.70.
- Today's dollar in 1970 money = 38.8 / 337.511 = **$0.115** → "under twelve cents".
- Average yearly rate: 8.70^(1 / 56.3) − 1 = **3.9% a year** (mid-1970 to Oct 2026 ≈ 56.3 years) → "roughly four percent a
  year … for over fifty years".

Hedges:
- The CPI is an average basket; individual prices rose more or less than 8.7×. The VO says "something that cost one
  dollar" in the sense of the average basket; on screen the tag reads "CPI-U AVERAGE".
- The ratio moves a little with the months chosen: 1970 average vs the 2025 annual average (321.9, computed from the 11
  published months; Oct 2025 was not published) gives 8.30× and 12.1 cents. Using the latest month (Oct 2026) is what
  "now" means in the VO. If the Short goes out much later, re-check the latest CPI; "under twelve cents" and "almost nine
  times" stay true while CPI-U stays above ~323 and below ~388.
- "the government's consumer price index": the CPI is published by the U.S. Bureau of Labor Statistics.
