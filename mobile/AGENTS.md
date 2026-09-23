# HealthCapsule Mobile — Agent Guide

Expo app for HealthCapsule, the verified doctor directory focused on
Chattogram, Bangladesh. It serves patients (read-only directory) plus
in-app staff and admin panels behind a signed-in account. Read this
before changing any file.

## 1. Product

- **Audiences:**
  - **Patients** in Chattogram searching for verified doctors and
    diagnostic centres. No account required.
  - **Staff** signing in to submit facilities and doctors for review.
  - **Admins** signing in to verify or reject those submissions and
    manage staff accounts.
- **Goals:** help a patient find a doctor or diagnostic centre, see
  verified credentials, and reach a public chamber line (call or
  WhatsApp) without exposing personal data; give staff a field tool to
  collect new entries; give admins a review queue.
- **Non-goals:**
  - No patient accounts. Patients stay read-only; provider
    self-service registration lives in `web/`.
  - No appointment booking, payments, or telemedicine.
  - No prescription or chat with doctors.
  - No emojis as structural icons. Use `expo-symbols` or text labels only.

## 2. Surface

### Patient tabs (group `(tabs)`, unchanged routes)

| Tab         | Route                    | Purpose                                                      |
|-------------|--------------------------|--------------------------------------------------------------|
| Home        | `(tabs)/index.tsx`       | Navy hero, composite home payload, suggested/featured rows   |
| Doctors     | `(tabs)/doctors.tsx`     | Search, specialty/area filters, performant FlatList          |
| Diagnostics | `(tabs)/diagnostics.tsx` | Diagnostic centres only, search, area filter                 |
| More        | `(tabs)/more.tsx`        | Register link, Sign in row, panel/sign-out rows when signed in |

Patient detail routes:

- `doctors/[slug].tsx` — doctor profile.
- `facilities/[slug].tsx` — diagnostic centre detail.

`More` shows an external "Register as a provider" link
(`https://www.healthcapsule.app/register`), an in-app **Sign in** row, and
— once signed in with role `STAFF` or `ADMIN` — "Open staff panel" /
"Open admin panel" and "Sign out" rows. Staff and admin rows push
`/staff` or `/admin`; both new route groups are guarded (see §4).

### Auth

- `auth/sign-in.tsx` — email + password form. On success it stores the
  token and routes panel roles to `/staff`; non-panel users go back to
  `/(tabs)`.
- `src/lib/auth-context.tsx` exports `AuthProvider` and `useAuth()`.
  `AuthProvider` is mounted in `src/app/_layout.tsx`. `useAuth()` returns
  `{ status, user, token, signIn, signOut }`; `status` is
  `"loading" | "signedOut" | "signedIn"`.
- `src/lib/token-store.ts` persists the token under key `"hc_token"` —
  `expo-secure-store` on native, `localStorage` on web.

### Staff panel (group `staff/`)

| Route            | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| `index.tsx`      | Hub: greeting, add facility, add doctor, check entries, recent |
| `new-facility.tsx` | Facility submission form                                     |
| `new-doctor.tsx` | Doctor submission form                                         |
| `submissions.tsx` | Merged expandable list of my submissions + status + reason    |
| `directory.tsx`  | Read-only Facilities/Doctors search                            |

`staff/_layout.tsx` guards `STAFF` or `ADMIN`; anyone else is redirected
to `auth/sign-in`. Facility submission chains into the doctor form with
the new facility prefilled via route params; the doctor form also reads
the module-level store in `src/lib/last-facility.ts` when no params are
present.

### Admin panel (group `admin/`)

| Route            | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| `index.tsx`      | Dashboard: 2x2 stat grid (hospitals, doctors, pending, staff) |
| `review.tsx`     | Pending queue, expandable detail before Verify / Reject        |
| `entries.tsx`    | All facilities/doctors, status filter, search, per-status actions |
| `staff.tsx`      | User list with counts + create-staff form                      |
| `admin-shared.tsx` | Shared helpers/components **not** a route                    |

`admin/_layout.tsx` guards `ADMIN` only. Reject requires a reason;
"Hide from site" is the unverify action.

All routes live in `src/app/`. Anything reusable lives in
`src/components/`, `src/api/`, `src/utils/`, `src/hooks/`, `src/data/`,
`src/types/`, `src/lib/`, or `src/theme/`.

