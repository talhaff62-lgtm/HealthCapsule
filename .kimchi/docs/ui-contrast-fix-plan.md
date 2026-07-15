# UI Contrast & Token Consistency Fix Plan

## Goal

Fix all low-contrast color combinations and off-token color usage across HealthCapsule so every page, component, form, and portal meets the premium navy/cream/gold brand guidelines and WCAG 2.1 AA contrast (4.5:1 for normal text).

## Source of Truth Tokens

From `src/app/globals.css`:

- Navy canvas: `bg-brand-navy` (#0b1f3a)
  - Foreground: `text-white`, `text-brand-gold-light`, `text-brand-navy-muted` only for decorative/very-large text
  - Secondary: `text-white/70`, `text-white/50`
- Page/cream canvas: `bg-brand-cream` (#f7f4ec)
  - Cards: `bg-white`, `border-brand-gray` (#efe8d6)
  - Body text: `text-brand-slate` (#13161d)
  - Secondary/muted: `text-brand-muted` (#4b5260) — only on cream/white
- Gold accents: `text-brand-gold` (#c9a24b), `bg-brand-gold`, `bg-brand-gold-light` (#f3e6c2)
- Status badges:
  - Verified: `bg-status-verified-light` + `text-status-verified`
  - Warning: `bg-status-warning-light` + `text-status-warning`
  - Emergency: `bg-status-emergency-light` + `text-status-emergency`

## Standard Button Patterns

| Type | Classes |
|------|---------|
| Primary | `bg-brand-navy text-white hover:bg-brand-navy-light` |
| Secondary/Accent | `bg-brand-gold text-brand-navy hover:bg-brand-gold-light` |
| Danger | `bg-status-emergency text-white hover:bg-status-emergency/90` or `border-status-emergency text-status-emergency bg-white` |
| Outline | `border-brand-gray bg-white text-brand-slate hover:bg-brand-cream` |

## Standard Input Pattern

```
rounded-lg border border-brand-gray bg-white px-4 py-2.5/3 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20
```

## Chunk 1 — Layout & Global Fixes (simple)

Files:
- `src/app/globals.css`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/auth/AuthStatus.tsx`

Changes:
1. Add missing `--color-brand-navy-dark: #071528;` token to `@theme` in `globals.css` (used by `WhySection`, kept for future dark accents). OR replace usage with `brand-navy`; decision left to implementer, but final code must not reference undefined tokens.
2. Navbar: change all `text-brand-navy-muted` on navy to `text-white/70` (inactive) / `text-brand-gold` (active) / `hover:text-white`.
3. Footer: change all `text-brand-navy-muted` on navy to `text-white/70`; copyright to `text-white/50`; links to `text-white hover:text-brand-gold`.
4. AuthStatus sign-out: replace `bg-status-emergency/15 text-white border-status-emergency` with solid `bg-status-emergency text-white hover:bg-status-emergency/90`.

## Chunk 2 — Public Pages (simple)

Files:
- `src/app/page.tsx`
- `src/app/doctors/page.tsx`
- `src/app/doctors/[slug]/page.tsx`
- `src/app/login/page.tsx`
- `src/app/not-found.tsx`

Changes:
1. `page.tsx` hero:
   - Description text: `text-brand-navy-muted` on navy → `text-white/70`
   - Trust badges: `text-brand-navy-muted` → `text-white/70`
   - Search card inner "Verified" ribbon: `text-brand-navy-muted` on `bg-white/5` → `text-white/70`
2. `doctors/page.tsx`: hero description `text-brand-navy-muted` on navy → `text-white/70`
3. `doctors/[slug]/page.tsx`:
   - Header metadata `text-brand-navy-muted` → `text-white/70`
   - BMDC badge `text-brand-navy-muted` on `bg-white/5` → `text-white`
   - Verified badge: ensure `text-brand-gold` and a visible bg (`bg-brand-navy-light/30` or `bg-brand-gold/10`)
4. `login/page.tsx`: verify buttons match primary pattern (likely already ok).
5. `not-found.tsx`: secondary button `border-brand-gold text-brand-navy` → `bg-brand-gold text-brand-navy hover:bg-brand-gold-light`.

## Chunk 3 — Home Components (simple)

Files:
- `src/components/home/HeroSearchCard.tsx`
- `src/components/home/HealthCapsuleAI.tsx`
- `src/components/home/FeaturedHospitals.tsx`
- `src/components/home/CtaBanner.tsx`
- `src/components/home/StatsBar.tsx`
- `src/components/home/Modules.tsx`
- `src/components/home/WhySection.tsx`
- `src/components/home/TrustSection.tsx`

Changes:
1. HeroSearchCard:
   - Inactive tabs `text-brand-muted` on cream → `text-brand-slate` (or keep muted if AA ok, but prefer slate for consistency)
   - Ambulance tab: add `text-status-emergency` explicitly
2. HealthCapsuleAI: ROADMAP badge `text-brand-navy-muted` on cream → `text-brand-slate`
3. FeaturedHospitals: capability tags `bg-brand-navy-light/10 text-brand-navy-light` → `bg-brand-navy-light text-white` or `bg-brand-cream text-brand-navy`
4. CtaBanner:
   - Descriptions `text-brand-navy-muted` on navy → `text-white/70`
   - Doctor CTA `bg-white/10 text-white border-white/15` → `border-brand-gray bg-white text-brand-slate hover:bg-brand-cream`
5. StatsBar: labels `text-brand-navy-muted` → `text-white/70`; sub-text `text-brand-muted` → `text-white/50`
6. Modules: module number `text-brand-gold/80` → `text-brand-gold`; desc `text-brand-navy-muted` on navy-light/40 → `text-white/70`
7. WhySection: replace undefined `text-brand-navy-dark` with `text-brand-navy`
8. TrustSection: ensure text on gold gradient has high contrast; use `text-brand-navy` solid, or if gradient is too light, add dark overlay and use `text-white`

## Chunk 4 — Shared Components, Portals & Forms (simple)

Files:
- `src/components/doctors/DoctorCard.tsx`
- `src/components/doctors/DoctorFilters.tsx`
- `src/components/ui/TierBadge.tsx`
- `src/components/doctor-portal/DoctorProfileForm.tsx`
- `src/components/doctor-portal/ChamberForm.tsx`
- `src/components/admin-portal/AdminDoctorRow.tsx`

Changes:
1. DoctorCard:
   - New badge `bg-brand-navy-light/10 text-brand-navy-light` → `bg-brand-navy-light text-white` or `bg-brand-cream text-brand-navy`
   - Verify `text-brand-gold-dark` usage (likely ok)
2. DoctorFilters: clear button `border-brand-gray text-brand-muted` → `border-brand-gray bg-white text-brand-slate hover:bg-brand-cream`
3. TierBadge: FREE tier `bg-tier-free-bg text-tier-free` → `bg-brand-gray text-brand-slate`
4. DoctorProfileForm: verify primary/outline buttons match standard patterns
5. ChamberForm: verify primary/outline buttons match standard patterns
6. AdminDoctorRow: verify status buttons/badges use semantic status tokens

## Acceptance Criteria

- [ ] No `text-brand-navy-muted` or `text-brand-muted` text appears on `bg-brand-navy` or navy-derived backgrounds.
- [ ] No white text appears on semi-transparent light backgrounds (`bg-white/10`, `bg-status-emergency/15`, etc.).
- [ ] No undefined Tailwind tokens (e.g., `text-brand-navy-dark` unless token is added).
- [ ] Primary/Secondary/Danger/Outline buttons follow the standard patterns.
- [ ] Inputs use `border-brand-gray` and `focus:border-brand-gold focus:ring-brand-gold/20`.
- [ ] Status badges use the correct semantic background+text pairs.
- [ ] `npm run lint` passes.
- [ ] `npm run build` succeeds.

## Verification

After all chunks are implemented, run:

```bash
npm run lint
npm run build
```

Then a Reviewer will re-scan the modified files for remaining contrast or off-token issues.
