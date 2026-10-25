/**
 * Money helpers. Amounts are always integers in the currency's minor unit
 * (ISO 4217 exponent), paired with a currency code. No floats, no FX.
 * Mirrors the `currencies` table in supabase/migrations/0001_core_schema.sql.
 */

export const CURRENCIES = {
  GMD: { exponent: 2, symbol: 'D' },
  XOF: { exponent: 0, symbol: 'FCFA' },
  EUR: { exponent: 2, symbol: '€' },
} as const;

export type Currency = keyof typeof CURRENCIES;

export interface Money {
  amountMinor: number; // safe-integer minor units; bigint in the database
  currency: Currency;
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && Object.hasOwn(CURRENCIES, value);
}

function assertMinor(amountMinor: number) {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError(`Money amounts must be safe integers in minor units, got ${amountMinor}`);
  }
}

/** Format for display, e.g. "D 1,500.00", "15 000 FCFA", "€25.00". */
export function formatMoney({ amountMinor, currency }: Money, locale: string): string {
  assertMinor(amountMinor);
  const { exponent } = CURRENCIES[currency];
  const divisor = 10 ** exponent;
  // Split into integer + fraction with integer math, then let Intl group digits.
  const sign = amountMinor < 0 ? '-' : '';
  const abs = Math.abs(amountMinor);
  const major = Math.trunc(abs / divisor);
  const minor = abs % divisor;
  const numberLocale = locale === 'fr' ? 'fr-SN' : 'en-GM';
  const grouped = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(major);
  const decimalSep = locale === 'fr' ? ',' : '.';
  const number = exponent > 0 ? `${grouped}${decimalSep}${String(minor).padStart(exponent, '0')}` : grouped;

  switch (currency) {
    case 'GMD':
      return `${sign}D ${number}`;
    case 'XOF':
      return `${sign}${number} FCFA`;
    case 'EUR':
      return locale === 'fr' ? `${sign}${number} €` : `${sign}€${number}`;
  }
}

/**
 * Parse a user-entered major-unit string ("1500", "1 500,50", "25.5") into
 * minor units without floating point. Returns null when invalid or when it has
 * more decimals than the currency allows.
 */
export function parseMajorToMinor(input: string, currency: Currency): number | null {
  const { exponent } = CURRENCIES[currency];
  const cleaned = input.trim().replace(/[\s  ]/g, '');
  const match = /^(\d+)(?:[.,](\d+))?$/.exec(cleaned);
  if (!match) return null;
  const [, whole, frac = ''] = match;
  if (frac.length > exponent) return null;
  const minorStr = whole + frac.padEnd(exponent, '0');
  const value = Number(minorStr);
  return Number.isSafeInteger(value) ? value : null;
}

/** Platform fee in minor units, rounded half-up. bps = basis points (1% = 100). */
export function feeFromBps(amountMinor: number, bps: number): number {
  assertMinor(amountMinor);
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) throw new RangeError(`Invalid bps ${bps}`);
  return Math.floor((amountMinor * bps + 5_000) / 10_000);
}
