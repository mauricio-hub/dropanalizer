# Project: Dropanalizer

## Product Overview
Dropanalizer is a SaaS platform that allows freelancers and companies to create, send, and optimize commercial proposals as dynamic landing pages.

The goal is to help users close deals faster by:
- Structuring professional proposals
- Tracking client behavior
- Enabling versioning and iteration
- Using AI to improve proposals over time

---

## Primary Market: Dropshipping (Initial Focus)

**Why Dropshipping:**
Dropshippers struggle to generate consistent sales because they lack tools to create effective landing pages and understand buyer behavior. Dropanalizer solves this by providing:
- Quick landing page creation without copywriting expertise
- Real-time tracking of user behavior (where do they drop off?)
- Data-driven iteration (A/B testing, version management)
- AI-powered optimization suggestions

This is NOT exclusive—we remain open to other markets (agencies, SaaS, services) but dropshipping is our initial validation target.

**Key Pain Points We Address:**
1. Low-quality landing pages (generic templates, no strategy)
2. No understanding of user behavior (guessing vs. data)
3. Slow, manual iteration (expensive advertising wasted)
4. Passive tools (builders don't suggest improvements)
5. High cost of experimentation (every test risks money)

---

## Core Philosophy: NOT a Traditional Page Builder

**This is critical to Dropanalizer's differentiation:**

Dropanalizer is NOT a page builder like Unbounce, Leadpages, or Instapage.

In traditional page builders:
- User has full control → creates poor-quality pages
- User drags and drops sections manually
- System is passive (doesn't learn or suggest)
- Iteration is slow and requires expertise

**In Dropanalizer:**
- System takes intelligent decisions for the user
- AI generates and optimizes pages automatically based on:
  - Unstructured user input (brief/product description)
  - Real behavioral data (tracking events)
  - Industry best practices
- User provides direction, system executes
- Iteration is fast and data-driven
- No need for copywriting or design skills

**The UX difference:**
- Page builder: "Build your page" → blank canvas
- Dropanalizer: "Tell me about your offer" → smart landing page → automatic optimization

---

## Solution Overview

Dropanalizer is a platform that allows users to generate, measure, and automatically optimize landing pages without technical, design, or marketing expertise.

Instead of functioning as a traditional page builder, the system uses:
- Intelligent templates
- Automatic content generation
- Behavioral analysis for continuous improvement

The user doesn't need to design or guess what works. The system decides, measures, and improves.

---

## Core Approach: Three Principles

1. **System generates the landing automatically**
   - User provides basic information (offer, target audience, context)
   - AI structures and optimizes content automatically
   - Result: ready-to-launch page in minutes

2. **System measures user behavior**
   - Track time spent per section
   - Monitor clicks and interactions
   - Identify drop-off points
   - All data tied to proposal versions

3. **System optimizes without manual intervention**
   - Detects conversion issues
   - Suggests actionable improvements
   - Generates optimized versions automatically
   - User reviews and approves iterations

---

## Intelligent Templates

Rather than offering a blank builder, Dropanalizer uses structured templates optimized for conversion.

Each template:
- Has predefined sections (hero, benefits, social proof, CTA, etc.)
- Follows proven conversion logic
- Adapts to different scenarios

**Template Examples:**
- New offer (rapid validation)
- Established offer (conversion optimization)
- Limited-time offer (urgency focus)
- Premium offer (value focus)

This ensures consistency and prevents poor user decisions.

---

## Automatic Content Generation

User provides minimal information:
- Offer details (product, service, or proposal)
- Pricing
- Target audience (optional)
- Context/brief

System automatically generates:
- Optimized headlines
- Benefits and value propositions
- Complete landing page structure
- Calls to action (CTAs)
- Social proof sections

---

## Behavioral Tracking & Analytics

Every landing page includes lightweight tracking:
- Time spent per section
- Click events on buttons
- Scroll depth and engagement
- Abandonment points

Data is associated with each proposal version, enabling understanding of real user behavior.

---

## Continuous Optimization Loop

System doesn't just show metrics—it acts on them.

Based on user behavior, Dropanalizer:
- Detects conversion problems
- Suggests improvements
- Generates optimized versions automatically

**Examples:**
- Low benefit engagement → improve copy
- High traffic, few clicks → adjust CTA
- Early abandonment → redesign hero section
- Weak social proof → add testimonials

This enables rapid iteration without relying on guesswork.

---

## Optional: A/B Testing Mode (Future)

Platform can generate multiple landing page variants and distribute traffic to automatically identify the best performer.

Benefits:
- Faster product validation
- Lower cost of experimentation
- Data-driven decisions

---

## Value Proposition

Transform manual, slow, uncertain processes into automated, data-driven systems.

**Instead of:** Create → Test → Guess

**Dropanalizer enables:** Generate → Measure → Optimize Automatically

---

## Key Outcomes

- ⚡ Reduced time to market
- 📈 Continuous conversion improvement
- 🎯 No technical/marketing expertise required
- 📊 Decisions based on real user behavior
- 💰 Lower cost of experimentation

---

## Key Differentiator

**Not a page builder. A system that makes decisions for the user and continuously improves results.**

---

## SaaS Context

- Multi-tenant architecture
- Each user has isolated data
- No cross-user data access
- Each user manages their own proposals, versions, and optional catalog

---

## Core Entities

### Proposal
A proposal is a structured document rendered as a landing page.

Includes:
- Introduction
- Client context
- Solution
- Pricing
- Call to action

Each proposal has a public shareable URL.

---

### Proposal Version
- A proposal can have multiple versions
- Versions are immutable once published
- New versions are derived from previous ones
- Tracking is tied to each version

---

### Event (Tracking)
The system tracks:
- Page views
- Time spent
- Section interaction
- Click events

Tracking must be lightweight and not affect performance.

---

## Proposal Modes

### 1. Service Mode (MVP priority)
- User provides free-form input (brief)
- System structures content into:
  - Scope
  - Deliverables
  - Timeline
  - Pricing

---

### 2. Product Mode (NOT MVP)
- Based on user catalog
- User selects products
- Proposal stores a snapshot (not live data)

---

## Catalog (Optional, NOT MVP)

- Users can upload products via Excel/PDF
- Data is parsed and editable
- Used only as context for proposals
- Proposals must not depend on live catalog data

---

## AI Agent Responsibilities

Agents operate in the background and are responsible for:

- Generating structured proposals from input
- Organizing unstructured text into professional format
- Using catalog context when available
- Analyzing tracking data
- Suggesting improvements
- Generating new proposal versions

Agents must:
- Run asynchronously
- Not block user actions
- Respect system constraints and MVP scope

---

## Core Flow (MVP)

1. User creates a proposal (service mode)
2. Proposal is saved
3. Proposal is published as a landing page
4. Client opens the proposal
5. System tracks behavior
6. User can create a new version

---

## MVP Scope (STRICT)

Only implement:

- Create proposal (service mode)
- Render proposal as landing page
- Basic tracking (views, clicks)
- Basic versioning

Do NOT implement yet:

- Product catalog system
- Advanced AI optimization
- Insights dashboard
- Complex analytics

---

## System Constraints

- Keep architecture simple
- Avoid overengineering
- Prefer clarity over abstraction
- Focus on fast iteration

---

## Expected Behavior for Code Generation

When generating code:

- Follow MVP scope strictly
- Do not introduce unnecessary features
- Keep components modular and simple
- Ensure proposals render correctly as landing pages
- Prioritize performance and usability

---

## Development Workflow: Spec-Driven Development

Before writing any code for a non-trivial task, follow this process:

### Step 1 — Write the Spec

Before touching any file, produce a short spec covering:

- **What:** what the feature or fix does in one sentence
- **Why:** why it's needed (user problem or bug)
- **Files touched:** which files will be created or modified
- **Acceptance criteria:** bullet list of conditions that mean "done"
- **Out of scope:** what this change deliberately does NOT do

Present the spec to the user. Wait for confirmation before proceeding.

### Step 2 — Code

Implement only what the spec describes. No extra features, no cleanup beyond the task.

### Step 3 — Tests

If the change affects logic (API routes, utility functions, data transforms), write or update tests. If the project has no test runner configured, note it explicitly instead of skipping silently.

### Step 4 — Commit

Stage only the files related to the task. Write a commit message that explains the *why*, not the *what*. Format:

```
<type>: <short description>

<optional body if non-obvious>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`

### When to skip the spec

Skip Step 1 for:
- Single-file typo or copy fixes
- Trivial style/color adjustments
- Tasks the user explicitly marks as "just do it"

For everything else, spec first.