import { expect, test } from '@playwright/test';

const pngFixture = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFElEQVR4nGP8z8AARLJgwiGCAgBEEgIC+5tN8AAAAABJRU5ErkJggg==',
  'base64'
);

test('imports an image and exports a mood-board PNG', async ({ page }) => {
  await page.goto('./?clip=0');
  await expect(page.getByRole('heading', { name: 'Artist reference workspace' })).toBeVisible();

  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'warm-city-reference.png',
    mimeType: 'image/png',
    buffer: pngFixture
  });

  await expect(
    page.getByRole('region', { name: 'Mood board' }).getByRole('heading', { name: 'warm-city-reference.png' })
  ).toBeVisible();
  const pngButton = page.getByRole('button', { name: 'PNG', exact: true });
  await expect(pngButton).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await pngButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/artist-reference-board.*\.png/);
});
