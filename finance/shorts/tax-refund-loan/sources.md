# Sources and maths: tax-refund-loan

| claim (VO) | source figure | maths |
|---|---|---|
| "this year's average refund is 3,366 dollars" | IRS, Filing season statistics for week ending Oct. 16, 2026 (cumulative, Oct. 17, 2025 vs Oct. 16, 2026): Average refund amount **$3,366** (2025: $3,052); 110,802,000 refunds, $372.945 billion | |
| "About 280 dollars a month" | | 3,366 / 12 = 280.50 → "about 280" / HUD ≈$280 |
| "held at zero interest" / "free loan" | the IRS pays no interest on a refund issued on time (interest is paid only on late refunds, IRC § 6611) | figurative: a refund is overwithheld pay returned without interest |
| "That money came out of your paychecks, all year." | true for wage earners whose refund comes from withholding; refunds also include refundable credits (e.g. EITC, CTC), so not every dollar was withheld | hedge: "can" in description |
| "Your W-4 form sets the withholding, and the I.R.S. has a free estimator" | IRS Form W-4 and the IRS Tax Withholding Estimator | |

```python
3366 / 12   # 280.5
```

Sources:
- IRS, Filing season statistics for week ending Oct. 16, 2026: https://www.irs.gov/node/167596
- IRS, Tax Withholding Estimator: https://www.irs.gov/individuals/tax-withholding-estimator
- IRS, About Form W-4: https://www.irs.gov/forms-pubs/about-form-w-4

Hedges: an average over all refunds, not your refund; part of many refunds is refundable credits, not withholding; a
refund can be a sensible forced-savings choice (the VO says so).
