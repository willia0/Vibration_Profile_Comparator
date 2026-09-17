// Usage: node browser-check.cjs <path-to-playwright-package>
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    assert.equal(await page.locator('.profile-option').count(), 15);
    assert.equal(await page.locator('.profile-path').count(), 4);
    await page.locator('[data-group-toggle="DIN/TS 70214"]').click();
    assert.equal(await page.locator('.profile-path').count(), 5);
    assert.match(await page.locator('#selectionMessage').innerText(), /5/);
    assert.equal(await page.locator('.profile-option input:checked:disabled').count(), 0);
    assert.equal(await page.locator('.profile-option input:disabled').count(), 10);
    await page.locator('#clearSelection').click();
    assert.equal(await page.locator('.profile-path').count(), 0);
    assert.equal(await page.locator('.profile-option input:disabled').count(), 0);
    await page.locator('[data-group-toggle="USCAR-2"]').click();
    assert.equal(await page.locator('.profile-path').count(), 5);
    await page.locator('[data-group-toggle="USCAR-2"]').click();
    assert.equal(await page.locator('.profile-path').count(), 0);
    await page.locator('#resetSelection').click();
    assert.equal(await page.locator('.profile-path').count(), 4);
    await page.locator('#clearSelection').click();
    await page.locator('[data-group-toggle="GMW3191 April 2025"]').click();
    assert.equal(await page.locator('.profile-path').count(), 5);
    assert.equal(await page.locator('input[value="gmw3191-v5"]').isDisabled(), true);
    await page.locator('input[value="gmw3191-v1a"]').uncheck({ force: true });
    await page.locator('input[value="gmw3191-v5"]').check({ force: true });
    assert.equal(await page.locator('.profile-path').count(), 5);
    assert.equal(await page.locator('#dataErrors').isVisible(), false);
    await page.locator('#resetSelection').click();
    await page.screenshot({ path: path.join(__dirname, 'check-desktop.png'), fullPage: true });
    await page.evaluate(() => {
      const added = validateProfiles([
        { id: 'third', standard: 'Third <standard> & reference', level: 'Extra', points: [[1, 0.0001], [10000, 1000]] },
        { id: 'fourth', standard: 'Fourth standard', level: 'Extra', points: [[10, 1], [100, 2]] }
      ]);
      profiles.push(...added.profiles);
      renderOptions();
      setSelection(['din-v1', 'uscar-v1', 'third']);
    });
    assert.equal(await page.locator('.standard-group').count(), 5);
    assert.equal(await page.locator('input[value="fourth"]').isDisabled(), true);
    assert.deepEqual(await page.evaluate(() => [X_DOMAIN, Y_DOMAIN]), [[1, 10000], [0.0001, 1000]]);
    assert.equal(await page.locator('.standard-heading h3').nth(3).textContent(), 'Third <standard> & reference');
    await page.locator('[data-group-toggle="Fourth standard"]').click();
    assert.equal(await page.locator('.profile-path').count(), 3);
    await page.locator('input[value="din-v1"]').uncheck({ force: true });
    assert.equal(await page.locator('input[value="fourth"]').isDisabled(), false);
    await page.locator('input[value="fourth"]').check({ force: true });
    await page.locator('#resetSelection').click();
    const csvDownload = page.waitForEvent('download');
    await page.locator('#exportCsv').click();
    assert.equal((await csvDownload).suggestedFilename(), 'vibration-profiles.csv');
    const svgDownload = page.waitForEvent('download');
    await page.locator('#exportSvg').click();
    assert.equal((await svgDownload).suggestedFilename(), 'vibration-profile-comparison.svg');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: path.join(__dirname, 'check-mobile.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('.profile-path').count(), 4);
    assert.deepEqual(errors, []);
    console.log('PASS: direct file loading, group selection, limits, reset/clear, new standards, axis expansion, exports and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
