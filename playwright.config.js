// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './modules', // <-- yahan aapke test files ke folder ka path
  timeout: 60000,       // har test ke liye max 60 sec
  retries: 1,           // fail hone par ek baar retry karega
  reporter: [['list'], ['html', { open: 'never' }]], // console + html report

  use: {
    headless: false,      // always headed (browser UI dikhega)
    viewport: { width: 1366, height: 768 }, // default screen size
    ignoreHTTPSErrors: true,
    actionTimeout: 15000,   // har action ke liye max 15 sec
    navigationTimeout: 30000, // page load ke liye max 30 sec
    screenshot: 'only-on-failure', // fail hone pe screenshot
    video: 'retain-on-failure',    // fail hone pe video recording
    trace: 'retain-on-failure',    // debugging ke liye trace
  },
});
