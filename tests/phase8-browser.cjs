const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
  try {
    const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
      }),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://127.0.0.1:4317/?phase8=demo');
    await page.locator('#enter-space').click();
    await page.getByRole('button', { name: 'Start flagship story' }).click();
    await page
      .getByRole('button', { name: 'Meaning Field', exact: true })
      .waitFor();
    await page.screenshot({ path: '../phase8-meaning.png', fullPage: true });
    await page
      .getByRole('button', { name: 'Change objective', exact: true })
      .click();
    await page.locator('#phase8-objective').fill('Make the opening clear');
    await page
      .getByRole('button', { name: 'Use this objective', exact: true })
      .click();
    assert.equal(
      await page
        .getByRole('button', { name: 'Bounded Workset', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    );
    await page.locator('#message-input').fill('One thing please');
    await page.locator('#send').click();
    assert.equal(
      await page
        .getByRole('button', { name: 'One Next Move', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    );
    await page.getByRole('button', { name: 'Why this?', exact: true }).click();
    assert(
      await page
        .getByText('You explicitly asked for this kind of support.')
        .isVisible(),
    );
    await page.locator('#dialog-close').click();
    await page
      .getByRole('button', { name: 'Shape a useful draft', exact: true })
      .click();
    await page
      .locator('.support-draft textarea')
      .fill('We help people turn a messy intention into one useful next move.');
    await page
      .getByRole('button', { name: 'Propose saving to Work', exact: true })
      .click();
    assert(
      await page
        .getByText('Nothing has been saved to Work yet.', { exact: true })
        .isVisible(),
    );
    await page
      .getByRole('button', { name: 'Approve & save to Work', exact: true })
      .click();
    await page.getByText('ACTION RECEIPT', { exact: true }).waitFor();
    await page
      .getByRole('button', { name: 'Keep my place for later', exact: true })
      .click();
    await page
      .locator('#phase7-thread-next')
      .fill('Review the why-now sentence');
    await page
      .getByRole('button', { name: 'Hold this Thread', exact: true })
      .click();
    await page.reload();
    await page.locator('#enter-space').click();
    await page
      .getByRole('button', { name: 'Resume here →', exact: true })
      .click();
    assert(
      await page
        .getByText('Review the why-now sentence', { exact: true })
        .first()
        .isVisible(),
    );
    await page
      .getByRole('button', { name: 'Finish and reflect', exact: true })
      .click();
    await page.locator('input[value=helpful]').check();
    await page
      .getByRole('button', { name: 'Close Thread', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Review a support suggestion', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Use for this session', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Start flagship story', exact: true })
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: '../phase8-mobile.png', fullPage: true });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    assert.equal(overflow, false, 'viewport overflow');
    assert.deepEqual(errors, []);
    console.log(
      'PASS Phase 8: meaning → objective → one move → draft → approval → receipt → hold → reload → resume → close → session-only learning; mobile; no page errors',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
