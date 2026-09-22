---
applyTo: "frontend/test/**"
---

# WebdriverIO E2E Tests Instructions

## 1. Purpose
Generate End-to-End (E2E) tests using WebdriverIO (WDIO) following a scalable, maintainable, and consistent structure.

Tests MUST follow Page Object Model (POM) and project conventions.

---

## 2. Project Structure

All E2E files must be located under:

```
frontend/test
  /specs
  /pageobjects
  /data
  /utils
```

### Standard structure:

```
test/
  specs/
    <feature-name>/
      <feature-name>.e2e.ts
  pageobjects/
    base.page.ts
    <feature-name>.page.ts
  data/
    <feature-name>.data.ts
  utils/
    commands.ts
```

### Rules:
- Tests MUST be inside `/test/specs`
- Page Objects MUST be inside `/test/pageobjects`
- Each feature must have its own folder
- Do NOT mix tests and page objects
- Keep structure flat and consistent

---

## 3. Naming Conventions

### Spec files
- Pattern: `<feature-name>.e2e.ts`

### Page objects
- Pattern: `<feature-name>.page.ts`

### Data files
- Pattern: `<feature-name>.data.ts`

---

## 4. Spec File Structure

Use Mocha syntax:

```ts
import LoginPage from '../../pageobjects/login.page';

describe('Feature: Login', () => {

  beforeEach(async () => {
    await browser.url('/login');
  });

  it('should login with valid credentials', async () => {
    await LoginPage.login('user', 'password');
    await expect(LoginPage.successMessage).toBeDisplayed();
  });

});
```

---

## 5. Page Object Model (POM)

- All selectors MUST be defined in page objects
- Use getters for all elements
- Encapsulate actions as methods
- Export a singleton instance

---

## 6. Selector Strategy

Priority order:
1. data-test attributes
2. id
3. stable CSS selectors
4. XPath (last resort)

---

## 7. Test Design Guidelines

- Tests must represent real user flows
- Tests must be independent
- Avoid shared state
- Use beforeEach for setup

---

## 8. Assertions

- Use WDIO `expect` API
- Assertions only in spec files

---

## 9. Anti-Patterns to Avoid

- No selectors in spec files
- No assertions in page objects
- No duplicated logic
- No hardcoded waits

---

## 10. Code Generation Rules

- Always generate 1 spec + 1 page object
- Follow naming strictly
- Use async/await
- Clean and readable code

---

## 11. Output Format

Always provide:
1. File paths
2. Full file contents

Example:
```
test/specs/login/login.e2e.ts
test/pageobjects/login.page.ts
```

---

## 12. Copilot Behavior

- Follow instructions strictly
- Do not invent new structures
- Prefer consistency over creativity
- Generate production-ready code

