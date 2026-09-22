# AGENTS.md

## Project Description
**Dailier** is a desktop application that allows developers to write their Scrum *daily* in advance and send it by email at a configured time, so they can post it before the next day's *daily meeting*.

Main flows:
1. **Reminder**: At the configured time a popup notification appears asking the user to write what they did during the day, showing the previous day's daily as reference.
2. **Automatic send**: At another configured time the application emails the daily written for the following day.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 + RxJS |
| Backend | Java 25 � Spring Boot 4.0.6 � Maven Wrapper |
| Database | SQLite (`org.xerial:sqlite-jdbc`) |
| Backend architecture | Hexagonal (ports and adapters) |
| Desktop packaging | Electron (wraps frontend + backend) |

---

## Project Layout (Multi-module)

```
dailier/                        # root ? Maven parent POM + workspace root
??? pom.xml                     # parent POM (packaging=pom, declares backend module)
??? mvnw / mvnw.cmd             # Maven wrapper ? usable from root or backend/
??? .mvn/                       # Maven wrapper configuration
??? AGENTS.md                   # project-wide AI guidance
??? docs/                       # feature specification documents
??? backend/                    # Spring Boot module
?   ??? pom.xml                 # Spring Boot app POM (child of root parent)
?   ??? compose.yaml            # Docker Compose stub (no services declared)
?   ??? dailier.db              # SQLite database (created on first run, gitignored)
?   ??? src/
?       ??? main/java/?         # Production sources
?       ??? main/resources/     # application.yaml, Liquibase changelogs
?       ??? test/               # Test sources and test application.yaml
??? frontend/                   # Angular 21 standalone app (Node.js, not a Maven module)
    ??? package.json
    ??? angular.json
    ??? proxy.conf.json
    ??? src/
```

**Maven coordinates:**
| Module | artifactId | packaging |
|---|---|---|
| Root | `dailier-parent` | `pom` |
| Backend | `dailier-backend` | `jar` |

---

## Architecture (Current, Discoverable State)
- Entrypoint: `DailierApplication` at `backend/src/main/java/com/personal/dailier/DailierApplication.java`.
- `@EnableScheduling` is active on `DailierApplication` to power the daily send scheduler.
- The backend exposes a **REST API** consumed by the Angular frontend via RxJS.
- Auto-configured modules driven by `backend/pom.xml` dependencies:
  - Web MVC (`spring-boot-starter-webmvc`)
  - Thymeleaf ? present in scaffold, can be dropped if the frontend is 100% Angular
  - Data/JPA + Liquibase (`spring-boot-starter-data-jpa`, `spring-boot-starter-liquibase`)
  - REST client + OpenAPI (`spring-boot-starter-restclient`, `springdoc-openapi-starter-webmvc-ui 3.0.2`)
  - SQLite dialect (`org.hibernate.orm:hibernate-community-dialects`)
  - **Email (`spring-boot-starter-mail`)** ? added for the automatic daily send feature
- Implemented hexagonal structure per feature package:
  ```
  <feature>/
  ??? domain/
  ?   ??? <Entity>.java              # Domain record (pure Java, no framework)
  ?   ??? port/
  ?       ??? <Entity>UseCase.java   # Inbound port (interface used by controller)
  ?       ??? <Entity>Repository.java# Outbound port (interface used by service)
  ??? application/
  ?   ??? <Entity>Service.java       # Implements UseCase, injects Repository
  ??? infrastructure/
      ??? persistence/
      ?   ??? <Entity>Entity.java             # JPA entity with Lombok
      ?   ??? <Entity>JpaRepository.java      # Spring Data interface
      ?   ??? <Entity>RepositoryAdapter.java  # Implements domain Repository port
      ??? rest/
      ?   ??? <Entity>Controller.java         # REST adapter, uses UseCase port
      ??? mail/                               # (email feature only)
      ?   ??? SmtpDailySenderAdapter.java     # Implements DailySenderPort via JavaMailSender
      ??? scheduler/                          # (email feature only)
          ??? DailySendScheduler.java         # @Scheduled cron ? fires every minute
  ```
