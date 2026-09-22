# Feature Spec: Notification Config

## Overview

The **Notification Config** feature lets the user configure a daily reminder time. At that time, a popup notification should prompt the user to write the daily entry for the next day. The backend stores and exposes the configuration; the actual OS notification trigger is handled outside the Spring Boot layer (e.g., Electron's main process).

---

## User Story

> As a developer, I want to configure what time the application reminds me to fill in tomorrow's daily, so that I am prompted before the end of the workday.

---

## Domain Model

### Record: `NotificationConfig`
Package: `com.personal.dailier.notification.domain`

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Auto-generated primary key (nullable on create) |
| `notificationTime` | `String` | Time in `HH:mm` format (24 h) |

> Only one `NotificationConfig` row is expected per installation (singleton config).

---

## Ports

### Inbound ? `NotificationConfigUseCase`
Package: `com.personal.dailier.notification.domain.port`

| Method | Description |
|---|---|
| `getConfig()` | Returns the stored config wrapped in `Optional`, empty if not yet configured |
| `save(NotificationConfig config)` | Creates the config for the first time |
| `update(Long id, NotificationConfig config)` | Replaces the existing config by ID |

### Outbound ? `NotificationConfigRepository`
Package: `com.personal.dailier.notification.domain.port`

| Method | Description |
|---|---|
| `findFirst()` | Returns the single config row, if it exists |
| `findById(Long id)` | Queries by primary key |
| `save(NotificationConfig config)` | Persists (insert or update) the config |

---

## Application Layer

### `NotificationConfigService`
Package: `com.personal.dailier.notification.application`

- Implements `NotificationConfigUseCase`.
- Delegates all operations to `NotificationConfigRepository`.
- `update` guards that the ID exists before saving; throws `EntityNotFoundException` otherwise.
- Annotated with `@Service` and `@Transactional`; read operations use `@Transactional(readOnly = true)`.

---

## Infrastructure

### Persistence
Package: `com.personal.dailier.notification.infrastructure.persistence`

| Class | Role |
|---|---|
| `NotificationConfigEntity` | JPA entity mapped to table `notification_config`; uses Lombok |
| `NotificationConfigJpaRepository` | Spring Data `JpaRepository<NotificationConfigEntity, Long>` |
| `NotificationConfigRepositoryAdapter` | Implements `NotificationConfigRepository`; maps domain record ? JPA entity |

**Database table** (`notification_config`):

| Column | Type | Constraints |
|---|---|---|
| `id` | `INTEGER` | PK, auto-increment |
| `notification_time` | `VARCHAR(5)` | NOT NULL |

Defined in Liquibase changeset `001` ? `src/main/resources/db/changelog/001-initial-schema.xml`.

### REST Controller
Package: `com.personal.dailier.notification.infrastructure.rest`  
Base path: `/api/notification-config`

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/api/notification-config` | `200 OK` / `404` | Returns the stored config, or 404 if none |
| `POST` | `/api/notification-config` | `201 Created` | Creates the config |
| `PUT` | `/api/notification-config/{id}` | `200 OK` / `404` | Updates the config by ID |

---

## Frontend

### Route
`/notification`

### Component: `NotificationConfigComponent`
File: `frontend/src/app/notification/component/notification-config/notification-config.ts`

**Behaviour:**
- On init, fetches the existing config from the API.
- If a config exists, pre-fills the form and stores the `id` for subsequent `PUT` requests.
- If no config exists (404), the form defaults to `17:00`.
- On submit, calls `save` (POST) if no `id` is stored, or `update` (PUT) if one is.
- Uses `signal()` for `isSaving` and `savedSuccessfully` reactive state.

**Signals:**

| Signal | Type | Purpose |
|---|---|---|
| `isSaving` | `boolean` | Disables the submit button while in-flight |
| `savedSuccessfully` | `boolean` | Shows confirmation message after a successful save |

### Service: `NotificationConfigService`
File: `frontend/src/app/notification/service/notification-config.service.ts`

| Method | HTTP | Endpoint |
|---|---|---|
| `get()` | `GET` | `/api/notification-config` |
| `save(config)` | `POST` | `/api/notification-config` |
| `update(id, config)` | `PUT` | `/api/notification-config/{id}` |

### Model: `NotificationConfig`
File: `frontend/src/app/notification/model/notification-config.model.ts`

```typescript
export interface NotificationConfig {
  id?: number;
  notificationTime: string;
}
```

---

## Business Rules

1. Only one config row is expected. The UI performs a GET on load and decides between POST and PUT accordingly.
2. The time format stored is `HH:mm` (5 characters), enforced at the column level.
3. The actual OS notification (system tray popup, etc.) is **not** triggered by this backend; this feature only stores and exposes the configured time. The Electron layer is responsible for reading this value and scheduling the OS notification.
4. Default value shown in the UI when no config exists: `17:00`.

---

## Error Handling

| Scenario | Backend behaviour | Frontend behaviour |
|---|---|---|
| Config not found (GET) | `404 Not Found` | Form defaults to `17:00`; no error shown to user |
| Config not found on update | `404 Not Found` | Not expected in normal flow (ID was loaded on init) |
| Save fails (server error) | `5xx` | `isSaving` resets to `false`; no success message shown |

