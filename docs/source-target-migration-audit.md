# IIITians Network Source-to-Next.js Migration Audit

Date: 2026-05-29

## Repositories

- Source: `C:\Users\ankur\Documents\9.MainProjects\3.0.IIITians-Network (MAJOR)\IIITiansConnect`
- Source backend: `C:\Users\ankur\Documents\9.MainProjects\3.0.IIITians-Network (MAJOR)\Backend`
- Target: `C:\Users\ankur\Documents\9.MainProjects\3.1.IIITiansNetwork Nextjs`

## Page Parity

| Source route | Target route | Status |
| --- | --- | --- |
| `/` | `/` | Migrated |
| `/colleges` | `/colleges` | Migrated |
| `/events` | `/events` | Migrated |
| `/placement` | `/placement` | Migrated |
| `/legacy` | `/legacy` | Migrated |
| `/alumni` redirect | `/alumni` | Migrated |
| `/team` | `/team` | Migrated |
| `/team/join` | `/team/join` | Migrated |
| `/discuss` | `/discuss` | Migrated |
| `/guide` | `/guide` | Migrated |
| `/college/:collegeName/gallery` | `/college/[collegeName]/gallery` | Migrated |
| `/college/:collegeName/clubs/:clubName?` | `/college/[collegeName]/clubs/[[...clubPath]]` | Migrated |
| `/gallery` redirect | `/gallery` | Target has a concrete gallery page rather than source redirect |
| `/contact` | `/contact` | Migrated |
| `/sitemap` | `/sitemap` | Migrated |
| `/admin` | `/admin` | Migrated |
| `/legacy/admin` | `/legacy/admin` | Migrated |
| `/legacy/admin/:status` | `/legacy/admin/[status]` | Compatibility route added |
| `/alumni/admin` | `/alumni/admin` | Compatibility redirect added |
| `/alumni/admin/:status` | `/alumni/admin/[status]` | Compatibility redirect added |
| `/colleges/admin` | `/colleges/admin` | Migrated |
| `/admin/gallery` | `/admin/gallery` | Migrated |
| `/team/admin` | `/team/admin` | Migrated |
| `/placement/admin` | `/placement/admin` | Migrated |
| `/events/admin` | `/events/admin` | Migrated |
| `/discuss/admin` | `/discuss/admin` | Migrated |
| `/admin/notifications` | `/admin/notifications` | Migrated |
| `/admin/sitemap` | `/admin/sitemap` | Migrated and wrapped in admin chrome |
| `/admin/logs` | `/admin/logs` | Migrated and wrapped in admin chrome |
| `*` | `not-found.tsx` | Migrated |

## Component Parity

Migrated source component families are present in the target:

- Global shell: `Navigation`, `Footer`, `Loader`, `SplashLoader`, `ScrollToTop`, `InAppNotifications`, `ThemeToggle`.
- Admin shell: `AdminLayout`, `RequireAdmin`, admin tables, filters, forms, notifications, logs, sitemap.
- Home sections: hero, about, current president, events preview, discuss preview, counselling, initiatives, founders, team card, waves.
- Colleges: cards, search, management forms, asset picker, status messages, gallery and club pages.
- Events: cards, add event form, filters, grid/client page, admin screens.
- Team: team grid/cards and admin member/request management.
- Legacy/alumni: public directory, submission flow, moderation and team migration controls.
- Discuss: public feed, account registration/login, admin moderation.
- Placement: public placement exploration and admin management.

## Missing Or Changed Behavior

- `/gallery` differs from the source. The source redirects `/gallery` to `/colleges`; the target exposes a platform gallery page. This is an intentional target expansion unless strict route parity requires reverting to a redirect.
- Admin status deep links now resolve, but `/legacy/admin/[status]` currently reuses the base admin page. To fully match the source workflow, the page should initialize its status filter from the route segment.
- Admin sitemap quick links now prefer the source route structure, but some target alias routes under `/admin/*` remain for compatibility.
- Visual parity still needs browser screenshot comparison across desktop, tablet, and mobile viewports.

## Admin Panel Migration

Implemented admin areas in the target:

- Login and protected admin session handling.
- Admin dashboard/navigation shell.
- Legacy moderation with status filters, search, edit, delete, approve/reject, and add-to-team workflow.
- College management with create/edit, assets, logos, links, and club data.
- Event management with create/update/list workflows.
- Discuss moderation and account management.
- Team management and team requests.
- Placement management.
- Notifications management.
- Gallery management.
- Admin guide, admin sitemap, and audit logs.

## Design Parity Notes

- The root application shell now mirrors the source behavior by suppressing public navigation, public footer, and public notifications on admin routes.
- Admin navigation has been aligned to the source canonical routes: `/legacy/admin`, `/colleges/admin`, `/events/admin`, `/discuss/admin`, `/team/admin`, `/placement/admin`, `/admin/notifications`, `/admin/gallery`, `/admin/guide`, `/admin/sitemap`, and `/admin/logs`.
- Admin footer content has been restored to match the source structure, including security/session, quick tools, and support sections.
- Admin header sizing and logo treatment have been adjusted toward the source implementation.

## Verification Checklist

- [ ] `npm run build` passes.
- [ ] Public home page screenshot matches source at mobile, tablet, and desktop widths.
- [ ] Public navigation behavior matches source scroll and mobile drawer behavior.
- [ ] Footer stats and links match source behavior.
- [ ] All public routes load without public/admin chrome leakage.
- [ ] All admin routes load without public navigation/footer.
- [ ] Admin login redirects to `/legacy/admin` after successful authentication.
- [ ] Admin protected routes reject unauthenticated access.
- [ ] Admin tables, filters, search, pagination, empty states, and loading states match source behavior.
- [ ] Legacy status deep links initialize the correct status filter.
- [ ] API routes return data compatible with migrated UI workflows.
