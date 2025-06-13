import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 1 second
    expect(loadTime).toBeLessThan(1000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp = 0;
        let lcp = 0;
        
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          fcp = entries[0].startTime;
        }).observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          lcp = entries[entries.length - 1].startTime;
          resolve({ fcp, lcp });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout fallback
        setTimeout(() => resolve({ fcp, lcp }), 5000);
      });
    });
    
    // Performance targets
    expect(metrics.fcp).toBeLessThan(1500); // FCP < 1.5s
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
  });

  test('Animation performance', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    await page.fill('input[type="email"]', 'admin@cherrygifts.com');
    await page.fill('input[type="password"]', 'MySecurePassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    
    // Open conversation to trigger animations
    await page.click('.conversation-item:first-child');
    
    // Measure frame rate during animation
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frames);
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    // Should maintain 60fps
    expect(fps).toBeGreaterThan(55);
  });

  test('Memory usage', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Perform actions
    await page.fill('input[type="email"]', 'admin@cherrygifts.com');
    await page.fill('input[type="password"]', 'MySecurePassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    
    // Open and close conversations multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('.conversation-item:first-child');
      await page.waitForSelector('.chat-container');
      await page.click('.back-button');
      await page.waitForSelector('.conversation-list');
    }
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Memory increase should be minimal (less than 10MB)
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
    expect(memoryIncrease).toBeLessThan(10);
  });

  test('Network performance', async ({ page }) => {
    const requests: any[] = [];
    
    // Monitor network requests
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now()
      });
    });
    
    page.on('response', (response) => {
      const request = requests.find(r => r.url === response.url());
      if (request) {
        request.duration = Date.now() - request.startTime;
        request.status = response.status();
      }
    });
    
    // Load page
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Check API response times
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    
    for (const request of apiRequests) {
      // API calls should be fast (< 100ms)
      expect(request.duration).toBeLessThan(100);
      // Should be successful
      expect(request.status).toBe(200);
    }
  });

  test('Bundle size check', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        const size = response.headers()['content-length'];
        resources.push({
          url: response.url(),
          size: parseInt(size || '0')
        });
      }
    });
    
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Calculate total bundle size
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const totalSizeMB = totalSize / 1024 / 1024;
    
    // Bundle should be under 500KB
    expect(totalSizeMB).toBeLessThan(0.5);
  });
});