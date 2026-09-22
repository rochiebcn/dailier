# Feature Spec: Email

## Overview

The **Email** feature has two responsibilities:

1. **Email Config** ? stores the destination email address and the time at which the daily should be sent automatically.
2. **Daily Send** ? a background scheduler checks every minute whether the configured time has been reached and, if so, sends the daily entry for **tomorrow** as an HTML email via SMTP. A REST endpoint is also exposed for manual triggering.

---

## User Stories

> As a developer, I want to configure the email address and send time so that the application knows where and when to send my daily automatically.

> As a developer, I want the application to send tomorrow's daily entry by email at the configured time, so that my team receives it before the next day's standup.

> As a developer, I want to be able to trigger the email send manually from the UI, so that I can test my configuration or send early.

---

## Domain Model

### Record: `EmailConfig`
Package: `com.personal.dailier.email.domain`

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Auto-generated primary key (nullable on create) |
| `sendTime` | `String` | Time in `HH:mm` format (24 h) at which the email is sent |
| `emailAddress` | `String` | Destination address for the daily email |

> Only one `EmailConfig` row is expected per installation (singleton config).

---

## Ports

### EmailConfig ? Inbound: `EmailConfigUseCase`
Package: `com.personal.dailier.email.domain.port`

| Method | Description |
|---|---|
| `getConfig()` | Returns the stored config wrapped in `Optional` |
| `save(EmailConfig config)` | Creates the config |
| `update(Long id, EmailConfig config)` | Replaces the existing config by ID |

### EmailConfig ? Outbound: `EmailConfigRepository`
Package: `com.personal.dailier.email.domain.port`

| Method | Description |
|---|---|
| `findFirst()` | Returns the single config row, if it exists |
| `findById(Long id)` | Queries by primary key |
| `save(EmailConfig config)` | Persists (insert or update) the config |

### DailySend ? Inbound: `DailySenderUseCase`
Package: `com.personal.dailier.email.domain.port`

| Method | Description |
|---|---|
| `sendScheduledDaily()` | Sends the entry for `LocalDate.now().plusDays(1)` |
| `sendDailyForDate(String date)` | Sends the entry for an explicit `yyyy-MM-dd` date |

### DailySend ? Outbound: `DailySenderPort`
Package: `com.personal.dailier.email.domain.port`

| Method | Description |
|---|---|
| `send(String toEmail, DailyEntry entry)` | Delivers the email to the given address |

---

## Application Layer

### `EmailConfigService`
Package: `com.personal.dailier.email.application`

- Implements `EmailConfigUseCase`.
- Delegates all CRUD operations to `EmailConfigRepository`.
- `update` guards that the ID exists; throws `EntityNotFoundException` if not.
- `@Service`, `@Transactional`; reads use `@Transactional(readOnly = true)`.

### `DailySenderService`
Package: `com.personal.dailier.email.application`

- Implements `DailySenderUseCase`.
- Injects `EmailConfigRepository` (for destination/time) and `DailyEntryRepository` (cross-feature dependency, used as an outbound port).
- `sendScheduledDaily()` resolves tomorrow's date (`LocalDate.now().plusDays(1)`) and delegates to `sendDailyForDate`.
- `sendDailyForDate(date)` fetches `EmailConfig` and `DailyEntry` for the date; if either is missing, throws `EntityNotFoundException` (logged and swallowed by the scheduler, propagated to the REST controller).
- `@Service`, `@Transactional(readOnly = true)`.

---

## Infrastructure

### EmailConfig Persistence
Package: `com.personal.dailier.email.infrastructure.persistence`

| Class | Role |
|---|---|
| `EmailConfigEntity` | JPA entity mapped to `email_config`; uses Lombok |
| `EmailConfigJpaRepository` | Spring Data `JpaRepository<EmailConfigEntity, Long>` |
| `EmailConfigRepositoryAdapter` | Implements `EmailConfigRepository`; maps domain record ? JPA entity |

