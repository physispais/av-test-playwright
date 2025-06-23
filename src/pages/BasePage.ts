import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForTimeout(timeout: number) {
    await this.page.waitForTimeout(timeout);
  }
}