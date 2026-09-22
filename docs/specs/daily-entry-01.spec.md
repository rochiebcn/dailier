# E2E Spec: Daily Entry

## Base URL
/daily

---

## Scenario: Create a new daily entry

Steps:
1. Navigate to daily form page
2. Verify the date field defaults to today
3. Verify the form is in create mode (submit button shows "Save daily")
4. Enter "Worked on feature X" in the "What did I do yesterday?" field
5. Enter "Will implement feature Y" in the "What will I do today?" field
6. Leave blockers field empty
7. Click submit button
8. Verify success message is displayed
9. Verify form switches to edit mode (submit button shows "Update daily")
10. Verify "Editing existing entry" badge is shown

---

## Scenario: Edit an existing daily entry

Steps:
1. Navigate to daily form page for a date that already has an entry
2. Verify the form fields are populated with the existing entry
3. Verify the form is in edit mode (submit button shows "Update daily")
4. Verify "Editing existing entry" badge is shown
5. Update the "What will I do today?" field with new text
6. Click submit button
7. Verify success message is displayed
8. Verify updated content is shown in the form

---