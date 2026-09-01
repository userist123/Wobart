# PHASE 07 — CONTENT / MEDIA / CMS

## Objective
Turn WOB ART Website Studio into a real content-management layer without coupling the public UI to hardcoded marketing content.

## Database status
The project is database-ready but the user's runtime does not yet have MongoDB configured. Do not seed production data or claim runtime persistence until `MONGO_URL` and `DB_NAME` are supplied.

## Current architecture
- `lib/site-content.ts`: public TypeScript content contract + safe defaults.
- `lib/cms-schema.ts`: Zod validation boundary for admin writes.
- `lib/mongodb.ts`: server-side MongoDB connection using environment variables.
- `app/api/admin/content/route.ts`: authenticated admin read/write endpoint.
- public sections consume CMS content where migrated.

## Planned collections
- `site_content`: singleton document for global/home/SEO/theme configuration.
- `services`: independently editable service records.
- `portfolio`: project records with gallery metadata.
- `media_assets`: media metadata and storage-provider references.
- `audit_log`: immutable administrative activity records.
- `content_versions`: draft/published revisions for recoverability.

## Rules
1. Never silently use mock operational data in admin views.
2. Never expose database credentials to the browser.
3. Validate every CMS mutation at the API boundary.
4. Keep draft and published state separate before enabling one-click publishing.
5. Media upload must use an explicit storage provider; URL fields are acceptable during development but must not be presented as successful uploads.
6. Business claims, guarantees, customer counts and vendor certifications require verified source data.

## Next implementation slice
- versioned draft/publish model;
- audit log;
- media library metadata;
- migrate remaining homepage sections to CMS;
- runtime validation with a real MongoDB environment.
