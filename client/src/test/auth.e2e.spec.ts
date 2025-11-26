import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { By, until, WebDriver } from "selenium-webdriver";
import { createDriver } from "./driver";

describe("E2E - Authentication flow", () => {
  let driver : WebDriver;
  let randomEmail: string;
  let randomFullName: string;

  beforeAll(async () => {
    try {
      driver = await createDriver();

      randomEmail = `test_${Date.now()}@example.com`;
      randomFullName = `testuser_${Date.now()}`;
    } catch (err) {
      console.error("Error launching driver:", err);
      throw err;
    }
  }, 30000);

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  async function waitAndClick(selector: string) {
    const el = await driver.wait(until.elementLocated(By.css(selector)), 5000);
    await driver.wait(until.elementIsVisible(el), 5000);
    await el.click();
  }

  async function waitAndType(selector: string, text: string) {
    const el = await driver.wait(until.elementLocated(By.css(selector)), 5000);
    await driver.wait(until.elementIsVisible(el), 5000);
    await el.clear();
    await el.sendKeys(text);
  }

  it(
    "Register should work",
    async () => {
      await driver.get("http://localhost:5173");

      await waitAndClick('a[href="/register"]');

      const header = await driver.wait(
        until.elementLocated(
          By.css("h2.text-3xl.font-bold.text-center.mb-2.text-gray-900")
        ),
        5000
      );

      expect(await header.getText()).toBe("Create your account");

      await waitAndType("#fullName", randomFullName);
      await waitAndType("#email", randomEmail);
      await waitAndType("#password", "12345678");

      await waitAndClick("button[type='submit']");
      
      const usernameElement = await driver.wait(
        until.elementLocated(By.xpath("//header//p[@class='text-sm font-medium leading-none']")),
        5000
      );

      expect(await usernameElement.getText()).toBe(randomFullName);
      
      const dashboard = await driver.wait(
        until.elementLocated(By.css("h2.text-3xl.font-semibold")),
        5000
      );

      expect(await dashboard.getText()).toBe("Dashboard");
    },
    30000
  );

  it (
    "Login should work",
    async () => {
      await driver.get("http://localhost:5173");

      const header = await driver.wait(
        until.elementLocated(
          By.css("h2.text-3xl.font-bold.text-center.mb-2.text-gray-900")
        ),
        5000
      );

      expect(await header.getText()).toBe("Welcome back!");

      await waitAndType("#email", randomEmail);
      await waitAndType("#password", "12345678");

      await waitAndClick("button[type='submit']");

      const dashboard = await driver.wait(
        until.elementLocated(By.css("h2.text-3xl.font-semibold")),
        5000
      );

      expect(await dashboard.getText()).toBe("Dashboard");

      const usernameElement = await driver.wait(
        until.elementLocated(By.xpath("//header//p[@class='text-sm font-medium leading-none']")),
        5000
      );

      expect(await usernameElement.getText()).toBe(randomFullName);
    },
    30000
  );



  it(
    "Logout should work",
    async () => {
      await driver.get("http://localhost:5173");

      const header = await driver.wait(
        until.elementLocated(
          By.css("h2.text-3xl.font-bold.text-center.mb-2.text-gray-900")
        ),
        5000
      );

      expect(await header.getText()).toBe("Welcome back!");

      await waitAndType("#email", randomEmail);
      await waitAndType("#password", "12345678");

      await waitAndClick("button[type='submit']");

      const dashboard = await driver.wait(
        until.elementLocated(By.css("h2.text-3xl.font-semibold")),
        5000
      );

      expect(await dashboard.getText()).toBe("Dashboard");

      const usernameElement = await driver.wait(
        until.elementLocated(By.xpath("//header//p[@class='text-sm font-medium leading-none']")),
        5000
      );

      expect(await usernameElement.getText()).toBe(randomFullName);

      await waitAndClick('a[href="/login"]');

      const header2 = await driver.wait(
        until.elementLocated(
          By.css("h2.text-3xl.font-bold.text-center.mb-2.text-gray-900")
        ),
        5000
      );

      expect(await header2.getText()).toBe("Welcome back!");
    },
    20000
  );

});
