const { Builder, Browser, By, until } = require("selenium-webdriver");

let driver;

beforeEach(async () => {
  driver = await new Builder().forBrowser(Browser.CHROME).build();
});

afterEach(async () => {
  await driver.quit();
});

describe("Duel Duo tests", () => {
  test("page loads with title", async () => {
    await driver.get("http://localhost:8000");
    await driver.wait(until.titleIs("Duel Duo"), 1000);
  });

  // Test 1: Check that the 'Draw' button displays the bots
  test("clicking the Draw button displays the 'bots'", async () => {
    await driver.get("http://localhost:8000");
    const drawButton = await driver.findElement(By.id("draw"));
    await drawButton.click();

    const choicesDiv = await driver.findElement(By.id("choices"));
    const isDisplayed = await choicesDiv.isDisplayed();
    expect(isDisplayed).toBe(true);
  });

  // Test 2: Check that the add to duo button displays the selected bots under the 'Your Duo' section
  test("clicking 'Add to Duo' button displays the selected bots under the 'Your Duo' section", async () => {
    await driver.get("http://localhost:8000");
    const drawButton = await driver.findElement(By.id("draw"));
    await drawButton.click();

    const addToDuoButtons = await driver.findElements(By.className("bot-btn"));
    await addToDuoButtons[0].click();

    const playerDuoDiv = await driver.findElement(By.id("player-duo"));
    const isDisplayed = await playerDuoDiv.isDisplayed();
    expect(isDisplayed).toBe(true);
  });

});

// Run npm test -t duelDuo