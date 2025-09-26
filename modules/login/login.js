
async function login(page) {
  const USERNAME = "1010101111"; // Hardcoded valid username
  const PASSWORD = "1010101111"; // Hardcoded valid password

  // Go to login page
  await page.goto("https://od-erp-qa.web.app/login");

  // Wait for username and password fields to appear
  await page.waitForSelector("#username", { state: 'visible', timeout: 5000 });
  await page.waitForSelector("#password", { state: 'visible', timeout: 5000 });

  // Fill credentials
  await page.fill("#username", USERNAME);
  await page.fill("#password", PASSWORD);

  // Click submit button
  await page.click('button[type="submit"]');

  // Wait for Dashboard to appear
  await page.waitForSelector("text=Dashboard", { timeout: 10000 });
}

module.exports = { login };
