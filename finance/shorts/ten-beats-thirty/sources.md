# Sources and maths: ten-beats-thirty

**Hypothetical example only; not a prediction or a promise of any return.** The VO says "Assume a steady seven percent
a year, as an example" and "Returns vary, nothing is guaranteed."

Assumptions (shown on screen as "EXAMPLE: 7%/YR, STEADY"):
- $200 deposited at the start of every month.
- 7% a year, compounded monthly (0.07 / 12 per month), no fees, no taxes, no inflation adjustment.
- Saver: ages 25 to 35 = 120 deposits, then nothing more, left to grow 30 more years to 65.
- Spender: ages 35 to 65 = 360 deposits.

Maths (future value of an annuity due, i = 0.07/12):
- Saver at 35: 200 × ((1+i)^120 − 1)/i × (1+i) = **$34,818**; grown 360 more months: × (1+i)^360 → **$282,607**
  → "about two hundred eighty thousand".
- Spender at 65: 200 × ((1+i)^360 − 1)/i × (1+i) = **$245,417** → "two hundred forty-five" (thousand, rounded; the line before says "about").
- Put in: Saver 200 × 120 = **$24,000**; Spender 200 × 360 = **$72,000**.
- Cross-check with yearly compounding ($2,400 at the start of each year): Saver $270,088 vs Spender $242,575; Saver still
  ends ahead, so the point doesn't hang on the compounding detail.

```python
i = 0.07 / 12
fv = lambda pmt, n: pmt * ((1 + i)**n - 1) / i * (1 + i)
fv(200, 120) * (1 + i)**360   # 282607.46
fv(200, 360)                  # 245417.50
```

Sources for the method (compounding, and a free calculator anyone can repeat this with):
- Investor.gov (SEC), Compound Interest Calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
- Investor.gov (SEC), "Compound interest": https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest
- Investor.gov (SEC) glossary, "Rule of 72" (why early money gets more doublings): https://www.investor.gov/introduction-investing/investing-basics/glossary/rule-72

Hedges: no product, fund, stock or account type is named or implied. 7% is an illustrative rate; real results can be
higher, lower or negative, and vary year to year.
