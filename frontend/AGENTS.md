# AGENTS.md

## Project Snapshot
- Angular 21 standalone app (`src/main.ts`, `src/app/app.config.ts`) with feature-first folders under `src/app/`.- UI uses Angular Material (theme imported in `src/styles.scss`, animations in `src/app/app.config.ts`).
- Main user flows are split into `daily`, `email`, and `notification` domains.
- Root route redirects to `daily`; features are lazy-loaded with `loadComponent` in `src/app/app.routes.ts`.

## Architecture and Data Flow
- UI components live in `src/app/*/component/*` and own local form state.
- API access is isolated in `src/app/*/service/*` using `HttpClient` and RxJS Observables.
- Domain contracts are plain TS interfaces in `src/app/*/model/*`.
- Components call services directly (no NgRx/store layer), subscribe, then update local signals.
- Backend calls go to `/api/*` (for example `/api/daily`, `/api/email-config`) and rely on `proxy.conf.json` during local dev.
- Runtime i18n is centralized in `src/app/shared/i18n/i18n.service.ts`, uses bundles from `public/i18n/*.properties`, and is consumed in templates via `src/app/shared/i18n/i18n.pipe.ts`.

## Code Patterns To Follow
- Use `inject(...)` for DI in services/components (see `daily.service.ts`, `daily-form.ts`).
- Prefer Angular signals for mutable UI flags (for example `isSaving`, `savedSuccessfully` in `daily-form.ts`).
- Keep forms template-driven with `FormsModule` and `[(ngModel)]` (see `daily-form.html`, `email-config.html`).
- Build UI with Angular Material primitives (`mat-toolbar`, `mat-card`, `mat-form-field`, `matInput`, `mat-raised-button`) instead of custom raw controls.
- Use i18n keys in templates (`{{ 'key' | i18n }}`) instead of hardcoded copy; keep EN/ES bundles synchronized in `public/i18n/en.properties` and `public/i18n/es.properties`.
- Keep save/update branching in component layer when backend API separates create vs update (see `email-config.ts`).
- Handle subscription success and error inline with object-style callbacks (`next`, `error`).

## Feature Notes
- `daily-form` computes a default date using previous workday logic; preserve this behavior when refactoring (`daily-form.ts`).
- `email-config` and `notification-config` load current config on init and then persist changes via service methods.
- `daily` supports both `save` and `update` endpoints and date-based lookup (`getByDate`).

## Dev Workflows
- Install deps: `npm install`
- Start dev server with API proxy: `npm start` (maps to `ng serve --proxy-config proxy.conf.json`).
- Build: `npm run build`
- Test: `npm test` (Vitest through Angular CLI)
- Watch build: `npm run watch`

## Guardrails for AI Agents
- Keep new functionality inside the existing feature triad structure: `component/`, `service/`, `model/`.
- Add routes via lazy `loadComponent` in `src/app/app.routes.ts`; do not switch to module-based routing.
- Reuse `/api/*` relative URLs in services so proxy and deployed environments remain consistent.
- Match current Angular Material + standalone component conventions; import Material modules per standalone component where used.
- Apply SOLID and Clean Code principles, favoring clear responsibilities, low coupling, and readable component/service boundaries.
