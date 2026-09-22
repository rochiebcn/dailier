# Feature Spec: Daily Entry

## Overview

The **Daily Entry** feature is the core of the application. It allows a developer to write their Scrum daily standup answers for a specific date, store them, and retrieve the previous workday's entry as a reference while filling in the current one.

---

## User Story

> As a developer, I want to write my three daily standup answers (what I did yesterday, what I will do today, and blockers) and save them so that the application can automatically send them by email before the next day's meeting.

---

## Domain Model

### Record: `DailyEntry`
Package: `com.personal.dailier.daily.domain`

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Auto-generated primary key (nullable on create) |
| `date` | `String` | Date in `yyyy-MM-dd` format (unique per record) |
| `didYesterday` | `String` | Free text ? what was done yesterday |
| `willDoToday` | `String` | Free text ? what will be done today |
| `blockers` | `String` | Free text ? current blockers (optional) |

---

## Ports

### Inbound ? `DailyEntryUseCase`
Package: `com.personal.dailier.daily.domain.port`

| Method | Description |
|---|---|
| `findAll()` | Returns all stored daily entries |
| `findByDate(String date)` | Returns the entry for a given date (`yyyy-MM-dd`), empty if not found |
| `save(DailyEntry entry)` | Creates a new entry |
| `update(Long id, DailyEntry entry)` | Replaces an existing entry by ID |

### Outbound ? `DailyEntryRepository`
Package: `com.personal.dailier.daily.domain.port`

| Method | Description |
|---|---|
| `findAll()` | Queries all rows from the database |
| `findByDate(String date)` | Queries by date column |
| `findById(Long id)` | Queries by primary key |
| `save(DailyEntry entry)` | Persists (insert or update) an entry |

---

## Application Layer

### `DailyEntryService`
Package: `com.personal.dailier.daily.application`

- Implements `DailyEntryUseCase`.
- Delegates all operations to `DailyEntryRepository`.
- `update` guards that the ID exists before saving; throws `EntityNotFoundException` otherwise.
- Annotated with `@Service` and `@Transactional`; read operations use `@Transactional(readOnly = true)`.

---

## Infrastructure

### Persistence
Package: `com.personal.dailier.daily.infrastructure.persistence`

| Class | Role |
|---|---|
| `DailyEntryEntity` | JPA entity mapped to table `daily_entry`; uses Lombok (`@Builder`, `@Getter`, `@Setter`, etc.) |
| `DailyEntryJpaRepository` | Spring Data `JpaRepository<DailyEntryEntity, Long>`; declares `findByDate(String)` |
| `DailyEntryRepositoryAdapter` | Implements `DailyEntryRepository`; maps between domain record and JPA entity |

**Database table** (`daily_entry`):

| Column | Type | Constraints |
|---|---|---|
| `id` | `INTEGER` | PK, auto-increment |
| `date` | `VARCHAR(10)` | NOT NULL, UNIQUE |
| `did_yesterday` | `TEXT` | NOT NULL |
| `will_do_today` | `TEXT` | NOT NULL |
| `blockers` | `TEXT` | nullable |

Defined in Liquibase changeset `001` ? `backend/src/main/resources/db/changelog/001-initial-schema.xml`.

