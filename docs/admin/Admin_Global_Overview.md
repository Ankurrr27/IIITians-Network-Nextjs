# Admin Global Overview

## Purpose
The Admin Panel is the centralized command center for managing the IIITians Network platform. It allows authorized personnel to moderate legacy directory submissions, manage notifications, update the team roster, verify placements, and moderate the discussion forum.

## Architecture
- **Routing**: Secured under `/admin`. The main layout `AdminLayout.tsx` enforces token-based authentication.
- **Component Library**: Resides in `src/components/admin/`. Uses standard `AdminCard`, `AdminHeader`, `AdminButton`, and `AdminTable` for UI consistency.
- **API Connectivity**: Interacts with the backend via `src/lib/apiClient.ts` which automatically attaches the `adminToken` and handles 401 redirects.

## Modules
1. **Legacy Admin**: Moderates alumni registrations.
2. **Notifications Admin**: Manages global in-app notifications.
3. **Team Admin**: Manages terms, rosters, and promotions.
4. **Events Admin**: Manages upcoming platform events.
5. **Discuss Admin**: Moderates the community forum.
