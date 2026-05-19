# Dropanalizer — Product Document

## The Problem

Dropshippers spend money on ads but lose sales because their landing pages don't convert.

The typical workflow:
1. Find a product
2. Run ads pointing to a generic page
3. Get traffic, no sales
4. Guess what's wrong
5. Change something randomly
6. Repeat

The core issue isn't the product or the ads — it's the page. And fixing the page requires skills most dropshippers don't have: copywriting, design, conversion optimization, data analysis.

**Existing tools don't solve this:**

| Tool | Problem |
|------|---------|
| Shopify / WooCommerce | Generic product pages, no conversion focus |
| Page builders (Unbounce, Leadpages) | Blank canvas — requires expertise to use well |
| Analytics (Google Analytics, Hotjar) | Shows data but doesn't tell you what to do |
| AI copywriters (Jasper, Copy.ai) | Generates text but doesn't track results |

No tool combines page creation + behavioral tracking + actionable recommendations in one place.

---

## The Solution

Dropanalizer is a system that generates, measures, and tells you how to fix your sales pages — without requiring design, copywriting, or analytics skills.

**Three things working together:**

### 1. Generate
User provides: product name, price, images, and a brief description.
Claude generates: headline, benefits, social proof, FAQ, urgency, and CTA — structured into a conversion-optimized landing page. Ready in under 60 seconds.

### 2. Measure
Every published page tracks visitor behavior automatically:
- How long they spend on each section
- Where they click
- Whether they click "Buy Now" (buy intent)
- Where they drop off

No setup required. The tracking is built into every page.

### 3. Recommend
Instead of showing raw metrics, Dropanalizer surfaces **Signals** — plain-language cards that say exactly what's happening and what to do:

> 🔴 **This page has been underperforming for 7+ days**
> You've had a 1.2% conversion rate for 9 days. You have enough data — generate a new AI version to see if it performs better.
> → Generate new version with AI

> 🟡 **There's interest but something stops the purchase**
> 23% of visitors click Buy but don't follow through. Try adding urgency or a visible guarantee.
> → Edit page

> 🟢 **Strong buy intent**
> 14% of your visitors click Buy — above the industry average. Time to scale your traffic.
> → Copy link

Signals adapt to context: page age, traffic volume, CTR, section engagement. A page with 5 visits gets different signals than one with 500.

---

## What Makes It Different

**Not a page builder. A system that decides for you.**

Traditional page builders give you a blank canvas and expect you to know what works. Dropanalizer removes that burden entirely:

| Traditional page builder | Dropanalizer |
|--------------------------|--------|
| You design the page | AI generates the page |
| You guess what to change | System tells you what's wrong |
| You read charts | System reads them for you |
| Iteration is manual and slow | One click to generate a new version |
| Tool is passive | Tool learns from your data |

The closest analogy: hiring a conversion specialist who builds your page, watches your visitors, and tells you what to fix — for the price of a SaaS subscription.

---

## Target Market

**Primary:** Dropshippers selling physical products in Latin America and the US Hispanic market.

**Why this segment:**
- High volume (millions of active dropshippers in LATAM)
- Low technical skill — they know how to run ads but not how to build pages
- High pain — every wasted ad click costs real money
- Fast feedback loop — they move fast and test constantly

**Secondary (future):** Freelancers and agencies presenting service proposals to clients.

---

## Business Model

| Plan | Price | Key limit |
|------|-------|-----------|
| Free | $0 | 3 sales pages, basic signals (2 per page) |
| Pro | $19/mo | Unlimited pages, AI diagnosis every 6h, all signals |
| Business | $49/mo | AI diagnosis every 2h, cross-page recommendations, team access |

The free plan is designed to show enough value to create upgrade intent — users see signals but need Pro to get the full AI diagnosis.

---

## Current Status

MVP live. Core flow working end-to-end:

- [x] AI page generation (3 templates: Minimalist, Vibrant, Luxury)
- [x] Behavioral tracking (views, clicks, time per section)
- [x] Smart Signals (Layer 1 — rule-based, 7 signal types)
- [x] Versioning (immutable published versions with per-version analytics)
- [x] CTA destinations (WhatsApp + payment links)
- [x] Multi-language (ES/EN)

**Next:**
- [ ] Smart Signals Layer 2 — Claude AI diagnosis for Pro users
- [ ] Plan enforcement (free limit, Pro features gating)
- [ ] Payment integration (Stripe)
