import { expect, test } from '@playwright/test';

const ALL_IN = '₹1,23,62,782';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('Example loads the reference quote and shows the all-in cost', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Example' }).click();
  await page.getByRole('tab', { name: 'Cost Sheet' }).click();
  await expect(page.getByTestId('all-in')).toHaveText(ALL_IN);
});

test('copied share link restores the same all-in cost in a new page', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Example' }).click();
  await page.getByRole('tab', { name: 'Cost Sheet' }).click();
  await expect(page.getByTestId('all-in')).toHaveText(ALL_IN);
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByText('Link copied')).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain('?s=');

  const page2 = await context.newPage();
  await page2.goto(link);
  await page2.getByRole('tab', { name: 'Cost Sheet' }).click();
  await expect(page2.getByTestId('all-in')).toHaveText(ALL_IN);
});
