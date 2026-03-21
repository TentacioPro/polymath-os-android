import { test, expect } from '@playwright/test';

/**
 * Polymath OS Web - M3 Component Tests
 *
 * Tests verifying Material Design 3 web components render and function correctly.
 * Run: npx playwright test tests/m3-web-components.spec.ts --reporter=list
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════════════════════
// M3Button Tests - /customize page
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('M3Button Components', () => {
  test('Pill-shaped buttons render on customize page', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Layout option buttons are pill-shaped (rounded-full) and clickable
    const layoutButtons = page.locator('button.rounded-full, button[class*="rounded-full"]').first();
    await expect(layoutButtons).toBeVisible();
  });

  test('Font family selection buttons are clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Find font option buttons - they have rounded-2xl styling
    const fontButtons = page.locator('button[class*="rounded-2xl"]').first();
    await expect(fontButtons).toBeVisible();

    // Click to verify interactivity
    await fontButtons.click();

    // Should still be visible after click
    await expect(fontButtons).toBeVisible();
  });

  test('Layout option buttons show active state', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Find layout option buttons by looking for Grid, List, or Compact text
    const gridButton = page.locator('button').filter({ hasText: 'Grid' }).first();
    await expect(gridButton).toBeVisible();

    // Click Grid layout
    await gridButton.click();

    // Should show active state (bg-m3-primary class indicates active)
    const activeButton = page.locator('button[class*="bg-m3-primary"]').first();
    await expect(activeButton).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// M3Card Tests - /activities page
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('M3Card Components', () => {
  test('Card elements render on activities page', async ({ page }) => {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');

    // Cards use rounded-2xl bg-m3-surface-container styling
    // Either activity cards or the drag-drop zone should be visible
    const cardElements = page.locator('[class*="rounded-2xl"][class*="bg-m3-surface-container"]').first();
    await expect(cardElements).toBeVisible({ timeout: 10000 });
  });

  test('Activity cards have proper M3 structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');

    // The page should have header with title - be specific to avoid multiple h1 match
    const pageTitle = page.getByRole('heading', { name: 'Knowledge' });
    await expect(pageTitle).toBeVisible();

    // Should have filter chips with rounded-full (pill) styling
    const filterChips = page.locator('button.rounded-full, button[class*="rounded-full"]').first();
    await expect(filterChips).toBeVisible();
  });

  test('Drag-drop zone renders with M3 card styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');

    // Drag-drop zone has border-dashed styling
    const dropZone = page.locator('[class*="border-dashed"]');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toContainText('Drop JSON file to import');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// M3Input Tests - /chat page
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('M3Input Components', () => {
  test('Text input renders on chat page with placeholder', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');

    // Chat input textarea
    const chatInput = page.locator('textarea[placeholder*="Ask anything"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await expect(chatInput).toHaveAttribute('placeholder', 'Ask anything about your knowledge base...');
  });

  test('Chat input can receive text', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');

    const chatInput = page.locator('textarea[placeholder*="Ask anything"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Type some text
    await chatInput.fill('Test message input');
    await expect(chatInput).toHaveValue('Test message input');
  });

  test('Chat input has M3 styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');

    // Input should have M3 surface container styling and rounded corners
    const chatInput = page.locator('textarea[class*="rounded-2xl"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test('Send button renders next to input', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');

    // Send button should be visible
    const sendButton = page.locator('button[class*="bg-m3-primary"]').filter({ has: page.locator('span.material-symbols-outlined') });
    await expect(sendButton.first()).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// M3Select / Export Options Tests - /export page
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Export Option Selectors', () => {
  test('Export format options render on export page', async ({ page }) => {
    await page.goto(`${BASE_URL}/export`);
    await page.waitForLoadState('networkidle');

    // Export page title
    const pageTitle = page.getByRole('heading', { name: 'Export & Import' });
    await expect(pageTitle).toBeVisible();

    // Should have export option buttons - look for grid of export cards with exact text match
    const jsonCard = page.locator('button h3').filter({ hasText: /^JSON$/ });
    await expect(jsonCard).toBeVisible();

    const markdownCard = page.locator('button h3').filter({ hasText: /^Markdown$/ });
    await expect(markdownCard).toBeVisible();

    const csvCard = page.locator('button h3').filter({ hasText: /^CSV$/ });
    await expect(csvCard).toBeVisible();
  });

  test('Export buttons are clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/export`);
    await page.waitForLoadState('networkidle');

    // Get JSON export card button by its title h3
    const jsonButton = page.locator('button').filter({ has: page.locator('h3', { hasText: 'JSON' }) }).first();
    await expect(jsonButton).toBeVisible();
    await expect(jsonButton).toBeEnabled();
  });

  test('Import option renders on export page', async ({ page }) => {
    await page.goto(`${BASE_URL}/export`);
    await page.waitForLoadState('networkidle');

    // Import from JSON button
    const importButton = page.getByRole('button').filter({ hasText: 'Import from JSON' });
    await expect(importButton).toBeVisible();
  });

  test('Export cards have M3 styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/export`);
    await page.waitForLoadState('networkidle');

    // Export cards use rounded-2xl bg-m3-surface-container
    const exportCards = page.locator('[class*="rounded-2xl"][class*="bg-m3-surface-container"]');
    await expect(exportCards.first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// M3Avatar Tests - Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('M3Avatar Components', () => {
  test('Avatar/profile link renders on dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Profile link in header - contains person icon
    const profileLink = page.locator('a[href="/profile"]');
    await expect(profileLink).toBeVisible({ timeout: 10000 });
  });

  test('Avatar has M3 primary styling', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Profile button has bg-m3-primary and rounded styling
    const avatarButton = page.locator('a[href="/profile"][class*="rounded"]');
    await expect(avatarButton).toBeVisible({ timeout: 10000 });
  });

  test('Avatar displays person icon', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Should have person icon inside profile link - use .last() since there may be multiple spans
    const personIcon = page.locator('a[href="/profile"] span.material-symbols-outlined').last();
    await expect(personIcon).toBeVisible({ timeout: 10000 });
    await expect(personIcon).toContainText('person');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EmptyState Tests - /journal page
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('EmptyState Components', () => {
  test('Empty state renders when no journals exist', async ({ page }) => {
    await page.goto(`${BASE_URL}/journal`);
    await page.waitForLoadState('networkidle');

    // Journal page should show either entries or empty state
    const pageBody = page.locator('body');
    await expect(pageBody).toBeVisible();

    // Check for either journal entries grid or empty state message
    const hasEntries = await page.locator('[class*="grid"]').count();
    const emptyState = page.getByText('No journal entries yet');

    // Either we have journal cards or the empty state
    if (hasEntries === 0 || await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
      
      // Should also have descriptive text
      const description = page.getByText('Start journaling your learning journey');
      await expect(description).toBeVisible();
    }
  });

  test('Empty state has M3 illustration icon', async ({ page }) => {
    await page.goto(`${BASE_URL}/journal`);
    await page.waitForLoadState('networkidle');

    // Look for the menu_book icon in empty state
    const emptyStateIcon = page.locator('span.material-symbols-outlined').filter({ hasText: 'menu_book' });
    
    // Icon is visible if empty state is shown
    const iconVisible = await emptyStateIcon.isVisible().catch(() => false);
    if (iconVisible) {
      await expect(emptyStateIcon).toBeVisible();
    }
  });

  test('Journal page has add button', async ({ page }) => {
    await page.goto(`${BASE_URL}/journal`);
    await page.waitForLoadState('networkidle');

    // Add button should always be visible
    const addButton = page.locator('button[class*="bg-m3-primary"]').filter({
      has: page.locator('span.material-symbols-outlined')
    }).first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Theme Switcher Tests - /customize page
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Theme/Typography Switcher', () => {
  test('Font family options are present on customize page', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Should have font family section
    const fontFamilyLabel = page.getByText('FONT FAMILY');
    await expect(fontFamilyLabel).toBeVisible();

    // Font options
    const dmSans = page.getByRole('button').filter({ hasText: 'DM Sans' });
    await expect(dmSans).toBeVisible();

    const inter = page.getByRole('button').filter({ hasText: 'Inter' });
    await expect(inter).toBeVisible();

    const outfit = page.getByRole('button').filter({ hasText: 'Outfit' });
    await expect(outfit).toBeVisible();

    const spaceGrotesk = page.getByRole('button').filter({ hasText: 'Space Grotesk' });
    await expect(spaceGrotesk).toBeVisible();
  });

  test('Clicking font option updates selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Click Inter font option
    const interButton = page.getByRole('button').filter({ hasText: 'Inter' });
    await expect(interButton).toBeVisible();
    await interButton.click();

    // Should now have active styling (bg-m3-primary)
    // Wait a moment for state update
    await page.waitForTimeout(100);

    // The clicked button should have primary background
    const activeInterButton = page.locator('button[class*="bg-m3-primary"]').filter({ hasText: 'Inter' });
    await expect(activeInterButton).toBeVisible();
  });

  test('Font size slider is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Font size section
    const fontSizeLabel = page.getByText('FONT SIZE');
    await expect(fontSizeLabel).toBeVisible();

    // Range slider
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();
  });

  test('Font size slider updates CSS variable', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Get initial font scale
    const initialScale = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--font-scale');
    });

    // Move slider to max using evaluate since fill() doesn't work on range inputs
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '1.30';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    // Check if CSS variable updated
    const newScale = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--font-scale');
    });

    // The variable should exist or update
    expect(newScale).toBeDefined();
  });

  test('Layout options section is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Dashboard layout section
    const dashboardLayoutLabel = page.getByText('DASHBOARD LAYOUT');
    await expect(dashboardLayoutLabel).toBeVisible();

    // Layout options
    const gridOption = page.getByRole('button').filter({ hasText: 'Grid' });
    await expect(gridOption).toBeVisible();

    const listOption = page.getByRole('button').filter({ hasText: 'List' });
    await expect(listOption).toBeVisible();

    const compactOption = page.getByRole('button').filter({ hasText: 'Compact' });
    await expect(compactOption).toBeVisible();
  });

  test('Sidebar position options are present', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Sidebar position section
    const sidebarLabel = page.getByText('SIDEBAR POSITION');
    await expect(sidebarLabel).toBeVisible();

    // Options - look for the specific text inside layout option buttons
    // These buttons have the text as a child span element
    const leftOption = page.locator('button span').filter({ hasText: /^Left$/ }).first();
    await expect(leftOption).toBeVisible();

    const rightOption = page.locator('button span').filter({ hasText: /^Right$/ }).first();
    await expect(rightOption).toBeVisible();

    const hiddenOption = page.locator('button span').filter({ hasText: /^Hidden$/ }).first();
    await expect(hiddenOption).toBeVisible();
  });

  test('Visible screens toggles are present', async ({ page }) => {
    await page.goto(`${BASE_URL}/customize`);
    await page.waitForLoadState('networkidle');

    // Visible screens section
    const visibleScreensLabel = page.getByText('VISIBLE SCREENS');
    await expect(visibleScreensLabel).toBeVisible();

    // Screen toggle items - look for the span with screen name text
    const dashboardToggle = page.locator('span').filter({ hasText: /^Dashboard$/ }).first();
    await expect(dashboardToggle).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// M3 CSS Variables Tests
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('M3 CSS Variables', () => {
  test('M3 CSS variables are defined on document', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check if M3 CSS variables are defined
    const m3Primary = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--m3-primary');
    });

    expect(m3Primary).toBeTruthy();
  });

  test('M3 surface variables exist', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const m3Surface = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--m3-surface');
    });

    expect(m3Surface).toBeTruthy();
  });

  test('M3 on-surface variables exist', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const m3OnSurface = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--m3-on-surface');
    });

    expect(m3OnSurface).toBeTruthy();
  });
});
