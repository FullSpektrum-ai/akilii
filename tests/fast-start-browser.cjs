const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    '/Users/andreskepple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
);
const assert = require('node:assert/strict');

const chatEvents = [
  {
    type: 'meta',
    conversation_id: 'fast-start-conversation',
    user_message: {
      id: 'fast-start-user',
      role: 'user',
      content: 'Help me turn a difficult project into one clear first step.',
    },
  },
  { type: 'delta', text: 'Let’s begin with one clear outcome.' },
  {
    type: 'done',
    message: {
      id: 'fast-start-assistant',
      role: 'assistant',
      content: 'Let’s begin with one clear outcome.',
    },
  },
];

const chatStream = chatEvents
  .map((event) => `data: ${JSON.stringify(event)}\n\n`)
  .join('');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }),
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      colorScheme: 'light',
    });
    const errors = [];
    let profile = null;
    const bootstrap = () => ({
      user: { id: 'fast-start-review', email: 'fast-start@example.test' },
      profile,
      policy: '2026-09-05-v1',
      conversations: [],
      memories: [],
      work: [],
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/api/bootstrap', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bootstrap()) }),
    );
    await page.route('**/api/profile', async (route) => {
      const body = route.request().postDataJSON();
      profile = {
        name: body.name,
        focus: body.focus,
        style: body.style,
        consent_at: new Date().toISOString(),
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bootstrap()),
      });
    });
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: chatStream,
      }),
    );

    await page.goto('http://127.0.0.1:4317');
    await page.getByRole('button', { name: 'Create my akilii space', exact: false }).click();
    await page.getByRole('heading', { name: 'Start anywhere' }).waitFor();
    assert.equal(await page.locator('#onboarding').isVisible(), false);
    assert.equal(await page.locator('#phase7-fast-name').getAttribute('required'), null);
    assert.match(
      await page.locator('#phase7-fast-start').textContent(),
      /working preferences are optional/i,
    );

    await page
      .locator('#phase7-fast-message')
      .fill('Help me turn a difficult project into one clear first step.');
    await page.locator('#phase7-fast-name').fill('Review person');
    await page.locator('#phase7-fast-consent').check();
    await page
      .getByRole('button', { name: 'Start with this', exact: false })
      .click();

    await page.locator('#application').waitFor({ state: 'visible' });
    await page.getByText('Let’s begin with one clear outcome.').waitFor();
    assert.equal(await page.locator('#profile-name').textContent(), 'Review person');
    assert.equal(await page.locator('#setup-focus').inputValue(), '');
    assert.equal(await page.locator('#setup-style').inputValue(), '');

    await page.reload();
    await page.getByRole('button', { name: 'Continue to my space' }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    assert.deepEqual(errors, []);
    console.log(
      'PASS fast start: real objective, optional name, explicit consent, live response, returning account and narrow viewport',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
