import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { BRAND, GENERATIONS, MODEL } from '../mock/data';


test.describe('поиск самого дорогого', () => {
  let homePage: HomePage;
  let searchPage: SearchPage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    homePage = new HomePage(page);
    await homePage.navigate();
    
    searchPage = new SearchPage(page);
  });

  test('поиск по параметрам', async () => {
    await searchPage.selectBrand(BRAND);
    await searchPage.selectModel(MODEL);
    await searchPage.selectGenerations(GENERATIONS);
    await searchPage.showResults();
    await searchPage.loadAllResults();

    const mostExpensiveCar = await searchPage.findMostExpensiveCar();
    const carDetailsPage = await mostExpensiveCar.openDetails();
    await carDetailsPage.getPage().waitForSelector('.card__price', { state: 'visible' });
    const actualMainPrice = await carDetailsPage.getPrice();
    expect(actualMainPrice).toBe(mostExpensiveCar.expectedMainPrice);
  });
});