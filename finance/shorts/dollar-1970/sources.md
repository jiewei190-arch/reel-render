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


## On-screen counter table (added by the render worker, v2)
The counter `YOUR $1 = X cents / YEAR Y` shows one value per calendar year: X = 100 x CPI-U(1970 avg 38.8) / CPI-U(year avg). The price rollers
`$1 (1970) = $X IN Y` show CPI-U(Y) / 38.8. The last step is Oct 2026 (CPI-U 337.511): 11.5 c and $8.70. Frame 1 of the Short already shows 11.5 c / OCT 2026;
the S17 loop rolls 100 c (1970) down to 11.5 c so its last frame equals frame 1. CPI-U, U.S. city average, all items, 1982-84 = 100, annual averages
(BLS series CUUR0000SA0, values as typed into src/fin/dollar1970.tsx; 2025 is skipped on screen, the roll goes 2024 -> OCT 2026).

| year | CPI-U | your $1 is worth | 1970 $1 costs |
|---|---|---|---|
| 1970 | 38.8 | 100.0 c | $1.00 |
| 1971 | 40.5 | 95.8 c | $1.04 |
| 1972 | 41.8 | 92.8 c | $1.08 |
| 1973 | 44.4 | 87.4 c | $1.14 |
| 1974 | 49.3 | 78.7 c | $1.27 |
| 1975 | 53.8 | 72.1 c | $1.39 |
| 1976 | 56.9 | 68.2 c | $1.47 |
| 1977 | 60.6 | 64.0 c | $1.56 |
| 1978 | 65.2 | 59.5 c | $1.68 |
| 1979 | 72.6 | 53.4 c | $1.87 |
| 1980 | 82.4 | 47.1 c | $2.12 |
| 1981 | 90.9 | 42.7 c | $2.34 |
| 1982 | 96.5 | 40.2 c | $2.49 |
| 1983 | 99.6 | 39.0 c | $2.57 |
| 1984 | 103.9 | 37.3 c | $2.68 |
| 1985 | 107.6 | 36.1 c | $2.77 |
| 1986 | 109.6 | 35.4 c | $2.82 |
| 1987 | 113.6 | 34.2 c | $2.93 |
| 1988 | 118.3 | 32.8 c | $3.05 |
| 1989 | 124.0 | 31.3 c | $3.20 |
| 1990 | 130.7 | 29.7 c | $3.37 |
| 1991 | 136.2 | 28.5 c | $3.51 |
| 1992 | 140.3 | 27.7 c | $3.62 |
| 1993 | 144.5 | 26.9 c | $3.72 |
| 1994 | 148.2 | 26.2 c | $3.82 |
| 1995 | 152.4 | 25.5 c | $3.93 |
| 1996 | 156.9 | 24.7 c | $4.04 |
| 1997 | 160.5 | 24.2 c | $4.14 |
| 1998 | 163.0 | 23.8 c | $4.20 |
| 1999 | 166.6 | 23.3 c | $4.29 |
| 2000 | 172.2 | 22.5 c | $4.44 |
| 2001 | 177.1 | 21.9 c | $4.56 |
| 2002 | 179.9 | 21.6 c | $4.64 |
| 2003 | 184.0 | 21.1 c | $4.74 |
| 2004 | 188.9 | 20.5 c | $4.87 |
| 2005 | 195.3 | 19.9 c | $5.03 |
| 2006 | 201.6 | 19.2 c | $5.20 |
| 2007 | 207.3 | 18.7 c | $5.34 |
| 2008 | 215.3 | 18.0 c | $5.55 |
| 2009 | 214.5 | 18.1 c | $5.53 |
| 2010 | 218.1 | 17.8 c | $5.62 |
| 2011 | 224.9 | 17.3 c | $5.80 |
| 2012 | 229.6 | 16.9 c | $5.92 |
| 2013 | 233.0 | 16.7 c | $6.01 |
| 2014 | 236.7 | 16.4 c | $6.10 |
| 2015 | 237.0 | 16.4 c | $6.11 |
| 2016 | 240.0 | 16.2 c | $6.19 |
| 2017 | 245.1 | 15.8 c | $6.32 |
| 2018 | 251.1 | 15.5 c | $6.47 |
| 2019 | 255.7 | 15.2 c | $6.59 |
| 2020 | 258.8 | 15.0 c | $6.67 |
| 2021 | 271.0 | 14.3 c | $6.98 |
| 2022 | 292.7 | 13.3 c | $7.54 |
| 2023 | 304.7 | 12.7 c | $7.85 |
| 2024 | 313.7 | 12.4 c | $8.09 |
| OCT 2026 | 337.511 | 11.5 c | $8.70 |
