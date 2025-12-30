import { test, expect } from '@playwright/test';

test.describe('IdeaSwipe E2E Suite', () => {

  // Reset storage state before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Authentication Flow: Signup and Login', async ({ page }) => {
    // 1. Initial State -> Auth Page
    await expect(page.getByText('IdeaSwipe')).toBeVisible();
    await expect(page.getByText('Sign In')).toBeVisible();

    // 2. Switch to Sign Up
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();

    // 3. Perform Sign Up
    await page.getByPlaceholder('John Doe').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('test@user.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // 4. Verify Redirect to Feed (Header should be visible)
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Exit')).toBeVisible();

    // 5. Logout
    await page.getByText('Exit').click();
    await expect(page.getByText('Welcome back!')).toBeVisible();

    // 6. Login
    await page.getByPlaceholder('you@example.com').fill('test@user.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('header')).toBeVisible();
  });

  test('Idea Lifecycle: Post, AI Mock Review, View in Feed', async ({ page }) => {
    // Login as new user
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByPlaceholder('John Doe').fill('Creator');
    await page.getByPlaceholder('you@example.com').fill('creator@test.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Navigate to Profile
    await page.locator('button[title="Profile"]').click();
    
    // Attempt invalid post (too short)
    await page.getByPlaceholder('Describe your startup idea').fill('Too short');
    await page.getByRole('button', { name: 'Post Idea' }).click();
    await expect(page.getByText('must be at least 60 characters')).toBeVisible();

    // Create valid post
    const ideaText = 'A revolutionary app that connects plant owners with botanists for real-time video consultations.';
    await page.getByPlaceholder('Describe your startup idea').fill(ideaText);
    await page.getByRole('button', { name: 'Post Idea' }).click();

    // Check for Pending/AI State
    await expect(page.getByText('Idea under AI review...')).toBeVisible();

    // Wait for Mock AI resolution (approx 1.5s in code)
    await page.waitForTimeout(2000); 

    // Verify it appears in list as Approved
    await expect(page.getByText('approved')).toBeVisible();
    await expect(page.getByText(ideaText)).toBeVisible();
  });

  test('Admin Dashboard Access and Security', async ({ page }) => {
    // 1. Try to access Admin as normal user
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByPlaceholder('John Doe').fill('Regular User');
    await page.getByPlaceholder('you@example.com').fill('regular@test.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Verify Admin button is NOT visible
    await expect(page.locator('button[title="Admin Dashboard"]')).not.toBeVisible();

    // Logout
    await page.getByText('Exit').click();

    // 2. Login as Super Admin
    await page.getByPlaceholder('you@example.com').fill('admin@ideaswipe.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify Admin button IS visible and clickable
    await page.locator('button[title="Admin Dashboard"]').click();
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
    await expect(page.getByText('Total Users')).toBeVisible();
  });

  test('Feed Interaction', async ({ page }) => {
    // Use Admin to generate data via Seed (Admin is already seeded with ideas)
    await page.getByPlaceholder('you@example.com').fill('admin@ideaswipe.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Navigate to Feed
    // Note: Admin authored the initial ideas, so Admin won't see them in feed (logic filters own ideas).
    // We need a second user to see Admin's ideas.
    await page.getByText('Exit').click();

    // Create Viewer User
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByPlaceholder('John Doe').fill('Viewer');
    await page.getByPlaceholder('you@example.com').fill('viewer@test.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should see an idea card
    const voteButton = page.locator('button').filter({ hasText: '' }).nth(3); // Assuming heart button location or class logic
    // Actually, let's use the svg or accessible implementation.
    // In our code, buttons are at the bottom.
    
    // Check if card exists
    await expect(page.locator('.bg-card').first()).toBeVisible();

    // Perform Like
    // Note: In a real test we'd add data-testid to buttons. 
    // Here we click the right-side button (Like)
    await page.locator('button.bg-primary.text-primary-foreground').click();

    // Expect stats to appear
    await expect(page.getByText('Likes')).toBeVisible();
    await expect(page.getByText('Swipe Right for Next Idea')).toBeVisible();
  });
});
