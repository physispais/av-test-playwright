import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CarDetailsPage } from './CarDetailsPage';

export class SearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async selectBrand(brand: string) {
    await this.page.locator('#p-6-0-2-brand').click();
    await this.page.locator(`//*[@class='dropdown__listitem']//*[contains(text(), '${brand}')]`).click();
  }

  async selectModel(model: string) {
    await this.page.locator('#p-6-0-3-model').click();
    await this.page.locator(`//*[@class='dropdown__listitem']//*[text()='${model}']`).click();
    await this.page.waitForResponse(response => response.url().includes('/update') && response.status() === 200);
  }

  async selectGenerations(generations: string[]) {
    await this.page.locator('#p-6-0-4-generation').dblclick();
    for (const generation of generations) {
      await this.page.locator(`//*[@class='generation-item']//*[text()='${generation}']`).click();
    }
    await this.page.locator("//*[@class='filter__title']").click();
    await this.waitForTimeout(1000);
  }

  async showResults() {
    await this.page.locator("//*[@class='filter__show-result']").click();
  }

  async loadAllResults() {
    while (await this.page.locator("//div[@class='paging__button']").count() > 0) {
      await this.page.locator("//div[@class='paging__button']").click();
      await this.waitForTimeout(1000);
    }
    await this.page.waitForSelector('.listing-item');
  }

  async findMostExpensiveCar() {
    const prices = await this.page.locator('.listing-item__prices').allTextContents();
    const numericPrices = prices.map(text => {
      const mainPrice = text.split('≈')[0].trim();
      return parseFloat(mainPrice.replace(/\D+/g, ''));
    });
    const maxPrice = Math.max(...numericPrices);
    const maxPriceIndex = numericPrices.indexOf(maxPrice);

    const mostExpensiveCar = this.page.locator('.listing-item').nth(maxPriceIndex);
    const fullPriceText = (await mostExpensiveCar.locator('.listing-item__prices').textContent()) || '';
    const expectedMainPrice = fullPriceText.split('≈')[0].trim();

    const link = mostExpensiveCar.locator('a.listing-item__link');

    return {
      link,
      expectedMainPrice,
      openDetails: async () => {
        const opensInNewTab = await link.evaluate((el: HTMLAnchorElement) => {
          return el.tagName === 'A' && el.target === '_blank';
        });

        let newPage;
        if (opensInNewTab) {
          const context = this.page.context();
          [newPage] = await Promise.all([
            context.waitForEvent('page'),
            link.click()
          ]);
          await newPage.waitForLoadState();
        } else {
          await Promise.all([
            this.page.waitForNavigation(),
            link.click()
          ]);
          newPage = this.page;
        }
        return new CarDetailsPage(newPage);
      }
    };
  }
}