**Database table** (`email_config`):

| Column | Type | Constraints |
|---|---|---|
| `id` | `INTEGER` | PK, auto-increment |
| `send_time` | `VARCHAR(5)` | NOT NULL |
| `email_address` | `VARCHAR(255)` | NOT NULL |

Defined in Liquibase changeset `001` ? `backend/src/main/resources/db/changelog/001-initial-schema.xml`.

### SMTP Adapter ? `SmtpDailySenderAdapter`
Package: `com.personal.dailier.email.infrastructure.mail`

- Implements `DailySenderPort`.
- Injects Spring's `JavaMailSender` and reads `${spring.mail.from}` as the `From` address.
- Builds a styled **HTML email** with three sections: *¿Qué hice ayer?*, *¿Qué haré hoy?*, *Impedimentos*.
- HTML content is escaped (`&`, `<`, `>`) before embedding in the template.
- Wraps any `MessagingException` in a `RuntimeException` and logs the error.

**Email subject format:** `Daily Scrum - {entry.date}`

### Scheduler ? `DailySendScheduler`
Package: `com.personal.dailier.email.infrastructure.scheduler`

- Annotated with `@Scheduled(cron = "0 * * * * *")` ? fires **once per minute**, at second 0.
- Requires `@EnableScheduling` on `DailierApplication`.
- Logic:
  1. Reads the first `EmailConfig` via `EmailConfigRepository.findFirst()`.
  2. Compares the current time formatted as `HH:mm` with `config.sendTime`.
  3. If they match, calls `DailySenderUseCase.sendScheduledDaily()`.
  4. Any exception is caught and logged ? the scheduler **never propagates errors**.

### REST Controllers
Package: `com.personal.dailier.email.infrastructure.rest`

**`EmailConfigController`** ? base path `/api/email-config`

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/api/email-config` | `200` / `404` | Returns the stored config |
| `POST` | `/api/email-config` | `201 Created` | Creates the config |
| `PUT` | `/api/email-config/{id}` | `200` / `404` | Updates the config |

**`DailySenderController`** ? base path `/api/email/send`

| Method | Path | Status | Description |
|---|---|---|---|
| `POST` | `/api/email/send` | `200` / `404` | Sends tomorrow's daily immediately (manual trigger) |
| `POST` | `/api/email/send/{date}` | `200` / `404` | Sends the daily for the given `yyyy-MM-dd` date |

Both send endpoints return `404 Not Found` when either the config or the daily entry for the requested date does not exist.

---

## SMTP Configuration

Configured via environment variables in `application.yaml`:

```yaml
spring:
  mail:
    host: ${MAIL_HOST:relay.werfen.com}
    port: ${MAIL_PORT:25}
    from: ${MAIL_FROM:tao@tao.com}
    properties:
      mail:
        smtp:
          auth: false       # relay corporativo ? no requiere autenticación
          starttls:
            enable: false   # el relay no anuncia STARTTLS en puerto 25
