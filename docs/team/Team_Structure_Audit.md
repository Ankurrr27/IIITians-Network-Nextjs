# Team Structure Audit & Gap Analysis

## Legacy System Architecture
- Flat `TeamMember` MongoDB document.
- `team` and `year` fields stored as plain strings.
- No historical traceability: changing a role overwrote the previous data.
- No structured `Term` or `Committee` definitions.

## New Relational Next.js Architecture
- **Term Management**: Introduced `Term` model (`name`, `startDate`, `endDate`).
- **Committee Model**: Normalizes teams ("Tech", "Design", "Core") into actual entities.
- **Role Model**: Defines specific role titles and hierarchical levels (e.g., Volunteer = 10, Exec = 100).
- **TermTenure Model**: Connects `TeamMember` -> `Term` -> `Committee` -> `Role`.
- **PromotionLog Model**: Maintains an immutable audit trail of role elevations.

## Gap Analysis Addressed
| Legacy Feature | Next.js Implementation | Status |
|---|---|---|
| Single Active Roster | Full TermTenure history with `ACTIVE`/`ARCHIVED` | ✅ Complete |
| No term cloning | Automated `/api/team/terms/clone` duplicates tenure structures | ✅ Complete |
| Ad-hoc promotions | Bulk promotion API generating `PromotionLog` records | ✅ Complete |
| Flat JSON exports | Advanced Analytics Dashboard backend aggregations | ✅ Scheduled |
