#!/usr/bin/env node
/**
 * i18n-check: validates that all locale JSON files share the exact same key structure.
 *
 * Exits with code 1 if any locale has missing or extra keys compared to the reference.
 * Run via: npm run i18n:check
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const NAMESPACE = 'common.json';
const REFERENCE = 'ca';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function collectKeys(obj, prefix = '') {
  const keys = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      for (const child of collectKeys(v, full)) keys.add(child);
    } else {
      keys.add(full);
    }
  }
  return keys;
}

function loadLocale(locale) {
  const filePath = path.join(LOCALES_DIR, locale, NAMESPACE);
  if (!fs.existsSync(filePath)) {
    console.error(`${RED}✗ Missing file: ${filePath}${RESET}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`${RED}✗ Invalid JSON in ${filePath}:${RESET} ${err.message}`);
    process.exit(1);
  }
}

function main() {
  const locales = fs.readdirSync(LOCALES_DIR).filter((entry) => {
    return fs.statSync(path.join(LOCALES_DIR, entry)).isDirectory();
  });

  if (!locales.includes(REFERENCE)) {
    console.error(`${RED}✗ Reference locale "${REFERENCE}" not found in ${LOCALES_DIR}${RESET}`);
    process.exit(1);
  }

  console.log(`${BOLD}i18n-check${RESET}  reference=${REFERENCE}  locales=[${locales.join(', ')}]\n`);

  const keysByLocale = {};
  for (const loc of locales) {
    keysByLocale[loc] = collectKeys(loadLocale(loc));
  }

  const referenceKeys = keysByLocale[REFERENCE];
  let errors = 0;

  for (const loc of locales) {
    if (loc === REFERENCE) continue;
    const keys = keysByLocale[loc];

    const missing = [...referenceKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !referenceKeys.has(k));

    if (missing.length === 0 && extra.length === 0) {
      console.log(`${GREEN}✓${RESET} ${loc}  in sync (${keys.size} keys)`);
      continue;
    }

    errors++;
    console.log(`${RED}✗${RESET} ${loc}  out of sync`);
    if (missing.length > 0) {
      console.log(`  ${YELLOW}Missing in ${loc} (present in ${REFERENCE}):${RESET}`);
      missing.forEach((k) => console.log(`    - ${k}`));
    }
    if (extra.length > 0) {
      console.log(`  ${YELLOW}Extra in ${loc} (not in ${REFERENCE}):${RESET}`);
      extra.forEach((k) => console.log(`    + ${k}`));
    }
  }

  if (errors > 0) {
    console.log(`\n${RED}${BOLD}Failed:${RESET} ${errors} locale(s) out of sync with ${REFERENCE}.`);
    process.exit(1);
  }

  console.log(`\n${GREEN}${BOLD}All locales in sync.${RESET}`);
}

main();