```

**Variables de entorno (overrides opcionales):**

| Variable | Default | Descripción |
|---|---|---|
| `MAIL_HOST` | `relay.werfen.com` | Relay SMTP corporativo |
| `MAIL_PORT` | `25` | Puerto SMTP estándar sin TLS |
| `MAIL_FROM` | `tao@tao.com` | Dirección que aparece en la cabecera `From` |

> ?? `auth: false` y `starttls.enable: false` son **intencionales**. El relay `relay.werfen.com` es un servidor interno corporativo que no requiere autenticación. Activar `auth: true` o `starttls.enable: true` hace que el servidor rechace la conexión (equivalente a la configuración WildFly donde no se define usuario/contraseña en el `smtp-server`).

> Los tests sobreescriben estos valores con `host: localhost`, `port: 25`, `from: test@test.com` en `backend/src/test/resources/application.yaml`.

### Maven dependency note
`spring-boot-starter-mail:4.0.6` and its transitive dependencies must be present in the local Maven cache:

| Artifact | Version |
|---|---|
| `org.springframework.boot:spring-boot-starter-mail` | `4.0.6` |
| `org.springframework.boot:spring-boot-mail` | `4.0.6` |
| `org.springframework:spring-context-support` | `7.0.7` |
| `jakarta.mail:jakarta.mail-api` | `2.1.5` |
| `org.eclipse.angus:angus-mail` | `2.0.5` |
| `org.eclipse.angus:all` *(parent POM only)* | `2.0.5` |

If the corporate Artifactory mirror is unreachable, download the POM + JAR for each artifact from Maven Central (`https://repo1.maven.org/maven2`) and place them at `~/.m2/repository/<groupPath>/<artifact>/<version>/`. Remove any `.lastUpdated` files that Maven may have left as failure markers.

---

## Frontend

### Route
`/email`

### Component: `EmailConfigComponent`
File: `frontend/src/app/email/component/email-config/email-config.ts`

**Behaviour:**
- On init, fetches the existing config from the API; pre-fills the form and stores the `id` for subsequent `PUT` calls.
- If no config exists (404), defaults to `sendTime = 08:00`, empty `emailAddress`.
- **Save** ? POST or PUT depending on whether `existingId` is set.
- **Send now** ? calls `sendNow()` which hits `POST /api/email/send`; shows success, not-found, or generic error feedback.

**Signals:**

| Signal | Type | Purpose |
|---|---|---|
| `isSaving` | `boolean` | Disables Save button while in-flight |
| `savedSuccessfully` | `boolean` | Shows save confirmation |
| `isSending` | `boolean` | Disables Send button while in-flight |
| `sendResult` | `'success' \| 'error' \| 'not-found' \| null` | Drives result message below the Send button |

### Service: `EmailConfigService`
File: `frontend/src/app/email/service/email-config.service.ts`

| Method | HTTP | Endpoint |
|---|---|---|
| `get()` | `GET` | `/api/email-config` |
| `save(config)` | `POST` | `/api/email-config` |
| `update(id, config)` | `PUT` | `/api/email-config/{id}` |
| `sendNow()` | `POST` | `/api/email/send` |
| `sendForDate(date)` | `POST` | `/api/email/send/{date}` |

### Model: `EmailConfig`
File: `frontend/src/app/email/model/email-config.model.ts`

```typescript
export interface EmailConfig {
  id?: number;
  sendTime: string;
  emailAddress: string;
}
```

---

## Business Rules

1. Only one `EmailConfig` row is expected; the UI uses POST on first save and PUT on subsequent saves.
2. The scheduler compares `HH:mm` strings ? it may fire at most **once per minute** for a given time.
3. The target entry date for the scheduled send is always **tomorrow** (`LocalDate.now().plusDays(1)`).
4. If no `EmailConfig` or no `DailyEntry` for tomorrow exists when the scheduler fires, the error is **logged and silently swallowed** ? the scheduler never crashes.
5. Manual send via the REST endpoint propagates the `EntityNotFoundException` as `404`, enabling the UI to show a meaningful message.
6. The `From` header of the email is taken from `spring.mail.username` (the SMTP account), not from the stored `emailAddress` (which is the destination).

---

## Error Handling

| Scenario | Backend behaviour | Frontend behaviour |
|---|---|---|
| Config not found (GET) | `404 Not Found` | Form shows defaults; no error message |
| Config not found on send | `404 Not Found` | `sendResult` set to `'not-found'`; specific message shown |
| Daily entry not found for date | `404 Not Found` | `sendResult` set to `'not-found'`; specific message shown |
| SMTP delivery failure | `500` (exception propagated) | `sendResult` set to `'error'`; generic error message shown |
| Scheduler firing but nothing configured | Logged + swallowed | ? |

