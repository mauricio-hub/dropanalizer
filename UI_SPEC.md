# Dropanalizer — UI Spec

Inspired by [Protocol (Tailwind UI)](https://protocol.tailwindui.com/). Dark, minimal, professional.

---

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `background` | `#0B0F14` | Page background |
| `surface` | `#111827` | Cards, sidebar, panels |
| `border` | `rgba(255,255,255,0.08)` | All borders |
| `accent` | `#22C55E` | Primary actions, active states |
| `accent-hover` | `#16A34A` | Hover on primary buttons |
| `text-primary` | `#F9FAFB` | Headings, body |
| `text-secondary` | `#9CA3AF` | Subtitles, labels |
| `text-muted` | `#6B7280` | Placeholders, hints |

All tokens are defined in `tailwind.config.js` and as CSS vars in `globals.css`.

---

## Typography

- Font: Inter (system default via Next.js)
- Headings: `font-semibold`, `text-text-primary`
- Body: `text-sm`, `text-text-secondary`
- Muted: `text-xs`, `text-text-muted`

---

## Spacing & Layout

- Max width: `max-w-6xl` (1152px), centered with `mx-auto`
- Horizontal padding: `px-6` (24px)
- Section gaps: `py-6` between major sections
- Component gaps: `gap-3` or `gap-4`

---

## Border Radius

- Small elements (badges, inputs): `rounded-lg` (8px)
- Cards, buttons: `rounded-xl` (12px)
- Large hero/modal: `rounded-2xl` (16px)

---

## Shadows

| Name | Value | Usage |
|---|---|---|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)` | Cards |
| `shadow-glow-green` | `0 0 20px rgba(34,197,94,0.15)` | Focused primary button |
| `shadow-glow-green-sm` | `0 0 10px rgba(34,197,94,0.10)` | Hover on primary button |

---

## Components

All in `src/components/ui/`.

### Button — `Button.tsx`

```tsx
<Button variant="primary">Create Proposal</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Learn more</Button>
```

| Variant | Style |
|---|---|
| `primary` | Green bg, dark text, green glow on hover |
| `secondary` | Dark bg, white border (8% opacity), subtle hover fill |
| `ghost` | No bg, muted text, faint hover fill |

Sizes: `sm` / `md` (default) / `lg`

---

### Card — `Card.tsx`

```tsx
<Card>...</Card>
<Card hover>...</Card>  {/* adds hover border + green glow */}
```

Dark surface (`#111827`), `rounded-xl`, subtle border and shadow.
`hover` prop adds hover state for clickable cards.

---

### Container — `Container.tsx`

```tsx
<Container>...</Container>
```

`max-w-6xl`, centered, `px-6` padding.

---

### PageHeader — `PageHeader.tsx`

```tsx
<PageHeader
  title="My Proposals"
  subtitle="Manage and send your commercial proposals"
  actions={<Button>New Proposal</Button>}
/>
```

Two-column layout: title/subtitle left, actions right.

---

### Sidebar — `Sidebar.tsx`

```tsx
<Sidebar
  items={[
    { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
    { label: 'Proposals', href: '/proposals', icon: <FileTextIcon /> },
  ]}
  footer={<UserButton />}
/>
```

- Width: `w-60` (240px)
- Active item: `bg-accent/10 text-accent` (green tint + green text)
- Inactive: `text-text-secondary`, hover `text-text-primary`
- Logo in header: "Pro**ply**" with green accent on "ply"

---

### Topbar — `Topbar.tsx`

```tsx
<Topbar
  left={<Breadcrumb />}
  right={<UserButton />}
/>
```

- Height: `h-14` (56px)
- Sticky, `backdrop-blur-md`, semi-transparent background
- Separator border bottom: `border-white/[0.08]`

---

## Hero / Gradient Sections

Use `bg-hero-gradient` (defined in tailwind config) for page hero areas:

```tsx
<div className="bg-hero-gradient rounded-2xl p-10">
  ...
</div>
```

Gradient goes: `#0B0F14` (60%) → subtle green tint (100%)

---

## Rules

1. Never use light backgrounds — all surfaces are dark
2. Never use blue as accent — green only (`#22C55E`)
3. Always use `border-white/[0.08]` for borders, never `border-gray-*`
4. Text on dark: use `text-text-primary`, `text-text-secondary`, `text-text-muted`
5. Cards always use `bg-surface` (`#111827`), never pure black
6. Buttons use `rounded-xl`, never `rounded-full` (except avatars)
7. Avoid heavy shadows — use `shadow-card` or `shadow-glow-green-sm` max
