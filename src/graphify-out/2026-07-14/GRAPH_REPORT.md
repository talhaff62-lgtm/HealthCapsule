# Graph Report - src  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 215 nodes · 338 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21355ed1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AdminFacilityRow.tsx
- requireRole
- page.tsx
- page.tsx
- layout.tsx
- actions.ts
- actions.ts
- prisma.ts
- session.ts
- page.tsx
- next-auth.d.ts
- FeaturedHospitals.tsx
- not-found.tsx
- middleware.ts

## God Nodes (most connected - your core abstractions)
1. `requireRole()` - 19 edges
2. `getFacilityTypeLabel()` - 7 edges
3. `registerDoctor()` - 6 edges
4. `registerFacility()` - 6 edges
5. `DoctorProfilePage()` - 5 edges
6. `updateChamber()` - 5 edges
7. `deleteChamber()` - 5 edges
8. `DoctorCard()` - 5 edges
9. `TierBadge()` - 5 edges
10. `parseFacilityType()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `DoctorPortalPage()` --calls--> `requireRole()`  [EXTRACTED]
  app/portal/doctor/page.tsx → lib/session.ts
- `AdminPortalPage()` --calls--> `requireRole()`  [EXTRACTED]
  app/portal/admin/page.tsx → lib/session.ts
- `createChamber()` --calls--> `requireRole()`  [EXTRACTED]
  app/portal/doctor/chambers/actions.ts → lib/session.ts
- `updateChamber()` --calls--> `requireRole()`  [EXTRACTED]
  app/portal/doctor/chambers/actions.ts → lib/session.ts
- `deleteChamber()` --calls--> `requireRole()`  [EXTRACTED]
  app/portal/doctor/chambers/actions.ts → lib/session.ts

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "AdminFacilityRow.tsx"
Cohesion: 0.12
Nodes (22): HealthcaresPage(), metadata, SearchParams, TABS, TYPE_BADGE_CLASS, FacilityProfilePage(), FacilityProfilePageProps, generateMetadata() (+14 more)

### Community 1 - "requireRole"
Cohesion: 0.12
Nodes (19): AdminActionResult, setFacilityListingTier(), setFacilityVerificationStatus(), setListingTier(), setVerificationStatus(), AdminPortalPage(), AdminType, metadata (+11 more)

### Community 2 - "page.tsx"
Cohesion: 0.12
Nodes (12): getFilterOptions(), Home(), metadata, HealthCapsuleAI(), HeroSearchCardProps, Option, HowItWorks(), Modules() (+4 more)

### Community 3 - "page.tsx"
Cohesion: 0.16
Nodes (15): DoctorsPage(), metadata, SearchParams, DoctorCard(), DoctorCardProps, DoctorFilters(), DoctorFiltersProps, FilterOption (+7 more)

### Community 4 - "layout.tsx"
Cohesion: 0.12
Nodes (12): fraunces, ibmPlexMono, inter, metadata, AuthStatus(), Footer(), isActive(), Navbar() (+4 more)

### Community 5 - "actions.ts"
Cohesion: 0.20
Nodes (14): isUniqueConstraintError(), registerDoctor(), RegisterDoctorInput, registerFacility(), RegisterFacilityInput, RegisterResult, sanitizePhone(), validateCommon() (+6 more)

### Community 6 - "actions.ts"
Cohesion: 0.21
Nodes (14): ChamberResult, createChamber(), deleteChamber(), isValidSchedule(), parseSchedules(), ScheduleInput, updateChamber(), verifyDoctorOwnsChamber() (+6 more)

### Community 7 - "prisma.ts"
Cohesion: 0.19
Nodes (8): updateDoctorProfile(), UpdateProfileResult, DoctorPortalPage(), metadata, DoctorProfileFormProps, adapter, globalForPrisma, pool

### Community 8 - "session.ts"
Cohesion: 0.24
Nodes (8): handler, metadata, RegisterPage(), RegisterPageProps, VALID_TYPES, authOptions, getCurrentUser(), requireAuth()

### Community 9 - "page.tsx"
Cohesion: 0.29
Nodes (9): DoctorProfilePage(), DoctorProfilePageProps, formatFee(), generateMetadata(), getInitials(), getVerifiedDoctorBySlug(), VerifiedBadge(), VerifiedBadgeProps (+1 more)

### Community 10 - "next-auth.d.ts"
Cohesion: 0.25
Nodes (6): Audiences(), JWT, next-auth, next-auth/jwt, Session, User

### Community 11 - "FeaturedHospitals.tsx"
Cohesion: 0.32
Nodes (6): fallbackFacilities, FeaturedHospitals(), getFeaturedFacilities(), facilityConfig, FacilityTypeBadge(), FacilityTypeBadgeProps

## Knowledge Gaps
- **71 isolated node(s):** `handler`, `DoctorProfilePageProps`, `metadata`, `SearchParams`, `FacilityProfilePageProps` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireRole()` connect `requireRole` to `session.ts`, `actions.ts`, `prisma.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `handler`, `DoctorProfilePageProps`, `metadata` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdminFacilityRow.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
- **Should `requireRole` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11857707509881422 - nodes in this community are weakly interconnected._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12105263157894737 - nodes in this community are weakly interconnected._