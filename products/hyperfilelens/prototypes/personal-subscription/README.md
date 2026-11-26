# Personal Subscription

Open `index.html` directly to review the HyperFileLens Personal Edition subscription flows. The page uses native HTML, CSS, and JavaScript and does not require installation, a build, or a backend. Billing, payment, and resource usage are simulated; the page does not collect payment details.

- **Billing Scenarios** switches accounts and demonstrates usage limits, checkout outcomes, scheduled plan changes, and renewal states.
- The checked scenario identifies the starting state loaded for that account, not its current billing status. Use **Reload Scenario** to start over without switching scenarios.
- Compare monthly and yearly pricing in the plan picker. Yearly is the default for free accounts; paid accounts start on their current billing cycle.
- Checkout and website pricing use fixed USD amounts. Checkout shows a pretax subtotal, sample tax, and the tax-inclusive total. Cards, wallets, confirmation, and activation are simulated; no Stripe connection or real tax calculation is made.
- Use the monthly or yearly scenarios to compare manual and automatic renewal. Manual renewal is available after expiry; before then, use renewal settings. Scheduled downgrades and same-cycle prorated upgrades remain available.
- **Recovery Window** scenarios cover expiry, 7 and 1 days remaining, the end of the window, pending activation, and eligibility to switch to Free. In-app deadlines use the browser’s time zone; recovery email previews use UTC. The 30-day window is a sample policy, not a deletion deadline.
- **Restore Backups** opens a static recreation of Data Protection. Review a sample source and snapshot, choose a target and scope, and review the request. No real restore task is submitted.
- **Contact Billing Support** provides a separately copyable email address, subject, and message. The sample address cannot receive mail, and the prototype sends no email.
- Exhausted storage and AI quota scenarios link to plan comparison when a higher allowance is available.
- **Simulate AI Token Quota Reset** moves the preview to the next reset date and opens Resource Usage with the new cycle's available allowance.
- Use the top-bar language menu to switch between English and Simplified Chinese.
- Click the logo to open the website pricing preview. Switch sign-in states above the pricing cards: a signed-out visitor goes through simulated sign-in, a Free user selecting Free opens Overview, and a Plus monthly subscriber selecting the matching plan opens Current Plan without creating an order.

Lucide icon artwork is used under the terms in `assets/lucide-license.txt`.
