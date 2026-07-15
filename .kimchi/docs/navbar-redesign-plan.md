# Navbar Redesign Plan

## Goal

Update the site navigation to show public pages (Home, Healthcares, Doctors) and conditionally show a role-based portal link only when the user is authenticated.

## Auth Roles

From `prisma/schema.prisma`:
- `ADMIN` → Admin Panel (`/portal/admin`)
- `DOCTOR` → Doctor Panel (`/portal/doctor`)
- `FACILITY_ADMIN` → Hospital Panel (`/portal/facility`)
- `PATIENT` → no portal link (public user)

## Chunk 1 — Update Navbar (`simple`)

File: `src/components/layout/Navbar.tsx`

Changes:
1. Import `useSession` from `next-auth/react`.
2. Replace the static `links` array with two arrays:
   - **Public links** (always shown): Home (`/`), Healthcares (`/healthcares`), Doctors (`/doctors`)
   - **Portal link** (shown only when authenticated): derived from `session.user.role`
3. Render public links + optional portal link in desktop nav.
4. Update mobile menu to match: render public links + optional portal link.
5. Remove the mobile-only "Find a Doctor" gold CTA (redundant now that Doctors is in nav).
6. Keep `AuthStatus` component for sign-in/sign-out.

### Portal link mapping

| Role | Label | href |
|------|-------|------|
| ADMIN | Admin Panel | `/portal/admin` |
| DOCTOR | Doctor Panel | `/portal/doctor` |
| FACILITY_ADMIN | Hospital Panel | `/portal/facility` |

### Active state rules

- Exact match for Home (`/`)
- Starts-with match for portal links (`/portal/*`) and Healthcares/Doctors section pages

## Chunk 2 — Create /healthcares Page (`simple`)

File: `src/app/healthcares/page.tsx`

Create a new public page that lists verified facilities (hospitals + diagnostic centers).

Requirements:
1. Fetch facilities from Prisma where:
   - `deletedAt: null`
   - `isActive: true`
   - `verificationStatus: VERIFIED`
   - Optional: filter by `type` query param (`HOSPITAL`, `DIAGNOSTIC_CENTER`, `CLINIC`)
2. Show page title, description, and filter tabs for All / Hospitals / Diagnostic Centers.
3. Render a grid of facility cards with:
   - Name
   - Type badge
   - Area / address
   - Phone
   - "View details" link placeholder (href `#` or `/healthcares/${slug}` if detail page exists)
4. Use existing design tokens: cream canvas, white cards, navy text, gold accents.
5. Empty state when no facilities match.

Reuse existing patterns from `src/app/doctors/page.tsx` and `src/components/doctors/DoctorCard.tsx`.

## Chunk 3 — Create /portal/facility Page (`simple`)

File: `src/app/portal/facility/page.tsx`

Create a basic facility admin portal dashboard.

Requirements:
1. Server component.
2. Import `requireRole` from `@/lib/session` and check `UserRole.FACILITY_ADMIN`.
3. If not authenticated or wrong role, redirect to `/login`.
4. Fetch the facilities administered by the current user (`prisma.facility.findMany({ where: { adminId: user.id } })`).
5. Render a dashboard with:
   - Welcome heading
   - List of managed facilities
   - For each facility: name, type, verification status, quick stats (placeholder)
6. Use existing portal styling (`bg-brand-cream`, `max-w-5xl`, white cards).

## Acceptance Criteria

- [ ] Navbar shows Home, Healthcares, Doctors for all users.
- [ ] Navbar does not show Doctor Portal or Admin Portal to logged-out users.
- [ ] Authenticated users see exactly one portal link matching their role.
- [ ] `/healthcares` renders without errors and lists verified facilities.
- [ ] `/portal/facility` is accessible only to FACILITY_ADMIN users.
- [ ] `npm run lint` passes (0 errors).
- [ ] `npm run build` succeeds.
