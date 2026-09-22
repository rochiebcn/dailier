---
applyTo: "frontend/**"
---

# Frontend Instructions ? Angular 21

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 |
| Language | TypeScript |
| Reactivity | Signals (`signal()`) + RxJS for HTTP |
| Testing | Vitest |
| Node.js | ? 20.19 or ? 22.12 |
| HTTP proxy | `/api/*` ? `http://localhost:8080` (via `proxy.conf.json`) |

---

## Project Layout

```
frontend/
  src/app/
    <feature>/
      component/
        <component-name>/         # Standalone Angular component
      model/
        <feature>.model.ts        # TypeScript interfaces / types
      service/
        <feature>.service.ts      # Injectable service (HttpClient calls)
    app.ts                        # Shell component (navbar + <router-outlet>)
    app.html
    app.scss
    app.routes.ts                 # Lazy-loaded routes per feature
    app.config.ts                 # provideRouter + provideHttpClient
  proxy.conf.json                 # Dev proxy: /api/* ? localhost:8080
```

---

## Architecture Rules

### Components
- All components are **standalone** ? no NgModules.
- Use **signals** for all local reactive state (`signal()`, `computed()`, `effect()`).
- Do **not** use `BehaviorSubject` for local component state.
- Use `inject()` for dependency injection ? no constructor injection.

### Services
- Services use `inject()` to get `HttpClient`.
- All HTTP calls target `/api/<resource>` (proxied to the Spring Boot backend in dev).
- Services return `Observable<T>` from `HttpClient`; do not call `.subscribe()` inside services.

### Models
- Define TypeScript interfaces or types in the `model/` folder.
- Naming: `<feature>.model.ts` (e.g. `daily-entry.model.ts`).

---

## Existing Features

| Feature | Component | Model | Service |
|---|---|---|---|
| Daily | `daily-form/`, `daily-list/` | `daily-entry.model.ts` | `daily.service.ts` |
| Notification | `notification-config/` | `notification-config.model.ts` | `notification-config.service.ts` |
| Email | `email-config/` | `email-config.model.ts` | `email-config.service.ts` |

---

## Adding a New Feature ? Mandatory Checklist

Every new feature **must** follow this pattern:

1. `src/app/<feature>/model/<feature>.model.ts` ? TypeScript interface
2. `src/app/<feature>/service/<feature>.service.ts` ? Injectable service with HttpClient
3. `src/app/<feature>/component/<component-name>/` ? Standalone component
4. Register the route in `app.routes.ts` (lazy-loaded)

---

## Routing

- Routes are **lazy-loaded** in `app.routes.ts`.
- The shell (`app.ts`) provides the navbar and `<router-outlet>`.

Example route entry:

```ts
{
  path: 'daily',
  loadComponent: () =>
    import('./daily/component/daily-form/daily-form.component')
      .then(m => m.DailyFormComponent)
}
```

---

## Code Quality Rules

- Follow **Clean Code**: meaningful names, small focused methods, self-documenting code.
- Follow **SOLID**: single responsibility per component/service, depend on abstractions.
- Components must be responsible only for rendering and user interaction; business logic belongs in services.
- Avoid hardcoded strings ? use constants or i18n keys.
- Internationalization strings go in `public/i18n/en.properties` and `public/i18n/es.properties`.

---

## Developer Workflows

```bash
# Install dependencies (requires Node ? 22.12)
cd frontend && npm install

# Start dev server (proxies /api/* to localhost:8080)
cd frontend && npm start

# Build for production
cd frontend && npm run build

# Run tests
cd frontend && npm test
```

