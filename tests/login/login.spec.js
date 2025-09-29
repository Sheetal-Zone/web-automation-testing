// tests/login/login.spec.js
const { test, expect } = require('@playwright/test');

const selectors = {
  mobileInput: 'input[placeholder="Mobile"]',                 // Mobile input field
  passwordInput: 'input[name="password"]',                    // Password field
  getOtpButton: 'button:has-text("Get OTP")',                 // OTP button
  passwordLoginLink: 'text=Password Login',                  // Password login link
  welcomeText: 'text=Welcome',                               // Welcome text verification
  dashboardText: 'text=Dashboard',                            // Dashboard verification after login
  errorMessage: 'text=Invalid Mobile Number',                // Invalid mobile error
};

test.describe('Login Page Test Suite - OkieDokie ERP', () => {

  // Extend timeout for slow Angular pages
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    // Navigate to login page and wait for network idle
    await page.goto('https://od-erp-qa.web.app/auth/login', { waitUntil: 'networkidle' });

    // Wait until mobile input is visible
    await page.locator(selectors.mobileInput).waitFor({ state: 'visible', timeout: 60000 });
  });

  test('TC-001: Page should load correctly with title and welcome text', async ({ page }) => {
    // Wait for Angular rendering to complete
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Okie Dokie/, { timeout: 60000 });
    await expect(page.locator(selectors.welcomeText)).toBeVisible({ timeout: 60000 });
  });

  test('TC-002: Mobile input field should be visible and editable', async ({ page }) => {
    const mobileField = page.locator(selectors.mobileInput);
    await expect(mobileField).toBeVisible({ timeout: 60000 });
    await mobileField.fill('1010101111'); // Login ID
    await expect(mobileField).toHaveValue('1010101111');
  });

  test('TC-003: OTP button should be clickable and trigger OTP flow', async ({ page }) => {
    await page.fill(selectors.mobileInput, '1010101111');

    const otpButton = page.locator(selectors.getOtpButton);
    await otpButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(otpButton).toBeEnabled();  // Ensure button is clickable
    await otpButton.click();

    // Wait until button changes to "Wait... Get OTP" (if applicable)
    const waitOtpButton = page.locator('button:has-text("Wait... Get OTP")');
    await waitOtpButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(waitOtpButton).toBeVisible();
  });

  test('TC-004: Should navigate to password login screen and login', async ({ page }) => {
    await page.click(selectors.passwordLoginLink);

    const passwordField = page.locator(selectors.passwordInput);
    await passwordField.waitFor({ state: 'visible', timeout: 60000 });

    await passwordField.fill('1010101111'); // Password
    await expect(passwordField).toHaveValue('1010101111');

    // Submit login
    await passwordField.press('Enter');

    // Verify dashboard appears
    const dashboard = page.locator(selectors.dashboardText);
    await dashboard.waitFor({ state: 'visible', timeout: 60000 });
    await expect(dashboard).toBeVisible();
  });

  test('TC-005: Invalid mobile number should show error message', async ({ page }) => {
    await page.fill(selectors.mobileInput, '12345'); // Invalid mobile
    await page.click(selectors.getOtpButton);

    const errorMessage = page.locator(selectors.errorMessage);
    await errorMessage.waitFor({ state: 'visible', timeout: 60000 });
    await expect(errorMessage).toBeVisible();
  });

});
