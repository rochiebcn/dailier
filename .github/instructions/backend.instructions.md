---
applyTo: "backend/**"
---

# Backend Instructions ? Spring Boot / Hexagonal Architecture

## Technology Stack

| Layer | Technology |
|---|---|
| Language | Java 25 |
| Framework | Spring Boot 4.0.6 |
| Build | Maven Wrapper (`./mvnw.cmd`) |
| Database | SQLite via `org.xerial:sqlite-jdbc` |
| ORM | Spring Data JPA + Hibernate Community Dialects |
| Migrations | Liquibase |
| Architecture | Hexagonal (ports and adapters) |
| Utilities | Lombok (annotation processor, excluded from final artifact) |
| API Docs | SpringDoc OpenAPI (`/swagger-ui/index.html`) |
| Email | `spring-boot-starter-mail` |
| Scheduler | `@EnableScheduling` on `DailierApplication` |

---

## Project Layout

```
backend/
  src/
    main/
      java/com/personal/dailier/
        <feature>/
          domain/
            <Entity>.java                    # Domain record ? pure Java, no framework
            port/
              <Entity>UseCase.java           # Inbound port (interface used by controller)
              <Entity>Repository.java        # Outbound port (interface used by service)
          application/
            <Entity>Service.java             # Implements UseCase, injects Repository
          infrastructure/
            persistence/
              <Entity>Entity.java            # JPA entity with Lombok
              <Entity>JpaRepository.java     # Spring Data interface
              <Entity>RepositoryAdapter.java # Implements domain Repository port
            rest/
              <Entity>Controller.java        # REST adapter, uses UseCase port
            mail/                            # (email feature only)
              SmtpDailySenderAdapter.java
            scheduler/                       # (email feature only)
              DailySendScheduler.java
      resources/
        application.yaml
        db/changelog/
          db.changelog-master.xml
          001-initial-schema.xml
    test/
      java/com/personal/dailier/
      resources/
        application.yaml                     # Overrides with in-memory SQLite
```

---

## Hexagonal Architecture Rules

- **Domain layer** (`domain/`): pure Java records, zero framework dependencies.
- **Application layer** (`application/`): services implement inbound ports and depend only on outbound ports (interfaces).
- **Infrastructure layer** (`infrastructure/`): all framework/library code (JPA, Spring MVC, JavaMailSender, schedulers).
- Dependencies always point **inward**: infrastructure ? application ? domain.
- Never inject JPA repositories directly into services; always go through the repository port adapter.

### Adding a New Feature ? Mandatory Checklist

Every new feature **must** include all of the following:

1. Domain record under `com.personal.dailier.<feature>.domain`
2. Inbound port (`<Entity>UseCase.java`) and outbound port (`<Entity>Repository.java`) under `domain/port/`
3. Service under `com.personal.dailier.<feature>.application`
4. JPA entity + Spring Data repository + adapter under `infrastructure/persistence/`
5. REST controller under `infrastructure/rest/`
6. New Liquibase changeset in `src/main/resources/db/changelog/` included from `db.changelog-master.xml`
7. Tests covering the service and controller

---

## Data Model

| Entity | Table | Key fields |
|---|---|---|
| `NotificationConfig` | `notification_config` | `notification_time VARCHAR(5)` |
| `EmailConfig` | `email_config` | `send_time VARCHAR(5)`, `email_address VARCHAR(255)` |
| `DailyEntry` | `daily_entry` | `date VARCHAR(10) UNIQUE`, `did_yesterday TEXT`, `will_do_today TEXT`, `blockers TEXT` |

- **Never** assume an existing schema ? always add a new Liquibase changeset for schema changes.
- Changeset IDs must be unique and descriptive (e.g. `002-add-email-config`).

---

## REST API Conventions

- Base path: `/api/<feature>`
- Return `200 OK` on success, `404 Not Found` when the resource does not exist.
- Controllers depend on the **UseCase** inbound port, never directly on the service class.
- Document endpoints with SpringDoc annotations; they are visible at `/swagger-ui/index.html`.

---

## Email Feature (`email` package)

- `DailySendScheduler` fires every minute (`0 * * * * *`) and compares `HH:mm` with `EmailConfig.sendTime`.
- On match, calls `DailySenderUseCase.sendScheduledDaily()` which looks up tomorrow's `DailyEntry` and sends it via `SmtpDailySenderAdapter`.
- Errors are logged and swallowed ? the scheduler must never crash.

### SMTP configuration (do NOT change defaults without a reason)

```yaml
spring:
  mail:
    host: ${MAIL_HOST:relay.werfen.com}
    port: ${MAIL_PORT:25}
    from: ${MAIL_FROM:tao@tao.com}
    properties:
      mail.smtp.auth: false
      mail.smtp.starttls.enable: false
```

> `auth: false` and `starttls.enable: false` are intentional ? the corporate relay requires no authentication.

---

## Testing

- Tests use **in-memory SQLite** configured in `backend/src/test/resources/application.yaml`.
- No side effects on disk.
- Test mail config uses dummy values (`localhost:25`, `from: test@test.com`).
- Run tests: `./mvnw.cmd test -pl backend -q`

---

## Code Quality Rules

- Follow **Clean Code**: meaningful names, small focused methods, no magic numbers, self-documenting code over comments.
- Follow **SOLID**: single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion.
- Root package: `com.personal.dailier`; feature sub-packages: `daily`, `notification`, `email`, `common`.
- Use **Lombok** for JPA entities (`@Data`, `@NoArgsConstructor`, etc.) ? never for domain records.
- Domain entities are Java **records** (immutable, no Lombok needed).

---

## Developer Workflows

```bash
# Compile all modules from root
./mvnw.cmd compile

# Run all backend tests
./mvnw.cmd test -pl backend -q

# Start backend dev server
./mvnw.cmd spring-boot:run -pl backend
```

