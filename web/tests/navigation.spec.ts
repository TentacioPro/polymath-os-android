import { test, expect } from '@playwright/test';

/**
 * Polymath OS Web - Navigation Regression Tests
 * 
 * Tests for AppSidebar, TopHeader, BottomNav, and Drawer components
 * Run: npx playwright test tests/navigation.spec.ts --reporter=list
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════════════════════
// DESKTOP SIDEBAR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Desktop Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Desktop viewport >= 768px (md breakpoint)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Sidebar renders on desktop with all expected nav links', async ({ page }) => {
    // Sidebar should be visible (aside element with hidden md:flex)
    const sidebar = page.locator('aside').filter({ has: page.locator('text=Polymath OS') }).first();
    await expect(sidebar).toBeVisible();

    // Check main navigation links
    const navLinks = [
      'Dashboard',
      'Knowledge',
      'Neural Mesh',
      'Journal',
      'Chat',
    ];
    
    for (const label of navLinks) {
      await expect(page.locator(`aside a:has-text("${label}")`).first()).toBeVisible();
    }

    // Check tool links
    const toolLinks = [
      'Search',
      'Analytics',
      'Agent Memory',
      'Integrations',
      'Export',
      'Customize',
      'Settings',
    ];
    
    for (const label of toolLinks) {
      await expect(page.locator(`aside a:has-text("${label}")`).first()).toBeVisible();
    }
  });

  test('Sidebar navigation links work correctly', async ({ page }) => {
    // Test clicking Dashboard (home)
    await page.locator('aside a:has-text("Dashboard")').first().click();
    await page.waitForURL('**/');
    expect(page.url()).toBe(`${BASE_URL}/`);

    // Test clicking Knowledge (activities)
    await page.locator('aside a:has-text("Knowledge")').first().click();
    await page.waitForURL('**/activities');
    expect(page.url()).toContain('/activities');

    // Test clicking Neural Mesh (connections)
    await page.locator('aside a:has-text("Neural Mesh")').first().click();
    await page.waitForURL('**/connections');
    expect(page.url()).toContain('/connections');

    // Test clicking Journal
    await page.locator('aside a:has-text("Journal")').first().click();
    await page.waitForURL('**/journal');
    expect(page.url()).toContain('/journal');

    // Test clicking Chat
    await page.locator('aside a:has-text("Chat")').first().click();
    await page.waitForURL('**/chat');
    expect(page.url()).toContain('/chat');

    // Test clicking Export
    await page.locator('aside a:has-text("Export")').first().click();
    await page.waitForURL('**/export');
    expect(page.url()).toContain('/export');

    // Test clicking Customize
    await page.locator('aside a:has-text("Customize")').first().click();
    await page.waitForURL('**/customize');
    expect(page.url()).toContain('/customize');
  });

  test('Sidebar collapse button works', async ({ page }) => {
    // Find the collapse button (chevron_left icon)
    const collapseButton = page.locator('aside button').filter({ has: page.locator('span.material-symbols-outlined:has-text("chevron_left")') }).first();
    
    // Get initial sidebar width
    const sidebar = page.locator('aside').first();
    const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    
    // Click collapse button
    await collapseButton.click();
    await page.waitForTimeout(300); // Wait for transition
    
    // Sidebar should be narrower
    const collapsedWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(collapsedWidth).toBeLessThan(initialWidth);
    
    // Expand button should now show chevron_right
    const expandButton = page.locator('aside button').filter({ has: page.locator('span.material-symbols-outlined:has-text("chevron_right")') }).first();
    await expect(expandButton).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE NAVIGATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mobile viewport < 768px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Bottom nav renders on mobile with correct items', async ({ page }) => {
    // Bottom nav container (floating pill at bottom)
    const bottomNav = page.locator('div.fixed.bottom-5');
    await expect(bottomNav).toBeVisible();

    // Check nav items
    const navItems = ['Home', 'Mesh', 'Search', 'Journal'];
    for (const label of navItems) {
      // Labels only show for active items, so check for icons
      await expect(bottomNav.locator('a').filter({ has: page.locator('span.material-symbols-outlined') })).toHaveCount(5); // 4 nav + capture
    }

    // Check for Capture button
    await expect(bottomNav.locator('a:has-text("Capture")')).toBeVisible();
  });

  test('Top header renders on mobile with hamburger menu', async ({ page }) => {
    // Top header should be visible
    const header = page.locator('header.fixed.top-0');
    await expect(header).toBeVisible();

    // Hamburger button should be visible
    const hamburgerButton = header.locator('button').filter({ has: page.locator('span.material-symbols-outlined:has-text("menu")') });
    await expect(hamburgerButton).toBeVisible();
  });

  test('Bottom nav navigation works', async ({ page }) => {
    const bottomNav = page.locator('div.fixed.bottom-5');
    
    // Click on Mesh (connections)
    await bottomNav.locator('a').filter({ has: page.locator('span.material-symbols-outlined:has-text("hub")') }).click();
    await page.waitForURL('**/connections');
    expect(page.url()).toContain('/connections');

    // Click on Search
    await bottomNav.locator('a').filter({ has: page.locator('span.material-symbols-outlined:has-text("search")') }).click();
    await page.waitForURL('**/search');
    expect(page.url()).toContain('/search');

    // Click on Journal
    await bottomNav.locator('a').filter({ has: page.locator('span.material-symbols-outlined:has-text("edit_note")') }).click();
    await page.waitForURL('**/journal');
    expect(page.url()).toContain('/journal');

    // Click on Capture (chat)
    await bottomNav.locator('a:has-text("Capture")').click();
    await page.waitForURL('**/chat');
    expect(page.url()).toContain('/chat');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DRAWER TESTS (MOBILE)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Mobile Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Drawer opens when hamburger button is clicked', async ({ page }) => {
    // Click hamburger button
    const hamburgerButton = page.locator('header button').filter({ has: page.locator('span.material-symbols-outlined:has-text("menu")') });
    await hamburgerButton.click();

    // Drawer should appear
    const drawer = page.locator('div.fixed.inset-0.z-\\[60\\]');
    await expect(drawer).toBeVisible();

    // Drawer should show nav links
    await expect(drawer.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(drawer.locator('a:has-text("Knowledge")')).toBeVisible();
    await expect(drawer.locator('a:has-text("Neural Mesh")')).toBeVisible();
    await expect(drawer.locator('a:has-text("Journal")')).toBeVisible();
    await expect(drawer.locator('a:has-text("Chat")')).toBeVisible();
  });

  test('Drawer closes when close button is clicked', async ({ page }) => {
    // Open drawer
    const hamburgerButton = page.locator('header button').filter({ has: page.locator('span.material-symbols-outlined:has-text("menu")') });
    await hamburgerButton.click();

    const drawer = page.locator('div.fixed.inset-0.z-\\[60\\]');
    await expect(drawer).toBeVisible();

    // Click close button
    const closeButton = drawer.locator('button').filter({ has: page.locator('span.material-symbols-outlined:has-text("close")') });
    await closeButton.click();

    // Drawer should be hidden
    await expect(drawer).not.toBeVisible();
  });

  test('Drawer closes when backdrop is clicked', async ({ page }) => {
    // Open drawer
    const hamburgerButton = page.locator('header button').filter({ has: page.locator('span.material-symbols-outlined:has-text("menu")') });
    await hamburgerButton.click();

    const drawer = page.locator('div.fixed.inset-0.z-\\[60\\]');
    await expect(drawer).toBeVisible();

    // Click on scrim/backdrop (the outer div)
    await drawer.click({ position: { x: 350, y: 300 } }); // Click outside the drawer panel

    // Drawer should be hidden
    await expect(drawer).not.toBeVisible();
  });

  test('Drawer navigation links work and drawer closes after navigation', async ({ page }) => {
    // Open drawer
    const hamburgerButton = page.locator('header button').filter({ has: page.locator('span.material-symbols-outlined:has-text("menu")') });
    await hamburgerButton.click();

    const drawer = page.locator('div.fixed.inset-0.z-\\[60\\]');
    await expect(drawer).toBeVisible();

    // Click on Journal link
    await drawer.locator('a:has-text("Journal")').click();
    await page.waitForURL('**/journal');
    expect(page.url()).toContain('/journal');

    // Drawer should close after navigation
    await expect(drawer).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// THEME CSS VARIABLES TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Theme CSS Variables', () => {
  test('M3 CSS custom properties are defined on document root', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Check that --m3-* CSS variables are defined and non-empty
    const cssVariables = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        surface: style.getPropertyValue('--m3-surface').trim(),
        primary: style.getPropertyValue('--m3-primary').trim(),
        onSurface: style.getPropertyValue('--m3-on-surface').trim(),
        primaryContainer: style.getPropertyValue('--m3-primary-container').trim(),
        onPrimaryContainer: style.getPropertyValue('--m3-on-primary-container').trim(),
        surfaceContainer: style.getPropertyValue('--m3-surface-container').trim(),
        outlineVariant: style.getPropertyValue('--m3-outline-variant').trim(),
      };
    });

    expect(cssVariables.surface).not.toBe('');
    expect(cssVariables.primary).not.toBe('');
    expect(cssVariables.onSurface).not.toBe('');
    expect(cssVariables.primaryContainer).not.toBe('');
    expect(cssVariables.onPrimaryContainer).not.toBe('');
    expect(cssVariables.surfaceContainer).not.toBe('');
    expect(cssVariables.outlineVariant).not.toBe('');
  });

  test('Theme class is applied to HTML element', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // HTML element should have theme class
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toMatch(/theme-/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSIVE BREAKPOINTS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Responsive Breakpoints', () => {
  test('Mobile (375px): shows bottom nav and top header, hides sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Bottom nav should be visible
    const bottomNav = page.locator('div.fixed.bottom-5');
    await expect(bottomNav).toBeVisible();

    // Top header should be visible
    const topHeader = page.locator('header.fixed.top-0');
    await expect(topHeader).toBeVisible();

    // Sidebar should NOT be visible (hidden on mobile via md:flex)
    const sidebar = page.locator('aside.hidden.md\\:flex');
    await expect(sidebar).not.toBeVisible();
  });

  test('Tablet (768px): shows sidebar, hides mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Sidebar should be visible (md:flex kicks in at 768px)
    const sidebar = page.locator('aside.hidden.md\\:flex');
    await expect(sidebar).toBeVisible();

    // Bottom nav should NOT be visible (md:hidden hides at 768px+)
    const bottomNav = page.locator('div.fixed.bottom-5');
    await expect(bottomNav).not.toBeVisible();

    // Top header should NOT be visible
    const topHeader = page.locator('header.fixed.top-0');
    await expect(topHeader).not.toBeVisible();
  });

  test('Desktop (1280px): shows sidebar, hides mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Sidebar should be visible
    const sidebar = page.locator('aside.hidden.md\\:flex');
    await expect(sidebar).toBeVisible();

    // Bottom nav should NOT be visible
    const bottomNav = page.locator('div.fixed.bottom-5');
    await expect(bottomNav).not.toBeVisible();

    // Top header should NOT be visible
    const topHeader = page.locator('header.fixed.top-0');
    await expect(topHeader).not.toBeVisible();
  });

  test('Navigation adapts when viewport changes from mobile to desktop', async ({ page }) => {
    // Start with mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');

    // Verify mobile nav is visible
    await expect(page.locator('div.fixed.bottom-5')).toBeVisible();
    await expect(page.locator('aside.hidden.md\\:flex')).not.toBeVisible();

    // Switch to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(100); // Allow CSS to update

    // Verify desktop nav is visible
    await expect(page.locator('aside.hidden.md\\:flex')).toBeVisible();
    await expect(page.locator('div.fixed.bottom-5')).not.toBeVisible();
  });
});
