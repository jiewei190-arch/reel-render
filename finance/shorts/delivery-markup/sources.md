# Sources and maths: delivery-markup (for MAIN QA)

**Hypothetical example, not advice.** Markups vary a lot by app, restaurant, city, order size, membership and tip.

- "$12 lunch costs about $21 delivered", "about nine dollars extra, every order": LendingTree study (reported by Scripps/KJRH, ~Nov 2025): delivery "can increase the cost of a $12 meal to more than $20", "an 80% markup"; "ordering food delivery costs 79.5% more than picking up the same meal in person — an additional $9.30 per order". Five restaurant chains, the 10 largest US cities, plus a survey of 2,000 people.
  - https://www.kjrh.com/money/consumer/consumer-reports/restaurant-food-delivery-apps-can-nearly-double-your-meal-costs-study-finds
  - Study page (linked from that article, not fetched): https://www.lendingtree.com/credit-cards/study/delivery-pickup/
- "delivery fee, service fee, tip, higher menu price": the cost parts named in the studies; Uber Eats has said some merchants set higher menu prices on delivery platforms than in store (cited in coverage of the Self Financial 2025 study).
- Cross-checks (not in VO): Self Financial 2025 (same fast-food meal, 100 US cities): average delivery markup 68.6 % incl. fees and a 15 % tip: https://www.self.inc/info/most-expensive-cities-for-food-delivery-apps/ · Consumer Reports (2020): markups up to 47-52 %: https://innovation.consumerreports.org/Food-delivery_-Report.pdf · WSMV Nashville test (May 2025): delivery 99 % more than pickup: https://www.wsmv.com/2025/05/21/nashville-clarksville-we-tested-food-delivery-apps-heres-where-youll-pay-more/

## Maths
```
$12 × 1.795 (79.5 % markup) = $21.54      -> "about twenty-one" ($12 + $9.30 = $21.30)
extra per order                = $9.30     -> "about nine dollars extra"
2 orders/week × 52 weeks       = 104 orders
104 × $9.30                    = $967.20   -> "nearly a thousand dollars a year"
Saver: same lunch, picked up   = $12
```