- Domain entities are Java **records** (immutable, no framework dependencies).
- Liquibase changelogs at `backend/src/main/resources/db/changelog/` ? master: `db.changelog-master.xml`.
- SQLite file: `./dailier.db` inside `backend/` (created on first run). Tests use in-memory SQLite.

---

## Email Send Feature (`email` package)

### How it works
1. `DailySendScheduler` runs a cron job **every minute** (`0 * * * * *`).
2. It reads the saved `EmailConfig` and compares the current `HH:mm` with `sendTime`.
3. On match it calls `DailySenderUseCase.sendScheduledDaily()`, which:
   - Looks up the `DailyEntry` for **tomorrow** (`LocalDate.now().plusDays(1)`).
   - Sends it as an HTML email to `emailAddress` via `SmtpDailySenderAdapter`.
4. If no config or no entry exists, the error is logged and swallowed ? the scheduler never crashes.

### REST endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/email/send` | Trigger send for tomorrow's daily manually |
| `POST` | `/api/email/send/{date}` | Trigger send for a specific date (`yyyy-MM-dd`) |

Both return `200 OK` on success and `404 Not Found` if config or entry is missing.

### New files (all under `email/`)
| File | Role |
|---|---|
| `domain/port/DailySenderPort.java` | Outbound port ? `send(toEmail, entry)` |
| `domain/port/DailySenderUseCase.java` | Inbound port ? `sendScheduledDaily()`, `sendDailyForDate(date)` |
| `application/DailySenderService.java` | Service ? orchestrates config + entry lookup + send |
| `infrastructure/mail/SmtpDailySenderAdapter.java` | SMTP adapter — builds HTML body, creates `JavaMailSenderImpl` dynamically from settings |
| `infrastructure/scheduler/DailySendScheduler.java` | Cron scheduler — checks time every minute |
| `infrastructure/rest/DailySenderController.java` | REST controller — manual trigger endpoints |

### SMTP configuration
`host` and `port` are stored in the `settings` table (`mail_host`, `mail_port`) and read at send time. Only the `from` address is configured via application.yaml:

```yaml
# application.yaml
spring:
  mail:
    from: ${MAIL_FROM:yourdaily@dailier.com}
```

> `auth: false` and `starttls.enable: false` are set programmatically in `SmtpDailySenderAdapter`. Default port is 25.

> The test `application.yaml` overrides `spring.mail.from` with a dummy value (`from: test@test.com`) so tests pass without a real SMTP server.

---

## Data Model
Three entities implemented in SQLite via Liquibase (`001-initial-schema.xml`):

| Entity | Table | Key fields |
|---|---|---|
| `NotificationConfig` | `notification_config` | `notification_time VARCHAR(5)` |
| `EmailConfig` | `email_config` | `send_time VARCHAR(5)`, `email_address VARCHAR(255)` |
| `DailyEntry` | `daily_entry` | `date VARCHAR(10) UNIQUE`, `did_yesterday TEXT`, `will_do_today TEXT`, `blockers TEXT` |

Each new entity requires:
1. Domain record under `com.personal.dailier.<feature>.domain`
2. Port interfaces under `com.personal.dailier.<feature>.domain.port`
3. Service under `com.personal.dailier.<feature>.application`
4. JPA entity + repository + adapter under `com.personal.dailier.<feature>.infrastructure.persistence`
5. REST controller under `com.personal.dailier.<feature>.infrastructure.rest`
6. Liquibase changeset in `src/main/resources/db/changelog/` included from the master XML

---

## Frontend Structure (`frontend/`)
Angular 21 scaffold generated with standalone components, signals, and vitest. Requires **Node.js ? 20.19 or ? 22.12**.

