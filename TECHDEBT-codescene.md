# TODO: CodeScene fixes (from PR #81, sponsor-jam-local)

Gates failed: hotspot decline, new code healthy, advisory rules. Threshold: cyclomatic complexity 9, method length 70.

## Complex Method (cc > 9)
- [ ] `backend/routes/admin.js` `PUT /gamejams/:id/sponsor-settings` cc 16 -> extract `normalizeSponsorSettings()` helper (also reused in public.js `normalizeSponsorConfig`, dedupe)
- [ ] `backend/routes/public.js` `enrichGameJamWithSponsors` cc 10 -> extract `parseSponsorSettings()` (the inline JSON.parse try/catch) + `buildSelectedSponsors()`
- [ ] `backend/routes/sponsors.js` `normalizeSponsorPayload` cc 18 -> tiny `trimOrNull(v)` helper, replace repeated ternaries
- [ ] `backend/routes/sponsors.js` `validateSponsor` cc 12 -> 16, split field validators
- [ ] `backend/routes/auth.js` `/isolated/login` cc 22 -> 25, extract dev auto-login branch
- [ ] `src/app/admin/jam-sponsors/page.js` `loadJamSettings` cc 12 -> shared `DEFAULT_SPONSOR_FORM` const + `normalizeForm(data)`
- [ ] `src/app/admin/sponsors/page.js` `handleSubmit` cc 11 -> extract logo upload step

## Other
- [ ] `backend/models/GameJam.js` `update` Complex Conditional (JSON field check) -> `const JSON_FIELDS = new Set([...])`
- [ ] `backend/migrations/base_schema.js` `createBaseSchema` Large Method 160 lines -> split per table
- [ ] `backend/routes/sponsors.js` module mean cc 5.42 (limit 4)

## Notes
- Duplicate `allowDevAuto` line in auth.js diff (old + new both shown), confirm old one removed.
- Migration `backend/migrations/add-jam-sponsor-settings.js` must run on existing DBs (column `sponsor_settings` missing = 42703 errors).
