# Navbar Redesign Review

## Verdict: NEEDS_FIXES

The implementation is structurally sound, type-safe, and builds successfully, but two plan requirements are missing from the reviewed files, and a related auth component has an inconsistency that affects the new facility-admin flow.

---

## Issues

### 1. Missing "View details" link on facility cards

**File:** `/mnt/d/Work/healthcapsule-app/src/app/healthcares/page.tsx`

**Lines:** 124–166 (the `facilities.map` card body)

**Problem:** The plan explicitly requires each facility card to include a "View details" link placeholder (`href="#"` or `/healthcares/${slug}` if the detail page exists). The current card renders name, type badge, area, address, and phone, but has no call-to-action or details link.

**Suggested fix:** Add a footer link inside each `<article>`, e.g.:

```tsx
<div className="mt-auto border-t border-brand-gray pt-3">
  <Link
    href="#"
    className="inline-flex items-center text-xs font-semibold text-brand-navy hover:text-brand-gold"
  >
    View details
  </Link>
</div>
```

Use `href={`/healthcares/${facility.slug}`}` only after a detail page is created; until then `#` matches the plan's placeholder allowance.

---

### 2. Missing "quick stats (placeholder)" on facility portal cards

**File:** `/mnt/d/Work/healthcapsule-app/src/app/portal/facility/page.tsx`

**Lines:** 78–96 (inside the `facilities.map` card body)

**Problem:** The plan requires the facility portal dashboard to show, for each facility: name, type, verification status, and **quick stats (placeholder)**. The current card shows name, area/address, type, and verification status, but no placeholder stats (e.g., placeholder counts for doctors, chambers, appointments, or a simple "Stats coming soon" block).

**Suggested fix:** Add a small placeholder stats row inside each card, for example:

```tsx
<div className="mt-4 grid grid-cols-3 gap-2 border-t border-brand-gray pt-4">
  <div className="text-center">
    <p className="text-xs text-brand-muted">Doctors</p>
    <p className="font-mono text-sm font-semibold text-brand-navy">—</p>
  </div>
  <div className="text-center">
    <p className="text-xs text-brand-muted">Chambers</p>
    <p className="font-mono text-sm font-semibold text-brand-navy">—</p>
  </div>
  <div className="text-center">
    <p className="text-xs text-brand-muted">Appointments</p>
    <p className="font-mono text-sm font-semibold text-brand-navy">—</p>
  </div>
</div>
```

---

### 3. AuthStatus does not display a label for FACILITY_ADMIN users

**File:** `/mnt/d/Work/healthcapsule-app/src/components/auth/AuthStatus.tsx`

**Lines:** 14–28 (the authenticated user branch)

**Problem:** When a user with the `FACILITY_ADMIN` role is signed in, the role label falls through the existing ternary and renders nothing, leaving only the Sign-out button. Since the redesign adds the Hospital Panel portal link for this role, the header should identify them consistently with how it identifies Admins and Doctors.

**Suggested fix:** Replace the role label logic with an exhaustive mapping:

```tsx
const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  FACILITY_ADMIN: "Facility Admin",
};

// Then in the returned JSX:
<span className="hidden text-sm text-brand-gold-light/90 font-medium sm:inline">
  {roleLabel[session.user.role] ?? session.user.role}
</span>
```

---

## Build / Lint Summary

- **Lint:** `npm run lint` passed with **0 errors** and 11 pre-existing warnings. None of the warnings originate from the three reviewed files.
- **TypeScript:** `npx tsc --noEmit` completed with no errors.
- **Build:** `npm run build` succeeded. Route table confirms the new pages are compiled:
  - `ƒ /healthcares` (dynamic / server-rendered)
  - `ƒ /portal/facility` (dynamic / server-rendered)

---

## Other Observations

- **Navbar role logic is correct:** public links are always shown; the portal link is computed from `session.user.role` and only appended when a matching role exists. Desktop and mobile menus render the same `navLinks` array.
- **Active state behavior matches the spec:** exact match for `/`, starts-with match for `/healthcares`, `/doctors`, and `/portal/*`.
- **Healthcares filtering works correctly:** query params are awaited, parsed against the Prisma `FacilityType` enum, and applied to the Prisma `where` clause. Empty state is present.
- **Facility portal authorization is correct:** it calls `requireRole(UserRole.FACILITY_ADMIN)`, catches failures, and redirects to `/login`.
- **Facility portal page is not bloated:** it is concise and follows the existing portal styling (`bg-brand-cream`, `max-w-5xl`, white cards). No over-engineering was found.
- **Design tokens:** All Tailwind theme classes used in the reviewed files are defined in `src/app/globals.css`.
