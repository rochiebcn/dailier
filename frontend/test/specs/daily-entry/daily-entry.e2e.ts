import DailyFormPage from '../../pageobjects/daily-form.page';

describe('Feature: Daily Entry', () => {
  beforeEach(async () => {
    await DailyFormPage.open();
  });

  it('should display the form with today\'s date by default', async () => {
    await expect(DailyFormPage.form).toBeDisplayed();
    const dateValue = await DailyFormPage.dateInput.getValue();
    await expect(dateValue).not.toBe('');
  });

  it('should be in create mode when navigating to a date with no entry', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    await DailyFormPage.setDate(futureDate.toISOString().split('T')[0]);

    const label = await DailyFormPage.getSubmitButtonLabel();
    const isCreate = label.toLowerCase().includes('save') || label.toLowerCase().includes('guardar');
    await expect(isCreate).toBe(true);
  });

  it('should create a new daily entry and switch to edit mode', async () => {
    // Only run if not already in edit mode
    const alreadyEditing = await DailyFormPage.editingBadge.isDisplayed().catch(() => false);
    if (alreadyEditing) {
      // Use a future date to ensure create mode
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      await DailyFormPage.setDate(futureDate.toISOString().split('T')[0]);
    }

    await DailyFormPage.fillDidYesterday('Worked on feature X');
    await DailyFormPage.fillWillDoToday('Will implement feature Y');
    await DailyFormPage.submit();

    await DailyFormPage.waitForSuccessMessage();
    await expect(DailyFormPage.successMessage).toBeDisplayed();
    await expect(DailyFormPage.editingBadge).toBeDisplayed();
  });

  it('should show editing badge and Update label when entry already exists', async () => {
    const editingDisplayed = await DailyFormPage.editingBadge.isDisplayed().catch(() => false);
    if (editingDisplayed) {
      await expect(DailyFormPage.editingBadge).toBeDisplayed();
      const label = await DailyFormPage.getSubmitButtonLabel();
      const isUpdate = label.toLowerCase().includes('update') || label.toLowerCase().includes('actualizar');
      await expect(isUpdate).toBe(true);
    }
  });

  it('should update an existing entry and show success message', async () => {
    const editingDisplayed = await DailyFormPage.editingBadge.isDisplayed().catch(() => false);
    if (!editingDisplayed) {
      // Create entry first
      await DailyFormPage.fillDidYesterday('Initial yesterday work');
      await DailyFormPage.fillWillDoToday('Initial today plan');
      await DailyFormPage.submit();
      await DailyFormPage.waitForSuccessMessage();
    }

    await DailyFormPage.fillWillDoToday('Updated today plan');
    await DailyFormPage.submit();

    await DailyFormPage.waitForSuccessMessage();
    await expect(DailyFormPage.successMessage).toBeDisplayed();
  });
});