```
frontend/
??? src/app/
?   ??? daily/
?   ?   ??? component/daily-form/   # Form: didYesterday, willDoToday, blockers
?   ?   ??? model/daily-entry.model.ts
?   ?   ??? service/daily.service.ts
?   ??? notification/
?   ?   ??? component/notification-config/
?   ?   ??? model/notification-config.model.ts
?   ?   ??? service/notification-config.service.ts
?   ??? email/
?   ?   ??? component/email-config/
?   ?   ??? model/email-config.model.ts
?   ?   ??? service/email-config.service.ts
?   ??? app.ts / app.html / app.scss   # Shell: navbar + <router-outlet>
?   ??? app.routes.ts                  # Lazy-loaded routes per feature
?   ??? app.config.ts                  # provideRouter + provideHttpClient
??? proxy.conf.json                    # Proxies /api/* ? http://localhost:8080
```

- Components use **signals** for reactive state (`signal()`, no BehaviorSubject for local state).
- All components are **standalone** (no NgModule).
- Services use `inject()` instead of constructor injection.
- HTTP calls go to `/api/<resource>` ? proxied to the Spring Boot backend during local dev.
- New features follow the same pattern: `<feature>/model/`, `<feature>/service/`, `<feature>/component/<name>/`.

---

## Critical Developer Workflows

```bash
# Build all Maven modules from root
./mvnw.cmd compile

# Run backend tests from root
./mvnw.cmd test -q

# Run only the backend module tests
./mvnw.cmd test -pl backend -q

# Run the backend (from root)
./mvnw.cmd spring-boot:run -pl backend

# Run the backend (from backend/ directory)
cd backend && ../mvnw.cmd spring-boot:run

# Install frontend dependencies (requires Node ? 22.12)
cd frontend && npm install

# Run frontend dev server (proxies /api/* to localhost:8080)
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build

# Run frontend tests
cd frontend && npm test
```

> ?? Backend tests use an in-memory SQLite (`backend/src/test/resources/application.yaml`) so they run without side effects on disk.

- `backend/compose.yaml` has `services: {}` ? Docker Compose integration is enabled but no containers are declared.
- DevTools is active only for local dev run, not during tests.
- OpenAPI UI accessible at `/swagger-ui/index.html` once controllers exist.

---

## Repository Conventions
- Follow **Clean Code** principles: meaningful names, small focused methods, no magic numbers, and self-documenting code over comments.
- Follow **SOLID** principles: single responsibility per class/method, open for extension but closed for modification, Liskov-safe subtypes, narrow interfaces, and dependency injection over direct instantiation.
- Root package: `com.personal.dailier`; use feature sub-packages (`daily`, `notification`, `email`, `common`).
- Hexagonal architecture: separate `domain`, `application`, `infrastructure` within each feature package.
- Lombok is available and configured as an annotation processor; excluded from the final artifact via the Spring Boot plugin config.
- If adding an MVC view, pair the controller route with a Thymeleaf template under `src/main/resources/templates`.
- When creating the first real feature, always include: controller + service + entity/repository + Liquibase changelog + test + datasource config.

---

## Notes for AI Agents
- The project is a **Maven multi-module** workspace: root `pom.xml` (`dailier-parent`, `packaging=pom`) declares one Maven module ? `backend` (`dailier-backend`). The `frontend/` directory is a standalone Node.js project, not a Maven module.
- All backend Java sources live under `backend/src/`. All backend resources (YAML, Liquibase) live under `backend/src/main/resources/`.
- Run Maven commands from the root using `./mvnw.cmd` (wrapper is at root). To target only the backend, use `-pl backend` or `cd backend && ../mvnw.cmd`.
- `pom.xml` originally declared Java 17; **updated to Java 25** to align with the actual runtime (`java 25.0.2` detected during test execution).
- Treat this repo as *feature-driven*: each new feature must follow the hexagonal pattern described in the Architecture section.
- Do not assume existing persistence schema ? always add a new Liquibase changeset for schema changes.
- The AI-guidance glob search (`**/{.github/copilot-instructions.md,AGENT.md,AGENTS.md,...}`) was run and only found this file.
