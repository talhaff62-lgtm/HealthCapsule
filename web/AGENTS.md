# Capsule — Agent Guide

This document gives every agent working on Capsule the context needed to write code that fits the existing codebase. Read this before making changes. (repo/package names still healthcapsule-app — do not rename identifiers.)

## Product Overview

Capsule is a verified doctor directory focused on **Chattogram, Bangladesh**.

- Patients search doctors by specialty, area, or name.
- Doctors manage their public profile and chambers through a portal.
- Admins review and verify doctor registrations.

The live public surface is small and deliberate: home page, doctor listing, doctor detail page, login, and two role-based portals (admin + doctor).

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.10 (App Router) |
| Runtime | React 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| ORM / DB | Prisma 7.8.0 + PostgreSQL (via `@prisma/adapter-pg`) |
| Auth | NextAuth 4 (credentials provider, phone + password) |
| Icons | `lucide-react` |
| Fonts | Inter (sans), Fraunces (serif), IBM Plex Mono (mono) via `next/font/google` |
| Scripts | `npm run dev`, `npm run build`, `npm run lint`, `npm run seed` |

> **Important:** This repo uses **Tailwind CSS v4** with the new `@theme` block in `globals.css`. Do not use `tailwind.config.js` or the older plugin API.

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    page.tsx            # Landing page (hero + search + features)
    doctors/page.tsx    # Doctor search results
    doctors/[slug]/     # Doctor public profile
    login/page.tsx      # Credentials login
    portal/page.tsx     # Role-based redirect
    portal/admin/       # Admin verification dashboard
    portal/doctor/      # Doctor profile editor
    globals.css         # Tailwind v4 theme + custom utilities
    layout.tsx          # Root layout with fonts, Navbar, Footer
  components/
    layout/             # Navbar, Footer
    doctors/            # DoctorCard, DoctorFilters
    doctor-portal/      # DoctorProfileForm, ChamberForm
    admin-portal/       # AdminDoctorRow
    auth/               # AuthStatus
    providers/          # SessionProvider
  lib/
    prisma.ts           # Prisma client singleton
    doctors.ts          # Doctor search helpers + types
    session.ts          # Role guards for server components
    auth.ts             # NextAuth configuration
    hooks/              # Custom React hooks
  types/                # Global type extensions
prisma/
  schema.prisma         # Source of truth for data model
  migrations/           # Generated migrations
  seed.ts               # Seed script
```

## Design System

The brand direction is **professional healthcare, trustworthy, and local** — not a generic health-tech template.

### Color Tokens (from `globals.css`)

```
--color-brand-navy:       #0b1f3a   /* primary dark, headers, footer */
--color-brand-navy-light: #1e3a66
--color-brand-navy-muted: #7e8faa
--color-brand-sky:       #0ea5e9   /* medical accent, CTAs, links */
--color-brand-sky-dark:  #0284c7   /* hover */
--color-brand-sky-bright:#38bdf8   /* highlight text, icons */
--color-brand-sky-bg:     #e0f2fe   /* accent backgrounds */
--color-brand-cloud:      #f1f5f9   /* page canvas — cool off-white */
--color-brand-cloud-dark: #e2e8f0   /* darker border/divider */
--color-brand-slate:      #13161d   /* body text */
--color-brand-muted:      #4b5260   /* secondary text */
--color-brand-gray:       #e2e8f0   /* borders, dividers */
--color-status-verified:  #059669
--color-status-warning:   #d97706
--color-status-emergency: #dc2626
```

### Typography

- **Display / headings:** `font-serif` (Fraunces)
- **Body / UI:** `font-sans` (Inter)
- **Labels / data:** `font-mono` (IBM Plex Mono) for uppercase tracking-wider labels

Use uppercase, tracking-wider, text-xs for form labels and eyebrow text.

### Spacing & Shape

- Max content width: `max-w-7xl` for marketing pages, `max-w-5xl` / `max-w-3xl` for portals.
- Section padding: `py-10` to `py-20`.
- Cards: `rounded-2xl`, `bg-white`, `border border-brand-gray`, optional `shadow-sm`.
- Interactive card hover: use the existing `.premium-card` utility.
- Buttons: `rounded-lg` or `rounded-full` for primary CTAs. Prefer `bg-brand-sky` (accent CTA) and `bg-brand-navy` (primary).

### Existing UI Conventions

- All pages use `bg-brand-cloud` as the canvas and `bg-white` for cards.
- Form inputs share one style: `rounded-lg border border-brand-gray bg-white px-4 py-2.5/3 focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20`.
- Empty states are centered inside `rounded-2xl border border-brand-gray bg-white` cards.
- Loading states: `Loader2` spinner with `animate-spin` or skeleton pulse.
- The product uses **Bangladeshi Taka (৳)** for fees.

## Component Patterns

- Server components by default; only add `"use client"` when you need browser APIs, event handlers, or NextAuth session hooks.
- Colocate new components under `src/components/<domain>/`.
- Keep components focused. Split at ~200 lines.
- Separate data fetching (server component / container) from presentation.
- Use TypeScript props interfaces; export reusable types from `lib/doctors.ts` or a local `types.ts`.
- Prefer composition over configuration props.

## Accessibility

- WCAG 2.1 AA is the floor.
- Every interactive element must be keyboard accessible (prefer native `<button>` / `<a>`).
- Label every form input (`htmlFor` + `id` or `aria-label`).
- Respect `prefers-reduced-motion`.
- Test responsive behavior at 320px, 768px, 1024px, 1440px.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm run seed     # Seed local database
npx prisma migrate dev   # Run migrations in dev
npx prisma generate      # Regenerate Prisma client
```

## Database Reminders

- Always check `prisma/schema.prisma` before assuming entity names or relationships.
- Soft deletes are common (`deletedAt`). Filter with `deletedAt: null` in public queries.
- User roles: `ADMIN`, `DOCTOR`.
- Doctor verification statuses: `PENDING`, `VERIFIED`, `REJECTED`.

## What to Avoid

- Generic "AI aesthetic": purple gradients, indigo defaults, oversized rounded cards, stock hero layouts.
- Raw hex colors outside the token set.
- Inline styles or arbitrary pixel values that break the spacing scale.
- Removing the cool-cloud background or switching to a pure white page canvas without a clear design reason.
- Adding heavy global animation libraries — prefer CSS transitions and targeted motion.
- Prop drilling deeper than 2–3 levels.

## When in Doubt

- Look at `src/app/page.tsx` and `src/components/doctors/DoctorCard.tsx` for the current visual standard.
- Run `npm run lint` before finishing.
- Keep the UI **focused, trustworthy, and local to Chattogram**.
