# Sources and maths: quit-cash-out (for MAIN QA)

**Hypothetical example, not advice.** Taxes depend on income, state and situation; 7 % a year is an assumption, not a forecast.

- **10 % additional tax on early distributions** (generally under age 59½, some exceptions): IRS Topic No. 558: https://www.irs.gov/taxtopics/tc558
  - Exceptions list: https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions
- **Taxed as ordinary income; 20 % withheld if paid to you; a direct rollover avoids the tax and withholding:** IRS, Rollovers of Retirement Plan and IRA Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions
- **12 % bracket** (example federal rate; 2025 single filers roughly $11,926-$48,475 taxable income): https://www.irs.gov/filing/federal-income-tax-rates-and-brackets . State income tax is ignored, so in many states the real take-home would be lower.
- **Relatable pain (description, not VO):** about a third of 401(k) participants who left a job cashed out (Vanguard research, 33 % of 2023 leavers): https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/mitigating-401k-leakage-with-emergency-savings.html
- **Compounding check:** Investor.gov compound interest calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator

## Maths

```python
balance = 10_000
penalty = 0.10 * balance        # 1,000  (10 % additional tax)
fed_tax = 0.12 * balance        # 1,200  (12 % bracket, example)
kept    = balance - penalty - fed_tax   # 7,800 -> VO "about seventy-eight hundred dollars"
# cash flow: plan withholds 20 % (2,000), check = 8,000; at filing tax+penalty = 2,200, so 200 more is owed -> net 7,800
saver = balance * 1.07 ** 35    # 106,766 (age 30 -> 65, 7 %/yr, annual compounding) -> "over a hundred thousand"
```
