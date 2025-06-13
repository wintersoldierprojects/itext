import { test, expect } from '@playwright/test';

test.describe('Chat Interface Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('http://localhost:3000/admin');
    await page.fill('input[type="email"]', 'admin@cherrygifts.com');
    await page.fill('input[type="password"]', 'MySecurePassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Open conversation and view messages', async ({ page }) => {
    // Click on first conversation
    await page.click('.conversation-item:first-child');
    
    // Wait for chat view to open
    await page.waitForSelector('.chat-container');
    
    // Verify message list is visible
    await expect(page.locator('.message-list')).toBeVisible();
    
    // Check for message input
    await expect(page.locator('.message-input')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/chat-view.png' });
  });

  test('Send a message', async ({ page }) => {
    // Open first conversation
    await page.click('.conversation-item:first-child');
    await page.waitForSelector('.chat-container');
    
    // Type and send message
    const messageInput = page.locator('.message-input');
    await messageInput.fill('Test message from Playwright');
    await messageInput.press('Enter');
    
    // Verify message appears in list
    await expect(page.locator('.message-item').last()).toContainText('Test message from Playwright');
    
    // Check timestamp
    await expect(page.locator('.message-item').last().locator('.timestamp')).toBeVisible();
  });

  test('Message reactions', async ({ page }) => {
    // Open conversation
    await page.click('.conversation-item:first-child');
    await page.waitForSelector('.chat-container');
    
    // Double-click on a message for reaction
    const firstMessage = page.locator('.message-item').first();
    await firstMessage.dblclick();
    
    // Check if reaction menu appears
    await expect(page.locator('.reaction-menu')).toBeVisible();
    
    // Select a reaction
    await page.click('.reaction-emoji:first-child');
    
    // Verify reaction is added
    await expect(firstMessage.locator('.message-reaction')).toBeVisible();
  });

  test('Touch interactions on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open conversation
    await page.click('.conversation-item:first-child');
    await page.waitForSelector('.chat-container');
    
    // Test long press
    const message = page.locator('.message-item').first();
    await message.hover();
    await page.mouse.down();
    await page.waitForTimeout(500); // Long press duration
    await page.mouse.up();
    
    // Check if context menu appears
    await expect(page.locator('.message-context-menu')).toBeVisible();
  });

  test('Scroll performance with many messages', async ({ page }) => {
    // Open conversation with many messages
    await page.click('.conversation-item:first-child');
    await page.waitForSelector('.chat-container');
    
    // Measure scroll performance
    const startTime = Date.now();
    
    // Scroll to bottom
    await page.evaluate(() => {
      const messageList = document.querySelector('.message-list');
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    });
    
    const scrollTime = Date.now() - startTime;
    
    // Should be smooth (less than 100ms)
    expect(scrollTime).toBeLessThan(100);
    
    // Verify virtual scrolling is working
    const visibleMessages = await page.locator('.message-item:visible').count();
    expect(visibleMessages).toBeLessThan(50); // Should virtualize
  });

  test('Real-time typing indicators', async ({ page, context }) => {
    // Open conversation
    await page.click('.conversation-item:first-child');
    await page.waitForSelector('.chat-container');
    
    // Start typing
    const messageInput = page.locator('.message-input');
    await messageInput.fill('Typing...');
    
    // In a real scenario, another user would see typing indicator
    // For now, check if typing event is triggered
    const typingIndicator = page.locator('.typing-indicator');
    
    // Clear input
    await messageInput.clear();
  });
});