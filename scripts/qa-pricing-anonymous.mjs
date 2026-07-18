/**
 * QA Pricing (anònim): obre /pricing i comprova preus per segment.
 * Ús: node scripts/qa-pricing-anonymous.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL || 'http://localhost:5173';

function eurosToNumber(text) {
  const m = text.replace(/\s/g, ' ').match(/(\d+)[,.](\d{2})/);
  if (!m) return null;
  return Number(`${m[1]}.${m[2]}`);
}

async function clickIfVisible(page, name) {
  const btn = page.getByRole('button', { name });
  if (await btn.count()) {
    await btn.first().click();
    await page.waitForTimeout(400);
    return true;
  }
  return false;
}

async function readPremiumPrice(page) {
  // El preu premium destacat (blau) sol ser el més gran / el de la card Premium
  const body = await page.locator('body').innerText();
  return body;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    // Esperar que desaparegui el loading del preu
    await page.waitForFunction(() => {
      const t = document.body.innerText;
      return /9[,.]99|24[,.]99|99[,.]99|249[,.]99/.test(t);
    }, { timeout: 30000 }).catch(() => null);

    // Segment individual (default o click)
    await clickIfVisible(page, /Jugadors|Players|entrenadors|coaches/i);
    await page.waitForTimeout(800);
    let text = await readPremiumPrice(page);
    results.push({
      case: 'anonymous_individual_month',
      has999: /9[,.]99/.test(text),
      has2499: /24[,.]99/.test(text),
      snippet: text.match(/9[,.]99|24[,.]99|99[,.]99|249[,.]99/g) || [],
    });

    // Anual
    await clickIfVisible(page, /Anual|Annual/i);
    await page.waitForTimeout(500);
    text = await readPremiumPrice(page);
    results.push({
      case: 'anonymous_individual_year',
      has9999: /99[,.]99/.test(text),
      has24999: /249[,.]99/.test(text),
      snippet: text.match(/9[,.]99|24[,.]99|99[,.]99|249[,.]99/g) || [],
    });

    // Llistar botons per depurar i clicar segment club
    const buttonLabels = await page.getByRole('button').allTextContents();
    const clubBtn = page.getByRole('button', { name: /Club/i });
    const clubCount = await clubBtn.count();
    if (clubCount > 0) {
      await clubBtn.last().click();
      await page.waitForTimeout(1000);
    }
    await clickIfVisible(page, /Mensual|Monthly/i);
    await page.waitForTimeout(800);
    text = await readPremiumPrice(page);
    results.push({
      case: 'anonymous_club_month',
      buttonLabels,
      clubCount,
      showsClubPrice: /24[,.]99/.test(text),
      stillOnlyIndividual: /9[,.]99/.test(text) && !/24[,.]99/.test(text),
      snippet: text.match(/9[,.]99|24[,.]99|99[,.]99|249[,.]99/g) || [],
    });

    await clickIfVisible(page, /Anual|Annual/i);
    await page.waitForTimeout(500);
    text = await readPremiumPrice(page);
    results.push({
      case: 'anonymous_club_year',
      showsClubYear: /249[,.]99/.test(text),
      snippet: text.match(/9[,.]99|24[,.]99|99[,.]99|249[,.]99/g) || [],
    });

    await page.screenshot({ path: 'scripts/qa-pricing-anonymous.png', fullPage: true });
  } finally {
    await browser.close();
  }

  const pass =
    results[0]?.has999 === true &&
    results[1]?.has9999 === true &&
    results.find((r) => r.case === 'anonymous_club_month')?.showsClubPrice === true &&
    results.find((r) => r.case === 'anonymous_club_year')?.showsClubYear === true;

  console.log(JSON.stringify({ pass, results }, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
