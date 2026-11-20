# Sources and maths: raise-tax-myth (MAIN-written)
**Hypothetical example, not advice.** Single filer, 2025 federal brackets, taxable income; ignores state/local tax, credits and deductions changes.
- IRS 2025 tax brackets (Rev. Proc. 2024-40): single 22% up to $103,350 taxable; 24% from $103,351 to $197,300. https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025
- Marginal rates apply only to income inside each bracket: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
- Payroll (FICA) tax 7.65% employee share (6.2% Social Security + 1.45% Medicare); 2025 SS wage base $176,100, so all $110k is covered. https://www.ssa.gov/oact/cola/cbb.html
## Maths
```
extra federal = (103,350-100,000)*0.22 + (110,000-103,350)*0.24 = 737 + 1,596 = 2,333  -> "about twenty-three hundred"
payroll      = 10,000*0.0765 = 765
kept         = 10,000 - 2,333 - 765 = 6,902                         -> "about sixty-nine hundred"
5 years      = 6,902*5 = 34,510                                     -> "about thirty-four thousand" (no further raises)
```
