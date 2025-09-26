const { test, expect } = require("@playwright/test");

const VALID_USER = "1010101111";
const VALID_PASS = "1010101111";
const INVALID_USER = "wrongUser";
const INVALID_PASS = "wrongPass";

// Dashboard URL 
const LOGIN_URL = "https://od-erp-qa.web.app/entity/dashboard";

test(" Login with valid credentials should succeed", async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.waitForSelector("#username");
  await page.fill("#username", VALID_USER);
  await page.fill("#password", VALID_PASS);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Dashboard")).toBeVisible();
});

test(" Invalid username should show error", async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.waitForSelector("#username");
  await page.fill("#username", INVALID_USER);
  await page.fill("#password", VALID_PASS);
  await page.click('button[type="submit"]');
  await expect(page.locator(".error-message")).toContainText("Invalid credentials");
});

test(" Invalid password should show error", async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.waitForSelector("#username");
  await page.fill("#username", VALID_USER);
  await page.fill("#password", INVALID_PASS);
  await page.click('button[type="submit"]');
  await expect(page.locator(".error-message")).toContainText("Invalid credentials");
});

test(" Empty fields should show error", async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
  await expect(page.locator(".error-message")).toContainText("Username and password required");
});
