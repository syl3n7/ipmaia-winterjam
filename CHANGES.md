## Security: CSRF enforcement for admin endpoints (December 24, 2025)

- Re-enabled CSRF protection for admin endpoints in production. Previously admin routes were skipped by the CSRF middleware; this change enforces CSRF token checks in production to reduce the risk of CSRF attacks.
- Added `GET /api/auth/csrf-token` endpoint which returns `{ csrfToken }` and sets a readable `XSRF-TOKEN` cookie. Admin UI fetches this token after authentication and uses it for POST/PUT/DELETE requests via the `csrf-token` header.
- Development convenience: CSRF checks for admin endpoints remain skipped when `NODE_ENV !== 'production'` to keep local development friction low. This can be tightened by setting `NODE_ENV=production` locally or by setting `DEV_BYPASS_CSRF=false` if you want explicit control.
- Frontend changes: Admin UI now uses `apiFetch` (exposed via `AdminAuthContext`) to automatically attach CSRF token for state-changing requests when available.
- Tests added: Unit tests for CSRF endpoint and the helper that controls dev bypass behavior (`backend/tests/routes/csrf.test.js`).

Please review and run the test suite in CI to ensure the production enforcement behavior matches your deployment workflow.