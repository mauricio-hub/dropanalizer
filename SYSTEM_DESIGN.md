# Proply — System Design

## Architecture

```
Browser (Next.js App Router)
    ↓
API Routes (Next.js Route Handlers)
    ↓
Prisma ORM
    ↓
PostgreSQL
```

Auth: Clerk (handles sessions, user identity)
Users are synced to the DB via a Clerk webhook on `user.created`.

---

## Core Entities

### User
Synced from Clerk. Owns proposals.

```
User
  id        string (cuid)
  clerkId   string (unique)
  email     string
  name      string?
```

### Proposal
The main document. Belongs to a user. Has one or more versions.

```
Proposal
  id          string
  title       string
  description string?
  type        "service"   ← MVP only
  userId      string → User
```

### Version
An immutable snapshot of a proposal's content. A proposal can have many versions. Only one is published at a time.

```
Version
  id          string
  proposalId  string → Proposal
  version     int (1, 2, 3...)
  content     JSON  ← structured proposal content
  isPublished boolean
  publicUrl   string? (unique)
```

### Event
A tracking record tied to a version. Created when a client interacts with the public landing page.

```
Event
  id         string
  versionId  string → Version
  type       "view" | "click" | "time_spent"
  data       JSON
  createdAt  datetime
```

---

## Relationships

```
User
  └── has many → Proposal
        └── has many → Version
              └── has many → Event
```

---

## Main Flows

### 1. Create Proposal
1. Authenticated user fills title + description
2. POST /api/proposals → creates Proposal + empty Version (v1, unpublished)
3. User is redirected to proposal detail page

### 2. Publish Proposal
1. User clicks "Publish" on a version
2. POST /api/proposals/:id/publish → sets isPublished=true, generates publicUrl
3. User gets a shareable link: `/p/[publicUrl]`

### 3. View Proposal (client)
1. Client opens `/p/[publicUrl]`
2. Server fetches the published Version and renders it as a landing page
3. No authentication required

### 4. Track View
1. On load of the public landing page, the browser fires a POST /api/track
2. An Event of type "view" is created for that versionId
3. Fire-and-forget — does not block page render

### 5. Create New Version
1. User clicks "New version" on a proposal
2. POST /api/proposals/:id/versions → creates a new Version copying content from latest
3. User edits the new version and can publish it

---

## UI Patterns

### Data Tables
All data lists (proposals, catalog items) use a consistent table pattern:

```tsx
<Card className="mt-8">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/[0.06]">
          <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Column 1</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Column 2</th>
          <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item) => (
            <tr key={item.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-text-primary">{item.col1}</td>
              <td className="px-6 py-4 text-sm text-text-muted">{item.col2}</td>
              <td className="px-6 py-4 text-right">
                {/* Action buttons */}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} className="px-6 py-12 text-center text-sm text-text-muted">
              No items
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</Card>
```

**When to use:**
- Lists of proposals (Dashboard)
- Lists of catalog items (Catálogo)
- Any multi-row data listing

**When NOT to use:**
- Single forms
- Settings pages
- Single-item detail views

---

## API Surface (current scope)

| Method | Path | Description |
|---|---|---|
| GET | /api/proposals | List proposals for current user |
| POST | /api/proposals | Create proposal |
| POST | /api/webhooks/clerk | Sync Clerk user to DB |