## 3. Architecture

```
mobile/
  app.json                 # Expo config; name=HealthCapsule, scheme=healthcapsule
  package.json             # Expo template packages + expo-secure-store; scripts
  tsconfig.json            # strict, "@/*" -> "./src/*"
  expo-env.d.ts            # EXPO_PUBLIC_* typing
  .env.example             # EXPO_PUBLIC_API_URL default (non-secret)
  .agents/skills/          # pinned Expo skill guides (see §10)
  src/
    app/                   # Expo Router routes (file-based)
      _layout.tsx          # AuthProvider, FixtureBanner, root Stack
      (tabs)/
        _layout.tsx        # NativeTabs (ThemeProvider + 4 triggers)
        index.tsx          # Home
        doctors.tsx
        diagnostics.tsx
        more.tsx
      doctors/[slug].tsx
      facilities/[slug].tsx
      auth/sign-in.tsx
      staff/
        _layout.tsx        # STAFF|ADMIN guard
        index.tsx
        new-facility.tsx
        new-doctor.tsx
        submissions.tsx
        directory.tsx
      admin/
        _layout.tsx        # ADMIN guard
        index.tsx
        review.tsx
        entries.tsx
        staff.tsx
        admin-shared.tsx   # helpers/components, not a route
    api/
      config.ts            # apiFetch + authFetch, timeouts, ApiError, base URL
      index.ts             # public reads: getHome, listDoctors, getDoctor, ...
      panel.ts             # Bearer-auth staff/admin calls (see §4)
    components/            # one named export each, kebab-case
      doctor-card.tsx
      facility-card.tsx
      fixture-banner.tsx
      panel-ui.tsx         # Button, LabeledInput, LabeledTextArea, Card, SectionTitle
      section.tsx
      skeleton.tsx         # Skeleton, EmptyState, ErrorState, LoadingState
      status-badge.tsx     # PENDING/VERIFIED/REJECTED pill
      verified-badge.tsx
    data/
      fixtures.ts          # offline fallback only (DEV + localhost API)
    hooks/
      use-data.ts          # tiny useAsync(reloader, deps)
      use-debounce.ts      # useDebounce(value, ms)
    lib/
      auth-context.tsx     # AuthProvider + useAuth
      token-store.ts       # hc_token via SecureStore / localStorage
      last-facility.ts     # module store for the last added facility
    theme/
      index.ts             # colors / fonts / spacing / radius / minTouch
    types/
      dto.ts               # shared DTO shapes (v1)
    utils/
      dto.ts               # defensive parsers for the DTO types
      dto.test.ts
      phone.ts             # normalizeBangladeshMobile + tel/whatsapp URIs
      phone.test.ts
      labels.ts            # facilityTypeLabel
      open-uri.ts          # openExternalUri helper
      stale-guard.ts       # createStaleGuard (out-of-order response guard)
      api-url.test.ts
      api-fixtures.test.ts
      home-facilities.test.ts
      stale-guard.test.ts
    screens/               # empty; screen bodies live in app/ routes today
```

## 4. API trust boundary

The mobile app talks to the Next.js `/api/v1/*` surface in `web/`. The
old `/api/mobile/*` surface no longer exists.

### Public patient reads (no auth)

- `GET /api/v1/public/filters`
- `GET /api/v1/public/doctors` and `/api/v1/public/doctors/[slug]`
- `GET /api/v1/public/facilities` and `/api/v1/public/facilities/[slug]`

These endpoints expose only records that are verified, active
(`isActive`) and not soft-deleted (`deletedAt: null`). The client still
renders the `flags.verified` value it receives.

### Panel calls (Bearer auth)

`src/api/panel.ts` sends `Authorization: Bearer <token>` via `authFetch`.
Login is `POST /api/v1/auth/login` with `{ email, password }`, returning
`{ token, user: { id, name, email, role } }`. Panel endpoints cover
`/api/v1/auth/me`, `/api/v1/facilities/*`, `/api/v1/doctors/*`,
`/api/v1/amenities`, `/api/v1/areas`, `/api/v1/specialties`, and
`/api/v1/users`. Backend roles are `STAFF` and `ADMIN`.

### Rules

- **Read-only for patients.** Patient surfaces issue only GETs on
  `/api/v1/public/*`. All writes come from the signed-in panels.