### REST Controller
Package: `com.personal.dailier.daily.infrastructure.rest`  
Base path: `/api/daily-entries`

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/api/daily-entries` | `200 OK` | Returns all entries |
| `GET` | `/api/daily-entries/{date}` | `200 OK` / `404` | Returns the entry for the given date |
| `POST` | `/api/daily-entries` | `201 Created` | Creates a new entry |
| `PUT` | `/api/daily-entries/{id}` | `200 OK` / `404` | Updates an existing entry by ID |

---

## Frontend

### Routes
| Path | Component | Description |
|---|---|---|
| `/daily` | `DailyFormComponent` | Write today's daily ? root redirect points here |
| `/daily-list` | `DailyListComponent` | List all stored dailies, newest first |

### Component: `DailyFormComponent`
File: `frontend/src/app/daily/component/daily-form/daily-form.ts`

**Behaviour:**
- On init, defaults the date to **today** and calls `loadForDate(today)`.
- `loadForDate(date)` performs two parallel API calls:
  1. Fetches the **previous workday's** entry (relative to the selected date) to show as read-only reference.
  2. Fetches the entry **for the selected date**. If it exists, the form is populated and enters **edit mode** (`isEditingExisting = true`, `existingEntryId` stored). If it doesn't exist, the text fields are cleared and the form enters **create mode**.
- The user can **change the date** at any time using the date picker. Each change triggers `onDateChange()` which re-runs `loadForDate`.
- On submit:
  - **Create mode** (`existingEntryId` unset): calls `DailyService.save()` (POST).
  - **Edit mode** (`existingEntryId` set): calls `DailyService.update()` (PUT).
  - After a successful save, `isEditingExisting` is set to `true` and `existingEntryId` is stored.
- The submit button label and success message reflect the current mode (*Save daily* / *Update daily*).
- The card subtitle shows an *"Editing existing entry"* badge when in edit mode.

**Signals:**

| Signal | Type | Purpose |
|---|---|---|
| `previousEntry` | `DailyEntry \| null` | Previous workday's entry shown as reference (recalculated on date change) |
| `isSaving` | `boolean` | Disables the submit button while in-flight |
| `savedSuccessfully` | `boolean` | Shows a confirmation message after a successful save |
| `isEditingExisting` | `boolean` | Distinguishes create vs. update mode in the UI |

### Service: `DailyService`
File: `frontend/src/app/daily/service/daily.service.ts`

| Method | HTTP | Endpoint |
|---|---|---|
| `getAll()` | `GET` | `/api/daily-entries` |
| `getByDate(date)` | `GET` | `/api/daily-entries/{date}` |
| `save(entry)` | `POST` | `/api/daily-entries` |
| `update(id, entry)` | `PUT` | `/api/daily-entries/{id}` |

### Component: `DailyListComponent`
File: `frontend/src/app/daily/component/daily-list/daily-list.ts`

**Behaviour:**
- On init, calls `DailyService.getAll()` and sorts the results by `date` descending (newest first).
- Each entry is rendered as a collapsible expansion panel (`mat-accordion`).
  - The panel header shows the date; if `blockers` is non-empty a warning chip is shown.
  - Expanding the panel reveals the three fields: *What did I do yesterday?*, *What will I do today?*, and *Blockers* (only if present).
- While loading, a spinner is shown.
- When the list is empty, an empty-state placeholder is shown with a link to `/daily`.
- A "Write today's daily" button in the header navigates to `/daily`.

**Signals:**

| Signal | Type | Purpose |
|---|---|---|
| `isLoading` | `boolean` | Shows spinner while the HTTP request is in-flight |
| `entries` | `DailyEntry[]` | Holds the sorted list of all entries |

### Model: `DailyEntry`
File: `frontend/src/app/daily/model/daily-entry.model.ts`

```typescript
export interface DailyEntry {
  id?: number;
  date: string;
  didYesterday: string;
  willDoToday: string;
  blockers?: string;
}
```

---

## Business Rules

1. `date` is unique ? two entries for the same day are not allowed at the DB level. The form auto-detects existing entries and switches to edit mode transparently.
2. `didYesterday` and `willDoToday` are mandatory; `blockers` is optional.
3. The date defaults to **today** but the user can select any past or future date.
4. The previous workday reference is always calculated **relative to the selected date** (not today), using the rule: Monday ? ?3 days (Friday), any other day ? ?1 day.
5. Changing the date resets the text fields and reloads any existing entry for that date.

---

## Error Handling

| Scenario | Backend behaviour | Frontend behaviour |
|---|---|---|
| No previous workday entry found | `404 Not Found` | `previousEntry` signal stays `null`; reference card hidden |
| No existing entry for selected date | `404 Not Found` | Form cleared; create mode activated |
| Entry not found on update (stale ID) | `404 Not Found` | `isSaving` resets to `false`; no success message shown |
| Save / update fails (server error) | `5xx` | `isSaving` resets to `false`; no success message shown |

