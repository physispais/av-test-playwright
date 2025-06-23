import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CarDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async getPrice() {
    const actualFullPrice = (await this.page.locator('.card__price').textContent()) || '';
    return actualFullPrice.split('≈')[0].trim();

  }
  getPage() {
    return this.page;
  }
}