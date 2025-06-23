import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate() {
    await this.page.goto('https://av.by/');
    await this.page.click('button:has-text("Принять")');
  }

  getPage() {
    return this.page;
  }
}