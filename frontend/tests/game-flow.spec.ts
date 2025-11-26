import { test, expect } from '@playwright/test';

test.describe('KubeChaos Game Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the homepage with correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/KubeChaos/);
        await expect(page.getByText('KubeChaos: Cluster Under Siege')).toBeVisible();
    });

    test('should start and stop the game', async ({ page }) => {
        // Check initial status - use exact match to avoid multiple matches
        await expect(page.locator('text="STOPPED"').first()).toBeVisible();

        // Start Game
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();

        // Wait for game to start - use exact match
        await expect(page.locator('text="RUNNING"').first()).toBeVisible({ timeout: 10000 });

        // Stop Game
        await page.getByRole('button', { name: /Stop Game/i }).click();
        await expect(page.locator('text="STOPPED"').first()).toBeVisible();
    });

    test('should execute terminal commands', async ({ page }) => {
        // Start Game
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        // Type 'help'
        const terminalInput = page.locator('input[type="text"]').first();
        await terminalInput.fill('help');
        await terminalInput.press('Enter');

        // Check output
        await expect(page.getByText('Available commands:')).toBeVisible();

        // Type 'kubectl get pods'
        await terminalInput.fill('kubectl get pods');
        await terminalInput.press('Enter');

        // Check output - use first() to avoid strict mode violation
        await expect(page.getByText('NAME').first()).toBeVisible();
    });

    test('should display dashboard with resources', async ({ page }) => {
        // Start Game
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        // Check dashboard sections are visible using role selectors
        await expect(page.getByText('Cluster Dashboard')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Pods' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Deployments' })).toBeVisible();
    });

    test('should show terminal welcome message', async ({ page }) => {
        await expect(page.getByText('Welcome to KubeChaos v1.0.0')).toBeVisible();
        await expect(page.getByText('System status:')).toBeVisible();
        await expect(page.getByText('ONLINE')).toBeVisible();
    });

    test('should have game controls visible', async ({ page }) => {
        await expect(page.getByText('Game Controls')).toBeVisible();
        await expect(page.getByText('Game Status')).toBeVisible();
        await expect(page.getByText('Quick Actions')).toBeVisible();
    });

    // New tests for e-commerce cluster
    test('should list namespaces', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        const terminalInput = page.locator('input[type="text"]').first();
        await terminalInput.fill('kubectl get namespaces');
        await terminalInput.press('Enter');
        await page.waitForTimeout(500);

        // Check for e-commerce namespaces in terminal output
        const terminalContent = page.locator('.custom-scrollbar').first();
        await expect(terminalContent).toContainText('production');
        await expect(terminalContent).toContainText('data');
    });

    test('should filter pods by namespace', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        const terminalInput = page.locator('input[type="text"]').first();

        // Get production namespace pods
        await terminalInput.fill('kubectl get pods -n production');
        await terminalInput.press('Enter');
        await expect(page.getByText('web-frontend').first()).toBeVisible();

        // Get data namespace pods
        await terminalInput.fill('kubectl get pods -n data');
        await terminalInput.press('Enter');
        await expect(page.getByText('postgres-primary').first()).toBeVisible();
    });

    test('should show all namespaces with --all-namespaces flag', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        const terminalInput = page.locator('input[type="text"]').first();
        await terminalInput.fill('kubectl get pods --all-namespaces');
        await terminalInput.press('Enter');

        // Check for NAMESPACE column
        await expect(page.getByText('NAMESPACE').first()).toBeVisible();
    });

    test('should display e-commerce pods in dashboard', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        // Check for e-commerce service names
        await expect(page.getByText('web-frontend').first()).toBeVisible();
        await expect(page.getByText('api-gateway').first()).toBeVisible();
        await expect(page.getByText('product-service').first()).toBeVisible();
    });

    test('should have namespace filter in dashboard', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        // Check for namespace filter dropdown
        const namespaceFilter = page.locator('select');
        await expect(namespaceFilter).toBeVisible();

        // Check that the select has the expected options by checking the select value
        await expect(namespaceFilter).toHaveValue('all');
    });

    test('should filter dashboard resources by namespace', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(1000);

        // Select production namespace
        const namespaceFilter = page.locator('select');
        await namespaceFilter.selectOption('production');

        // Should see production pods
        await expect(page.getByText('web-frontend').first()).toBeVisible();

        // Select data namespace
        await namespaceFilter.selectOption('data');

        // Should see data pods
        await expect(page.getByText('postgres-primary').first()).toBeVisible();
    });

    test('should display namespace badges on resources', async ({ page }) => {
        await page.getByRole('button', { name: /Start Chaos Game/i }).click();
        await page.waitForTimeout(2000);

        // Check for namespace badges in the dashboard resource cards
        // Look for badges specifically within the resource cards
        const podCard = page.locator('h3:has-text("Pods")').locator('..');
        await expect(podCard).toContainText('production');
    });
});
