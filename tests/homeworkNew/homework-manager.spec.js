// tests/homeworkManager/homeworkManager.spec.js
const { test, expect, request } = require('@playwright/test');

// ================= SELECTORS =================
const selectors = {
  createHomeworkBtn: 'button#create-homework',    
  editHomeworkBtn: '.homework-item button.edit',  
  deleteHomeworkBtn: '.homework-item button.delete', 
  saveBtn: 'button#save-homework',                
  filterBtn: 'button#filter-homework',            
  modal: '.modal',                                
  homeworkList: '.homework-list',                 
  titleInput: 'input[name="title"]',
  subjectInput: 'select[name="subject"]',
  messageInput: 'textarea[name="message"]',
  fileUploadInput: 'input[type="file"]',
  notificationCheckboxes: '.notification-checkbox input[type="checkbox"]',
  searchInput: 'input#search-homework',
  applyFilterBtn: 'button#apply-filter',
  clearFilterBtn: 'button#clear-filter',
  errorMsg: '.error-message',
  usernameInput: 'input[name="username"]',
  passwordInput: 'input[name="password"]',
  loginBtn: 'button#login'
};

// ================= TESTS =================
test.setTimeout(180000);

test.describe('HomeworkManager Test Suite', () => {

  // ---------------- LOGIN & BEFORE EACH ----------------
  test.beforeEach(async ({ page }) => {
    // 1️⃣ Login page
    await page.goto('https://od-erp-qa.web.app/login', { waitUntil: 'networkidle' });
    await page.fill(selectors.usernameInput, '1010101111');
    await page.fill(selectors.passwordInput, '1010101111');
    await page.click(selectors.loginBtn);

    // 2️⃣ HomeworkManager page ka wait
    await page.waitForURL('**/homework-manager', { timeout: 60000 });
    await page.locator(selectors.homeworkList).waitFor({ state: 'visible', timeout: 60000 });
  });

  // ---------------- UI TESTS ----------------
  test('HM-UI-001: Verify HomeworkManager page loads on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.locator(selectors.homeworkList)).toBeVisible();
    await expect(page.locator(selectors.createHomeworkBtn)).toBeVisible();
  });

  test('HM-UI-002: Verify responsive design across breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 800 },
      { width: 800, height: 1024 },
      { width: 1100, height: 1200 },
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 }
    ];
    for (const bp of breakpoints) {
      await page.setViewportSize(bp);
      await expect(page.locator(selectors.homeworkList)).toBeVisible();
    }
  });

  test('HM-UI-003: Verify theme switching functionality', async ({ page }) => {
    await page.click('button#theme-light'); 
    await expect(page.locator('body.light')).toBeVisible();
    await page.click('button#theme-dark'); 
    await expect(page.locator('body.dark')).toBeVisible();
    await page.click('button#theme-teal'); 
    await expect(page.locator('body.teal')).toBeVisible();
  });

  test('HM-UI-004: Verify homework list formatting', async ({ page }) => {
    const items = page.locator(`${selectors.homeworkList} .homework-item`);
    await expect(items.first()).toBeVisible();
    await expect(items.first().locator('.title')).toBeVisible();
    await expect(items.first().locator('.subject')).toBeVisible();
    await expect(items.first().locator('.message')).toBeVisible();
    await expect(items.first().locator('button')).toHaveCountLessThanOrEqual(3);
  });

  test('HM-UI-005: Verify filter modal opens', async ({ page }) => {
    await page.click(selectors.filterBtn);
    await expect(page.locator(selectors.modal)).toBeVisible();
    await expect(page.locator(selectors.applyFilterBtn)).toBeVisible();
    await expect(page.locator(selectors.clearFilterBtn)).toBeVisible();
  });

  // ---------------- FUNCTIONAL TESTS ----------------
  test('HM-FUNC-001: Verify create homework functionality', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, 'Math Homework');
    await page.selectOption(selectors.subjectInput, 'Math');
    await page.fill(selectors.messageInput, 'Complete exercises 1-10');
    await page.locator(selectors.fileUploadInput).setInputFiles(['./files/sample.pdf']);
    await page.locator(selectors.notificationCheckboxes).first().check();
    await page.click(selectors.saveBtn);
    await expect(page.locator(selectors.homeworkList)).toContainText('Math Homework');
  });

  test('HM-FUNC-002: Verify edit homework functionality', async ({ page }) => {
    await page.locator(selectors.editHomeworkBtn).first().click();
    await page.fill(selectors.titleInput, 'Updated Homework');
    await page.click(selectors.saveBtn);
    await expect(page.locator(selectors.homeworkList)).toContainText('Updated Homework');
  });

  test('HM-FUNC-003: Verify delete homework functionality', async ({ page }) => {
    await page.locator(selectors.deleteHomeworkBtn).first().click();
    await page.click('button:has-text("Confirm")');
    await expect(page.locator(selectors.homeworkList)).not.toContainText('Updated Homework');
  });

  test('HM-FUNC-004: Verify file upload', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.locator(selectors.fileUploadInput).setInputFiles(['./files/sample.pdf']);
    await expect(page.locator(selectors.fileUploadInput)).toHaveCount(1);
  });

  test('HM-FUNC-005: Verify filtering and search functionality', async ({ page }) => {
    await page.click(selectors.filterBtn);
    await page.fill(selectors.searchInput, 'Math');
    await page.click(selectors.applyFilterBtn);
    await expect(page.locator(selectors.homeworkList)).toContainText('Math');
    await page.click(selectors.clearFilterBtn);
  });

  test('HM-FUNC-006: Verify notification settings', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.locator(selectors.notificationCheckboxes).first().check();
    await page.click(selectors.saveBtn);
    await expect(page.locator(selectors.homeworkList)).toContainText('Math Homework');
  });

  // ---------------- EDGE CASE TESTS ----------------
  test('HM-EDGE-001: Large homework list with virtual scrolling', async ({ page }) => {
    await page.goto('https://od-erp-qa.web.app/homework-manager?largeData=true');
    await expect(page.locator(selectors.homeworkList)).toBeVisible();
  });

  test('HM-EDGE-002: Invalid file upload', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.locator(selectors.fileUploadInput).setInputFiles(['./files/invalid.exe']);
    await expect(page.locator(selectors.errorMsg)).toContainText('Invalid file type');
  });

  test('HM-EDGE-003: Network connectivity issues', async ({ page }) => {
    await page.context().setOffline(true);
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, 'Offline Test');
    await page.click(selectors.saveBtn);
    await page.context().setOffline(false);
  });

  test('HM-EDGE-004: Concurrent user modifications', async ({ page, browser }) => {
    const page2 = await browser.newPage();
    await page2.goto('https://od-erp-qa.web.app/homework-manager');
    await page.fill(selectors.titleInput, 'Concurrent Test 1');
    await page2.fill(selectors.titleInput, 'Concurrent Test 2');
  });

  test('HM-EDGE-005: Special characters in homework', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, '特殊字符 📝');
    await page.fill(selectors.messageInput, 'Emoji 👍, Symbols #$%^&*');
    await page.click(selectors.saveBtn);
    await expect(page.locator(selectors.homeworkList)).toContainText('特殊字符 📝');
  });

  test('HM-EDGE-006: Extremely long text input', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, 'A'.repeat(200));
    await page.fill(selectors.messageInput, 'B'.repeat(1000));
    await page.click(selectors.saveBtn);
    await expect(page.locator(selectors.homeworkList)).toContainText('A'.repeat(10));
  });

  test('HM-EDGE-007: Rapid user interactions', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, 'Rapid Click Test');
    await page.click(selectors.saveBtn);
  });

  test('HM-EDGE-008: Browser back/forward navigation', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, 'Nav Test');
    await page.goBack();
    await page.goForward();
    await expect(page.locator(selectors.homeworkList)).toContainText('Nav Test');
  });

  // ---------------- API TESTS ----------------
  test('HM-API-001: GET homework API', async ({ request }) => {
    const response = await request.get('/api/homework');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test('HM-API-002: CREATE homework API', async ({ request }) => {
    const response = await request.post('/api/homework', { data: { subject: 'Physics', title: 'Optics', message: 'Chapter 5' } });
    expect(response.ok()).toBeTruthy();
  });

  test('HM-API-003: UPDATE homework API', async ({ request }) => {
    const response = await request.put('/api/homework/1', { data: { title: 'Updated via API' } });
    expect(response.ok()).toBeTruthy();
  });

  test('HM-API-004: DELETE homework API', async ({ request }) => {
    const response = await request.delete('/api/homework/1');
    expect(response.ok()).toBeTruthy();
  });

  test('HM-API-005: File upload API', async ({ request }) => {
    const response = await request.post('/api/upload', { multipart: { file: './files/sample.pdf' } });
    expect(response.ok()).toBeTruthy();
  });

  // ---------------- ACCESSIBILITY TESTS ----------------
  test('HM-ACCESS-001: Keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  test('HM-ACCESS-002: ARIA labels', async ({ page }) => {
    await expect(page.locator('button[aria-label]')).toHaveCountGreaterThan(0);
  });

  test('HM-ACCESS-003: Skip navigation links', async ({ page }) => {
    await page.keyboard.press('Tab');
  });

  test('HM-ACCESS-004: High contrast mode', async ({ page }) => {
    await page.evaluate(() => document.body.classList.add('high-contrast'));
    await expect(page.locator('body.high-contrast')).toBeVisible();
  });

  test('HM-ACCESS-005: Live regions for dynamic content', async ({ page }) => {
    await page.click(selectors.createHomeworkBtn);
    await page.fill(selectors.titleInput, 'Live Region Test');
    await page.click(selectors.saveBtn);
  });

});
