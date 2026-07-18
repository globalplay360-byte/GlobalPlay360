/**
 * QA Pricing amb login player / coach / club.
 * Llegeix scripts/qa-accounts.generated.json
 */
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL || 'http://localhost:5173';
const accounts = JSON.parse(readFileSync('scripts/qa-accounts.generated.json', 'utf8'));

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /Iniciar|Login|Entrar|Sign in/i }).click();
  await page.waitForTimeout(4000);
}

async function gotoPricing(page) {
  await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => /9[,.]99|24[,.]99|99[,.]99|249[,.]99/.test(document.body.innerText), {
    timeout: 30000,
  }).catch(() => null);
  await page.waitForTimeout(1500);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const account of accounts.accounts) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await login(page, account.email, accounts.password);
      await gotoPricing(page);
      const text = await page.locator('body').innerText();
      const buttons = await page.getByRole('button').allTextContents();
      const hasSegmentToggle = buttons.some((b) => /Club|entrenador|Player|Jugador/i.test(b));
      const row = {
        role: account.role,
        email: account.email,
        hasSegmentToggle,
        prices: text.match(/9[,.]99|24[,.]99|99[,.]99|249[,.]99/g) || [],
        expectsIndividual: account.role === 'player' || account.role === 'coach',
        expectsClub: account.role === 'club',
      };
      row.ok =
        (row.expectsIndividual && row.prices.includes('9,99') && !row.prices.includes('24,99') && !row.hasSegmentToggle)
        || (row.expectsClub && row.prices.includes('24,99') && !row.prices.includes('9,99') && !row.hasSegmentToggle)
        || (row.expectsIndividual && /9[,.]99/.test(text) && !/24[,.]99/.test(text) && !row.hasSegmentToggle)
        || (row.expectsClub && /24[,.]99/.test(text) && !row.hasSegmentToggle);

      // Normalitza: locale pot usar coma
      const bodyHas999 = /9[,.]99/.test(text);
      const bodyHas2499 = /24[,.]99/.test(text);
      if (row.expectsIndividual) {
        row.ok = bodyHas999 && !bodyHas2499 && !row.hasSegmentToggle;
      } else if (row.expectsClub) {
        row.ok = bodyHas2499 && !row.hasSegmentToggle;
      }

      await page.screenshot({ path: `scripts/qa-pricing-${account.role}.png`, fullPage: true });
      results.push(row);
    } catch (err) {
      results.push({ role: account.role, email: account.email, ok: false, error: String(err) });
    } finally {
      await context.close();
    }
  }

  await browser.close();
  const pass = results.every((r) => r.ok);
  console.log(JSON.stringify({ pass, results }, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
