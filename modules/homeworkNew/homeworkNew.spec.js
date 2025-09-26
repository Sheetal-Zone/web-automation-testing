const { test, expect } = require('@playwright/test');
const homeworkJSON = require("./homeworkNew.json");
const { login } = require("../login/login");

// Base URL
const BASE_URL = 'https://od-erp-qa.web.app/schoolDiary/homeworkNew';

// --- Helper: File upload ---
async function uploadFiles(page, inputSelector, files = []) {
  for (const file of files) {
    try {
      await page.waitForSelector(inputSelector, { state: 'visible' });
      await page.locator(inputSelector).setInputFiles(file);
      const uploadedFile = page.locator(`.uploaded-file:has-text("${file.split('/').pop()}")`);
      await expect(uploadedFile).toBeVisible();
    } catch (err) {
      console.error(`File upload failed: ${file}`, err);
    }
  }
}

// --- Helper: Theme toggle ---
async function toggleTheme(page, theme = 'dark') {
  const toggle = page.locator('button:has-text("Theme Toggle")');
  await toggle.waitFor({ state: 'visible' });
  await toggle.click();
  await page.waitForFunction((themeClass) => document.body.classList.contains(themeClass), theme);
  await expect(page.locator('body')).toHaveClass(new RegExp(theme));
}

test.describe('HomeworkNew Angular Tests', () => {

  // Login & go to homework page before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(BASE_URL);
    await page.waitForSelector('form[name="homeworkForm"]', { state: 'visible' });
  });

  // --- Filters presence & validation ---
  for (const filter of homeworkJSON.functionality.filters) {
    test(`Filter present & validated: ${filter.name}`, async ({ page }) => {
      const selector = `form [formControlName="${filter.name.replace(/\s+/g,'')}"]`;
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible' });
      await expect(element).toBeVisible();

      if (filter.mandatory) {
        await element.fill('');
        await page.locator('button:has-text("Save")').click();
        const error = page.locator('.error-message');
        await expect(error).toBeVisible();
      }
    });
  }

  // --- Stream-Section dependency ---
  test('Stream-Section dependency works', async ({ page }) => {
    const streamSelector = 'form [formControlName="SelectStream"]';
    const sectionSelector = 'form [formControlName="SelectSection"]';
    await page.locator(streamSelector).selectOption({ index: 1 });
    const sectionOptions = await page.locator(`${sectionSelector} option`).allTextContents();
    expect(sectionOptions.length).toBeGreaterThan(1);
  });

  // --- Table Columns & Read-only check ---
  homeworkJSON.functionality.tableColumns.forEach(column => {
    test(`Column visible: ${column.name}`, async ({ page }) => {
      const header = page.locator(`table thead th:has-text("${column.name}")`);
      await header.waitFor({ state: 'visible' });
      await expect(header).toBeVisible();
    });

    if (column.readonly) {
      test(`Column ${column.name} is read-only`, async ({ page }) => {
        const firstRow = page.locator('table tbody tr').first();
        const input = firstRow.locator(`input[formControlName="${column.name.replace(/\s+/g,'')}"]`);
        await expect(input).toHaveAttribute('readonly', '');
      });
    }
  });

  // --- Critical path: Create homework ---
  test('Create homework with all fields filled', async ({ page }) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2,'0')}/${
      (today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;

    // Fill filters
    for (const filter of homeworkJSON.functionality.filters) {
      const selector = `form [formControlName="${filter.name.replace(/\s+/g,'')}"]`;
      if(filter.type === 'dropdown') await page.locator(selector).selectOption({ index:1 });
      else if(filter.type === 'datePicker') await page.locator(selector).fill(formattedDate);
    }

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('input[formControlName="Title"]').fill('Test Homework');
    await firstRow.locator('textarea[formControlName="Message"]').fill('Homework message for testing.');
    await firstRow.locator('input[formControlName="URL"]').fill('https://example.com');
    await firstRow.locator('input[formControlName="URLDisplayName"]').fill('Example');

    await uploadFiles(firstRow, 'input[formControlName="File1"]', ['tests/sample.pdf']);
    await uploadFiles(firstRow, 'input[formControlName="File2"]', ['tests/sample2.png']);

    const notification = firstRow.locator('input[formControlName="SendNotification"]');
    await notification.check();
    await expect(notification).toBeChecked();

    await toggleTheme(page,'dark');
    await toggleTheme(page,'light');

    await firstRow.locator('button:has-text("Save")').click();
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  // --- Negative Tests ---
  test('Submit empty mandatory fields', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('input[formControlName="Title"]').fill('');
    await firstRow.locator('textarea[formControlName="Message"]').fill('');
    await page.locator('button:has-text("Save")').click();
    const errors = page.locator('.error-message');
    await expect(errors).toHaveCountGreaterThan(0);
  });

  test('Invalid URL submission', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('input[formControlName="URL"]').fill('invalid-url');
    await page.locator('button:has-text("Save")').click();
    const error = page.locator('.error-message:has-text("Invalid URL")');
    await expect(error).toBeVisible();
  });

  test('Oversized file upload', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('input[formControlName="File1"]').setInputFiles('tests/oversize.pdf');
    const error = page.locator('.error-message:has-text("File size exceeds limit")');
    await expect(error).toBeVisible();
  });

  test('Prevent past dates in date picker', async ({ page }) => {
    const dateSelector = 'form [formControlName="ChooseHomeworkDate"]';
    await page.locator(dateSelector).fill('01/01/2000');
    await page.locator('button:has-text("Save")').click();
    const error = page.locator('.error-message:has-text("Invalid date")');
    await expect(error).toBeVisible();
  });

  // --- Responsive Tests ---
  const viewports = [
    {name:'mobile', width:375, height:800},
    {name:'tablet', width:768, height:1024},
    {name:'desktop', width:1280, height:900}
  ];

  viewports.forEach(vp => {
    test(`Responsive check: ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({width:vp.width,height:vp.height});
      await page.goto(BASE_URL);
      await expect(page.locator('table')).toBeVisible();
    });
  });

});
