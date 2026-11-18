# Sources and maths: coffee-could-be

**Hypothetical example only, not a prediction or a recommendation.** The VO says "a made-up example" and "Returns
aren't guaranteed, and the coffee might be worth it." No product, fund or account type is named or implied.

Assumptions (shown on screen as EXAMPLE):
- $5 a day × 365 days = **$1,825 a year** → "1,825 dollars a year".
- Invested monthly instead: $1,825 / 12 = $152.08 at the start of each month.
- A steady 7 % a year, compounded monthly (0.07 / 12 per month), no fees, taxes or inflation adjustment.

| horizon | put in | value (FV of an annuity due, i = 0.07/12) | VO |
|---|---|---|---|
| 30 years (360 months) | 1,825 × 30 = **$54,750** | 152.08 × ((1+i)^360 − 1)/i × (1+i) = **$186,620** | "put in 54,750", "about 186,000" |
| 10 years (120 months) | $18,250 | **$26,477** | "Only about 26,000" |

```python
i = 0.07 / 12; p = 1825 / 12
fv = lambda n: p * ((1 + i)**n - 1) / i * (1 + i)
fv(360), fv(120)   # 186620, 26477
```

Free calculator to repeat it: Investor.gov (SEC) Compound Interest Calculator,
https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
Background: Investor.gov (SEC), "Compound interest",
https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest

Hedges: "could be worth" (first line), "a made-up example", "returns aren't guaranteed". The point is time, not
shaming a purchase: "the coffee might be worth it."
