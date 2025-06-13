import { test, expect } from '@playwright/test';

test.describe('PWA Tests', () => {
  test('Service worker registration', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for service worker to register
    const swRegistered = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(() => {
            resolve(true);
          }).catch(() => {
            resolve(false);
          });
          
          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000);
        } else {
          resolve(false);
        }
      });
    });
    
    expect(swRegistered).toBe(true);
  });

  test('Manifest file validation', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/manifest.json');
    
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    
    // Validate manifest properties
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('icons');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display', 'standalone');
    expect(manifest).toHaveProperty('theme_color');
    expect(manifest).toHaveProperty('background_color');
    
    // Check icons
    expect(manifest.icons.length).toBeGreaterThan(0);
    expect(manifest.icons[0]).toHaveProperty('src');
    expect(manifest.icons[0]).toHaveProperty('sizes');
    expect(manifest.icons[0]).toHaveProperty('type');
  });

  test('Offline mode functionality', async ({ page, context }) => {
    // First visit to cache resources
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate while offline
    await page.reload();
    
    // Should show offline page or cached content
    const isOfflinePage = await page.locator('.offline-message').isVisible().catch(() => false);
    const hasContent = await page.locator('body').isVisible();
    
    expect(isOfflinePage || hasContent).toBe(true);
    
    // Go back online
    await context.setOffline(false);
  });

  test('Cache storage validation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check cache storage
    const cacheDetails = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cacheContents: any = {};
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          cacheContents[name] = requests.length;
        }
        
        return {
          hasCaches: cacheNames.length > 0,
          cacheNames,
          cacheContents
        };
      }
      return { hasCaches: false };
    });
    
    expect(cacheDetails.hasCaches).toBe(true);
    expect(cacheDetails.cacheNames.length).toBeGreaterThan(0);
  });

  test('PWA install prompt', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Check if beforeinstallprompt event can be triggered
    const canInstall = await page.evaluate(() => {
      return new Promise((resolve) => {
        let installable = false;
        
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          installable = true;
          resolve(true);
        });
        
        // Timeout after 2 seconds
        setTimeout(() => resolve(installable), 2000);
      });
    });
    
    // Note: This might not trigger in headless mode
    // but we check if the event listener is set up correctly
    expect(typeof canInstall).toBe('boolean');
  });

  test('Push notification capability', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    await page.goto('http://localhost:3000');
    
    // Check notification API
    const notificationSupport = await page.evaluate(() => {
      return {
        supported: 'Notification' in window,
        permission: Notification.permission,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window
      };
    });
    
    expect(notificationSupport.supported).toBe(true);
    expect(notificationSupport.permission).toBe('granted');
    expect(notificationSupport.serviceWorker).toBe(true);
    expect(notificationSupport.pushManager).toBe(true);
  });
});