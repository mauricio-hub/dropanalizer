# Project: Proply

## Product Overview
Proply is a SaaS platform that allows freelancers and companies to create, send, and optimize commercial proposals as dynamic landing pages.

The goal is to help users close deals faster by:
- Structuring professional proposals
- Tracking client behavior
- Enabling versioning and iteration
- Using AI to improve proposals over time

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