- **DTOs only.** `src/types/dto.ts` defines every shape the app expects.
  `src/utils/dto.ts` parses defensively so the UI never crashes on
  partial data.
- **Never trust the network.** Every list/detail screen renders
  loading -> error/empty -> content. Errors carry a "Try again" button.
- **Offline fallback.** In `__DEV__` when `EXPO_PUBLIC_API_URL` is unset
  or points at localhost, `src/api/index.ts` falls back to fixtures in
  `src/data/fixtures.ts`. Fixtures are banner-marked and never reach
  production builds.
- **Phone normalization.** `src/utils/phone.ts` is the single source of
  truth for `tel:` and `https://wa.me/` URIs. WhatsApp only fires for a
  valid Bangladesh mobile (01[3-9]XXXXXXXX). Call uses the facility's
  public `phone` field, never `User.phone`.
- **Auth transport.** Only `authFetch` may attach the Bearer token.
  Never log a token, password, or `User.phone`.

## 5. Promotion language

Doctors and facilities carry three flags:

- `verified` — verificationStatus == VERIFIED AND not soft-deleted AND active.
- `suggested` — listingTier ∈ {FEATURED, PREMIUM} AND
  (featuredUntil is null OR featuredUntil >= now).
- `new` — registrationYear within 1 calendar year (doctors) or
  establishedYear within 1 year (facilities).

UI uses these three flags as badges (`src/components/verified-badge.tsx`).
Suggested uses the amber tone (`colors.suggested`) only when the list is
opt-in by the user; otherwise show "Verified" first.

`Home` fills its `suggestedDoctors` list with `recentlyVerifiedDoctors`
when the featured pool is short. Never invent counts.

### Verification status (panels)

`verificationStatus` is `PENDING | VERIFIED | REJECTED` and renders
through `src/components/status-badge.tsx`:

- **PENDING** — amber ("Pending").
- **VERIFIED** — green ("Verified"). VERIFIED + `isActive` means the
  record is visible on the public website.
- **REJECTED** — red ("Rejected"), and shows `rejectReason`.

## 6. Auth and roles

- `AuthProvider` (`src/lib/auth-context.tsx`) is mounted once in
  `src/app/_layout.tsx` and restores a stored token on launch by calling
  `/api/v1/auth/me`. A failed restore clears the token.
- `useAuth()` is the only way to read `user`, `token`, or `status`, and
  the only way to call `signIn` / `signOut`.
- Route groups enforce roles in their `_layout.tsx`: `staff/` allows
  `STAFF` or `ADMIN`; `admin/` allows `ADMIN` only. Unauthorized users
  are redirected to `auth/sign-in`; while `status === "loading"` the
  layout renders nothing.
- `sign-in.tsx` routes any panel role to `/staff` after login; an admin
  reaches the admin console from `More` -> "Open admin panel". Do not
  assume sign-in lands admins on `/admin`.
- Demo accounts exist for testing. Never put credentials in this doc, in
  code comments, or in fixtures.

## 7. Visual & accessibility standards

### Tokens (`src/theme/index.ts`)

Export names `colors` / `spacing` / `radius` / `minTouch` are stable.

- Canvas: cool neutral `#f1f5f9`.
- Surface: native semantic color, white fallback; `surfaceMuted #e8eef4`,
  `border #dbe3ec`.
- Primary: navy `#0b1f3a`; `accent` sky `#0ea5e9`.
- Contact: green `#1F7A4D` for Call/WhatsApp.
- Suggested / warning: amber `#d97706` (10–14% tinted background).
- Verified: green `#16a34a`. Danger: `#dc2626`.
- `fonts.display`: serif (`Georgia` on iOS, `serif` elsewhere).
- Radius: `sm 6` / `md 8` / `lg 16` / `pill 999`.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32.
- Touch targets: minimum 44 dp (`minTouch`).

### Typography & layout

- Use `Stack.Title` / `Stack.Screen` for navigation titles; never duplicate.
- `<Text selectable />` for data the user may need to copy (phones, fees).
- Counters (fees) use `fontVariant: ["tabular-nums"]`.
- Tabular/lists wrap on Dynamic Type — no fixed widths on text.
- Hero headers live inside `ScrollView contentContainerStyle`, not on the
  `ScrollView` itself (avoids clipping per `expo-native-ui`).
