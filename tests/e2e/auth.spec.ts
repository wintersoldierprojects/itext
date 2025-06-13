import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies();
  });

  test('Admin login flow', async ({ page }) => {
    // Navigate to admin page
    await page.goto('http://localhost:3000/admin');
    
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@cherrygifts.com');
    await page.fill('input[type="password"]', 'MySecurePassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // Verify dashboard loaded with conversations
    await expect(page.locator('.conversation-list')).toBeVisible();
    await expect(page.locator('.conversation-item')).toHaveCount(5); // 5 mock conversations
    
    // Take screenshot for validation
    await page.screenshot({ path: 'test-results/admin-dashboard.png' });
  });

  test('User login flow', async ({ page }) => {
    // Navigate to users page
    await page.goto('http://localhost:3000/users');
    
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible();
    
    // Fill in credentials with correct English selectors
    await page.fill('input[placeholder="Instagram Username"]', 'mehradworld');
    await page.fill('input[placeholder="6-digit PIN"]', '1122');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard (updated route)
    await page.waitForURL('**/users/dashboard', { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.locator('.conversation-list')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/user-dashboard.png' });
  });

  test('Session persistence', async ({ page, context }) => {
    // Login as admin
    await page.goto('http://localhost:3000/admin');
    await page.fill('input[type="email"]', 'admin@cherrygifts.com');
    await page.fill('input[type="password"]', 'MySecurePassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    
    // Get cookies
    const cookies = await context.cookies();
    
    // Create new page in same context
    const newPage = await context.newPage();
    await newPage.goto('http://localhost:3000/admin/dashboard');
    
    // Should be logged in without login form
    await expect(newPage.locator('.conversation-list')).toBeVisible();
    
    // Close pages
    await newPage.close();
  });

  test('Protected route access', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('http://localhost:3000/admin/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/admin$/);
    await expect(page.locator('form')).toBeVisible();
  });
});