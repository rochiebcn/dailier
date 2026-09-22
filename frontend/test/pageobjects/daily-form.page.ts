export class DailyFormPage {
  // ── Selectors ──────────────────────────────────────────────────────────────

  get form() {
    return $('[data-test="daily-form"]');
  }

  get dateInput() {
    return $('[data-test="input-date"]');
  }

  get didYesterdayInput() {
    return $('[data-test="input-did-yesterday"]');
  }

  get willDoTodayInput() {
    return $('[data-test="input-will-do-today"]');
  }

  get blockersInput() {
    return $('[data-test="input-blockers"]');
  }

  get submitButton() {
    return $('[data-test="btn-submit"]');
  }

  get submitButtonLabel() {
    return $('[data-test="btn-submit-label"]');
  }

  get successMessage() {
    return $('[data-test="success-message"]');
  }

  get editingBadge() {
    return $('[data-test="editing-badge"]');
  }

  get previousEntryCard() {
    return $('[data-test="previous-entry-card"]');
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async open() {
    await browser.url('/daily');
    await this.form.waitForDisplayed({ timeout: 10000 });
  }

  async fillDidYesterday(text: string) {
    await this.didYesterdayInput.clearValue();
    await this.didYesterdayInput.setValue(text);
  }

  async fillWillDoToday(text: string) {
    await this.willDoTodayInput.clearValue();
    await this.willDoTodayInput.setValue(text);
  }

  async fillBlockers(text: string) {
    await this.blockersInput.clearValue();
    await this.blockersInput.setValue(text);
  }

  async setDate(date: string) {
    await browser.execute((el: HTMLInputElement, value: string) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, await this.dateInput as unknown as HTMLInputElement, date);
    await browser.pause(500);
  }

  async submit() {
    await this.submitButton.click();
    await browser.pause(1000);
  }

  async getSubmitButtonLabel() {
    return this.submitButtonLabel.getText();
  }

  async isInEditMode() {
    return this.editingBadge.isDisplayed();
  }

  async isInCreateMode() {
    const label = await this.getSubmitButtonLabel();
    return label.toLowerCase().includes('save') || label.toLowerCase().includes('guardar');
  }

  async waitForSuccessMessage() {
    await this.successMessage.waitForDisplayed({ timeout: 5000 });
  }
}

export default new DailyFormPage();

