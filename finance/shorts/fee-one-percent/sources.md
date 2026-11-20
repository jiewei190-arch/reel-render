# Sources and maths: fee-one-percent (for MAIN QA)

**Hypothetical example, not advice.** Real returns vary and can be negative; 7 % a year is an assumption, not a forecast. No specific fund, firm or product is named.

- **Fees compound against you (the mechanism):** SEC Office of Investor Education, Investor Bulletin "How Fees and Expenses Affect Your Investment Portfolio": on $100,000 over 20 years at 4 %, a 1 % annual fee instead of 0.25 % leaves the portfolio nearly $30,000 smaller. Our example uses the same mechanism (the fee is subtracted from the yearly return), with different inputs.
  - https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated-investor-bulletin-how-fees-and-expenses-affect-your-investment-portfolio
  - SEC PDF version: https://www.sec.gov/investor/alerts/ib_fees_expenses.pdf
  - Investor.gov, Understanding Fees: https://www.investor.gov/introduction-investing/getting-started/understanding-fees
- **Fee levels that exist (0.1 % and 1 %):** low-cost index fund expense ratios are commonly around 0.1 % or less; advisory fees around 1 % of assets are common. FINRA Fund Analyzer lets anyone compare fund fees: https://tools.finra.org/fund_analyzer/ . The VO says "a tenth of a percent" and "one percent" only as the two example fees.
- **Compounding check:** Investor.gov compound interest calculator (monthly deposits): https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator

## Maths (monthly deposits of $500, monthly compounding, 40 years = 480 months, 7 %/yr gross minus the fee)

```python
def fv(m, r, y):            # future value of m per month at annual rate r for y years
    i = r / 12; n = y * 12
    return m * ((1 + i) ** n - 1) / i
saver   = fv(500, 0.07 - 0.001, 40)   # 1,276,125  -> VO "about one point two eight million"
spender = fv(500, 0.07 - 0.010, 40)   #   995,745  -> VO "just under one million"
saver - spender                       #   280,380  -> VO "about two hundred eighty thousand dollars"
500 * 12 * 40                         #   240,000  -> "more than Spender ever put in" (280,380 > 240,000)
# year 10: fv(500,.069,10)=86,068 vs fv(500,.06,10)=81,940 -> gap 4,128 ("barely a gap")
```
The $280,380 is the gap in ending balance (fees paid plus the growth those fees would have earned), which is how the SEC bulletin frames it too.
