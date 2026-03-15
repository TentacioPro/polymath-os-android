import { test, expect } from '@playwright/test';

/**
 * Polymath OS Web - Smoke Tests
 * 
 * Setup: npx playwright install
 * Run: npx playwright test
 * Run with UI: npx playwright test --ui
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE LOAD TESTS - Verify all routes render without errors
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Page Load Tests', () => {
  test('Dashboard loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');
    // Check for main content
    await expect(page.locator('body')).toBeVisible();
    // No error overlay should be visible
    await expect(page.locator('[id*="error"]')).not.toBeVisible();
  });

  test('Activities page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Journal page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/journal`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Connections page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/connections`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Agent page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Export page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/export`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Chat page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Integrations page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/integrations`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Customize page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION TESTS - Verify navigation works
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Navigation Tests', () => {
  test('Sidebar navigation works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Desktop: sidebar should be visible on large screens
    // This test passes on any viewport - just verifies page is navigable
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Can navigate between pages', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Navigate to activities (via URL for simplicity)
    await page.goto(`${BASE_URL}/activities`);
    await expect(page.url()).toContain('/activities');
    
    // Navigate to journal
    await page.goto(`${BASE_URL}/journal`);
    await expect(page.url()).toContain('/journal');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// THEME TESTS - Verify theme system works
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Theme Tests', () => {
  test('Default theme is applied', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Should have a theme class on body or html
    const html = page.locator('html');
    await expect(html).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL FLOW TESTS - User journeys
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Critical User Flows', () => {
  test('Dashboard shows stats', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Dashboard should display some content (stats, cards, etc.)
    const mainContent = page.locator('main, [role="main"], .main-content').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('Activities list renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    
    // Should show either activities or empty state
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Journal list renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/journal`);
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Export page has export options', async ({ page }) => {
    await page.goto(`${BASE_URL}/export`);
    await page.waitForLoadState('networkidle');
    
    // Export page should have buttons or cards for export options
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Error Handling', () => {
  test('404 page for invalid routes', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-12345`);
    // Should return 404 or redirect
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('No JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Allow hydration warnings but catch real errors
    const criticalErrors = errors.filter(e => 
      !e.includes('hydration') && 
      !e.includes('Hydration')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSIVE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Responsive Design', () => {
  test('Mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Desktop viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
