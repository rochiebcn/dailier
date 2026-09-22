# E2E Spec: Daily Entry - With Blockers and List View

## Base URL
/daily

---

## Scenario: Create a daily entry with blockers

Steps:
1. Navigate to daily form page
2. Select a date with no existing entry
3. Enter "Finished code review" in the "What did I do yesterday?" field
4. Enter "Continue with testing" in the "What will I do today?" field
5. Enter "Waiting for deployment access" in the "Blockers" field
6. Click submit button
7. Verify success message is displayed

---

## Scenario: Change date loads existing entry

Steps:
1. Navigate to daily form page
2. Change the date picker to a date that has an existing saved entry
3. Verify the form fields are populated with that entry's data
4. Verify the form is in edit mode (submit button shows "Update daily")

---

## Scenario: Change date clears form for empty date

Steps:
1. Navigate to daily form page
2. Change the date picker to a date with no saved entry
3. Verify the text fields are cleared
4. Verify the form is in create mode (submit button shows "Save daily")

---

## Scenario: Previous workday entry is shown as reference

Steps:
1. Navigate to daily form page
2. Verify the previous workday reference card is displayed (if previous entry exists)
3. Verify the reference card is read-only

---

## Scenario: View list of daily entries

Steps:
1. Navigate to daily list page (/daily-list)
2. Verify entries are listed sorted by date descending (newest first)
3. Verify each entry shows the date in the panel header
4. Expand a panel
5. Verify "What did I do yesterday?", "What will I do today?" and "Blockers" fields are shown

---

## Scenario: Daily list shows warning chip for entries with blockers

Steps:
1. Navigate to daily list page (/daily-list)
2. Locate an entry that has blockers
3. Verify a warning chip is shown in the panel header

---

## Scenario: Empty daily list shows placeholder

Steps:
1. Navigate to daily list page (/daily-list) with no entries saved
2. Verify an empty-state placeholder is displayed
3. Verify a link/button to navigate to /daily is shown

---

## Scenario: Navigate from list to form

Steps:
1. Navigate to daily list page (/daily-list)
2. Click the "Write today's daily" button
3. Verify navigation to /daily occurs
4. Verify the date field defaults to today

