# Sources and maths: credit-score-car (draft, for MAIN QA)

**Hypothetical example, not advice.** Real rates depend on the lender, the term, the down payment and more.

- Rates: average new-vehicle loan APRs by credit tier, Experian *State of the Automotive Finance Market*, Q3 2025, as tabulated by Bankrate: prime (661–780) **6.51 %**, subprime (501–600) **13.34 %** (near prime 9.77 %).
  - https://bankrate.com/loans/auto-loans/average-car-loan-interest-rates-by-credit-score
  - Experian's tier pages: https://www.experian.com/blogs/ask-experian/auto-loan-rates-financing/
  - MAIN: please confirm against Experian's own Q3 2025 report before posting (I only saw Bankrate's reproduction).
- Example: $30,000 financed, 60 months, no fees.

```python
pmt = lambda P, apr, n: P * (apr/12) / (1 - (1 + apr/12) ** -n)
pmt(30000, .0651, 60), pmt(30000, .1334, 60)   # 587.12, 687.83 / month
# interest: 587.12*60 - 30000 = 5,227 ; 687.83*60 - 30000 = 11,270  -> about $6,000 more
```
VO: "about six and a half percent", "about thirteen", "five hundred eighty-seven", "six hundred eighty-eight", "about five thousand ... versus eleven thousand", "about six thousand dollars more".

## MAIN verification (2026-11-19): rates UPDATED to Experian's own current table
Experian's "Average Car Payment" page now shows **data as of Q2 2026** (VantageScore 4.0), new-car APR:
prime (661-780) **6.15 %**, subprime (501-600) **13.52 %**. Source: https://www.experian.com/blogs/ask-experian/average-car-payment/
The Q3 2025 figures (6.51 % / 13.34 %, via Bankrate) are superseded. The script was re-written to the Q2 2026 figures:
```python
pmt(30000, .0615, 60) = 582.08 / month, interest 4,925
pmt(30000, .1352, 60) = 690.60 / month, interest 11,436   -> difference 6,511 ("about six and a half thousand more")
```
