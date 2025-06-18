import { test, Page, expect } from '@playwright/test';

test.describe('поиск bmw x6', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://av.by/');
      await page.click('button:has-text("Принять")');
  });

  test('поиск по параметрам', async () => {
    await page.locator('#p-6-0-2-brand').click();
    await page.locator("//*[@class='dropdown__listitem']//*[contains(text(), 'BMW')]").click();
    await page.locator('#p-6-0-3-model').click();
    await page.locator("//*[@class='dropdown__listitem']//*[text()='X6']").click();
    await page.waitForResponse(response => response.url().includes('/update') && response.status() === 200);
    await page.locator('#p-6-0-4-generation').dblclick();
    await page.locator("//*[@class='generation-item']//*[text()='G06 · Рестайлинг, 2023…']").click();
    await page.locator("//*[@class='generation-item']//*[text()='G06, 2019…2023']").click();
    await page.locator("//*[@class='filter__title']").click();
    await page.waitForTimeout(1000);
    await page.locator("//*[@class='filter__show-result']").click();
    while (await page.locator("//*[@class='paging__button']").count() > 0) {
      await page.locator("//*[@class='paging__button']").click();
      await page.waitForTimeout(1000);
    }
    
    await page.waitForSelector('.listing-item');
    
    const prices = await page.locator('.listing-item__prices').allTextContents();
    const numericPrices = prices.map(text => {
      const mainPrice = text.split('≈')[0].trim();
      return parseFloat(mainPrice.replace(/\D+/g, ''));
    });
    const maxPrice = Math.max(...numericPrices);
    const maxPriceIndex = numericPrices.indexOf(maxPrice);

    const mostExpensiveCar = page.locator('.listing-item').nth(maxPriceIndex);
    const fullPriceText = (await mostExpensiveCar.locator('.listing-item__prices').textContent()) || '';
    const expectedMainPrice = fullPriceText.split('≈')[0].trim();

    await mostExpensiveCar.locator('a.listing-item__link').click()
    const actualFullPrice = (await page.locator('.card__price').textContent()) || '';
    const actualMainPrice = actualFullPrice.split('≈')[0].trim();

    expect(actualMainPrice).toBe(expectedMainPrice);
  });
});