- `contentInsetAdjustmentBehavior="automatic"` on every top-level scroll.

### Accessibility

- Every interactive element has `accessibilityRole` and an `accessibilityLabel`.
- Hints describe what tapping does ("Opens doctor details").
- Status colors are paired with text or iconography (verified / suggested / new).
- `accessibilityElementsHidden` on skeletons so they are not announced.
- Decorative SVGs/icons are not announced.
- Segmented controls expose `accessibilityState={{ selected }}`;
  expandable rows expose `accessibilityState={{ expanded }}`.

### Motion

- Respect `prefers-reduced-motion`. Avoid layout-affecting animations; keep
  interactions to opacity presses.
- No gradients, no orbs, no nested cards, no decorative blurs.

### Responsive

- Use `useWindowDimensions()` (never `Dimensions.get()`).
- ≥768 dp width uses a 2-column grid for facility cards on Home.
- Phone-first: ensure single-column stacks wrap cleanly when text grows.

## 8. States (every list & detail screen)

- **Loading:** skeleton cards (`SkeletonCard`) or `LoadingState` spinner.
- **Empty:** `EmptyState` with a clear title and an optional action.
- **Error:** `ErrorState` with selectable error message and "Try again".
- **Offline:** API failure with localhost fallback shows a console warning
  and renders fixtures with the FIXTURE banner present in code.

Panel screens (staff and admin) reuse the same skeleton, empty, and error
components.

## 9. Commands

```bash
# Install
npm install

# Type-check
npm run typecheck        # tsc --noEmit

# Tests (Node assert; no framework)
npm test                 # node --test src/utils/*.test.ts

# Develop
npm run start            # expo start — try Expo Go first
npm run android
npm run ios
npm run web
```

## 10. Guardrails

### Dependencies

- Keep the dependency surface to installed Expo packages plus
  `expo-secure-store` (`~57.0.4`), the only package added for auth. Add a
  package only when there is no stdlib/native equivalent and confirm via
  `npx expo install <pkg>` — never via raw `npm install <pkg>` for Expo
  packages.
- Do not add state or data-fetching libraries (React Query, SWR, Zustand)
  at this scope. `useAsync` in `src/hooks/use-data.ts` covers current needs.

### Typed routes

- `app.json` has `experiments.typedRoutes: true`. New routes are pushed
  with `as never` casts (`router.push("/staff" as never)`) until the route
  types regenerate — this is the existing pattern in `sign-in.tsx`,
  `more.tsx`, and the panel screens. Keep it consistent; do not silence
  types with `any`.

### Secrets

- `EXPO_PUBLIC_*` vars are inlined into the bundle. Never put a write key,
  database password, or verifier token there.
- Mobile never reads the database directly. All data flows from `web/`.
- Auth tokens live only in `src/lib/token-store.ts`. Never log
  `User.phone`, password hashes, or session tokens, and never hardcode
  demo credentials.

### Database

- The mobile app does not touch Prisma or migrations. Schema changes belong
  to `web/prisma/schema.prisma`.

### Release

- Bump `app.json` version on user-visible releases.
- iOS bundle id: `com.healthcapsule.patient`.
- Android package: `com.healthcapsule.patient`.
- URL scheme: `healthcapsule` (deep linking stable).

## 11. Skill locations

Official skills are installed under `mobile/.agents/skills/`. Read the
matching `SKILL.md` before doing any of the following:

- `expo-router/SKILL.md` — navigation, stacks, tabs, headers, link previews.
- `expo-native-ui/SKILL.md` — styling, semantic colors, controls, animations.
- `expo-data-fetching/SKILL.md` — fetch, error handling, env, cancellation.
- `expo-project-structure/SKILL.md` — folder layout, co-location, naming.

`skills-lock.json` pins skill versions — do not edit by hand.

## 12. Definition of done

- `npm run typecheck` passes.
- `npm test` passes.
- Every list/detail screen renders loading, empty, error, and content states.
- Every CTA (Call, WhatsApp) only fires when its data passes `phone.ts`.
- No `User.*` private field appears in any DTO or log.
- Fixture banner is present where fixtures are used.
- All buttons meet 44 dp minimum hit target.
- Staff routes reject non-`STAFF`/`ADMIN` users; admin routes reject
  non-`ADMIN` users.
- Reject actions always send a non-empty reason.
