# Sources and maths: start-25-vs-35 (draft, for MAIN QA)

**Hypothetical example only, not a prediction or a recommendation.** "A made-up, steady seven percent": real returns vary, can be negative, and there are fees and taxes. No account type or investment is named.

- Calculator for the same maths: Investor.gov (SEC) Compound Interest Calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
- $200 at the start of each month, 7 %/12 a month (FV of an annuity due):

```python
i = 0.07/12; fv = lambda p, n: p * ((1+i)**n - 1) / i * (1+i)
fv(200, 480)   # age 25 -> 65: 528,025 ; put in 200*480 = 96,000
fv(200, 360)   # age 35 -> 65: 245,417 ; put in 200*360 = 72,000
# gap 282,608 -> VO "about two hundred eighty thousand"
```
