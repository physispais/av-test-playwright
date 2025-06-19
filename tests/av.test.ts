import { test, Page, expect } from '@playwright/test';

const BRAND = 'BMW'
const MODEL = 'X5'
const GENERATION_1 = 'G05 · Рестайлинг, 2023…'
const GENERATION_2 = 'G05, 2018…2023'
test.describe('поиск bmw x6', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://av.by/');
      await page.click('button:has-text("Принять")');
  });

  test('поиск по параметрам', async () => {
    await page.locator('#p-6-0-2-brand').click();
    await page.locator(`//*[@class='dropdown__listitem']//*[contains(text(), '${BRAND}')]`).click();
    await page.locator('#p-6-0-3-model').click();
    await page.locator(`//*[@class='dropdown__listitem']//*[text()='${MODEL}']`).click();
    await page.waitForResponse(response => response.url().includes('/update') && response.status() === 200);
    await page.locator('#p-6-0-4-generation').dblclick();
    await page.locator(`//*[@class='generation-item']//*[text()='${GENERATION_1}']`).click();
    await page.locator(`//*[@class='generation-item']//*[text()='${GENERATION_2}']`).click();
    await page.locator("//*[@class='filter__title']").click();
    await page.waitForTimeout(1000);
    await page.locator("//*[@class='filter__show-result']").click();
    while (await page.locator("//div[@class='paging__button' and contains(text(), 'Показать ещё')]").count() > 0) {
      await page.locator("//div[@class='paging__button' and contains(text(), 'Показать ещё')]").click();
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

    const link = mostExpensiveCar.locator('a.listing-item__link');
    const opensInNewTab = await link.evaluate((el: HTMLAnchorElement) => {
  return el.tagName === 'A' && el.target === '_blank';
});

let newPage;

if (opensInNewTab) {
  const context = page.context();
  [newPage] = await Promise.all([
    context.waitForEvent('page'),
    link.click()
  ]);
  await newPage.waitForLoadState();
} else {
  await Promise.all([
    page.waitForNavigation(),
    link.click()
  ]);
  newPage = page;
}

const actualFullPrice = (await newPage.locator('.card__price').textContent()) || '';
const actualMainPrice = actualFullPrice.split('≈')[0].trim();

expect(actualMainPrice).toBe(expectedMainPrice);
  });
});
