# Skill: Generate WDIO E2E Tests

## 1. Purpose

Generate complete WebdriverIO (WDIO) End-to-End tests following project conventions and Page Object Model.

---

## 2. When to Use

Use this skill when:

- User asks to create E2E tests
- User provides a feature or user flow
- UI automation is required

---

## 3. Inputs

Expected inputs:

- Spec file (Markdown)
- List of steps
- Optional: base path, selectors or UI description

---

## 4. Output

Must generate:

1. Spec file:
   frontend/src/e2e/specs/<feature>/<feature>.e2e.ts

2. Page Object:
   frontend/src/e2e/pageobjects/<feature>.page.ts

3. (Optional) Data file:
   frontend/src/e2e/data/<feature>.data.ts

---

## 5. Rules

- Follow Page Object Model strictly
- No selectors in spec files
- No assertions in page objects
- Use async/await
- Use WDIO expect API
- Follow naming conventions

---

## 6. Execution Steps

1. Parse spec:
    - Extract feature name
    - Extract steps
2. Convert steps ? intents using mappings.md

3. Convert intents ? actions:
    - WDIO code
    - MCP tool calls (if agent mode enabled)

4. Build:
    - Create folder under `/test/specs/<feature>`
    - Generate spec file:
        - describe = feature
        - it = scenario
    - Generate page object:
        - selectors as getters
        - actions as methods
    - Add assertions in spec file
    - Ensure imports are correct
5. Use templates from templates/

---

## 7. Example

### Input

Feature: login  
Scenario: valid login

### Output

test/specs/login/login.e2e.ts  
test/pageobjects/login.po.ts

---

## 8. Anti-Patterns

- Do not mix test and page object
- Do not use hardcoded waits
- Do not use fragile selectors
- Do not duplicate logic

---

## 9. Copilot Behavior

- Be deterministic
- Follow structure strictly
- Prefer consistency over creativity

---

## 10. MCP Integration

If MCP is available:
- Execute steps using tools:
   - navigate
   - clickElement
   - setValue
   - isDisplayed

- Capture:
   - selectors
   - flows

- Use results to improve generated code

---

## 11. Rules

- Strict Page Object Model
- No selectors in spec file
- No assertions in Page Object
- Use async/await
- Use WDIO expect API

---