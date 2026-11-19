# Sources and maths: same-raise (draft, for MAIN QA)

**Hypothetical example only, not a prediction or a recommendation.** "A made-up, steady seven percent": real returns vary and can be negative; no account type or investment is named. The raise is a stated example.

- Calculator for the same maths: Investor.gov (SEC) Compound Interest Calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
- $200 at the start of each month, 7 %/12 a month:

```python
i = 0.07/12; fv = lambda p, n: p * ((1+i)**n - 1) / i * (1+i)
fv(200, 120)   # 10 years: 34,819 -> VO "about thirty-five thousand" (put in 24,000)
fv(200, 240)   # 20 years: 104,793 -> VO "about a hundred and five thousand" (put in 48,000)
```
Hook "$100K APART": Spender invested $0, so the gap after 20 years is ≈ $105,000.
