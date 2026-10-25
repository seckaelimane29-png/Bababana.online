import { describe, expect, it } from 'vitest';
import { feeFromBps, formatMoney, isCurrency, parseMajorToMinor } from './money';

const nb = (s: string) => s.replace(/[  ]/g, ' ');

describe('formatMoney', () => {
  it('formats GMD with two decimals', () => {
    expect(nb(formatMoney({ amountMinor: 150000, currency: 'GMD' }, 'en'))).toBe('D 1,500.00');
  });
  it('formats XOF with no decimals (exponent 0)', () => {
    expect(nb(formatMoney({ amountMinor: 15000, currency: 'XOF' }, 'fr'))).toBe('15 000 FCFA');
  });
  it('formats EUR per locale', () => {
    expect(formatMoney({ amountMinor: 2500, currency: 'EUR' }, 'en')).toBe('€25.00');
    expect(nb(formatMoney({ amountMinor: 2505, currency: 'EUR' }, 'fr'))).toBe('25,05 €');
  });
  it('rejects non-integer amounts', () => {
    expect(() => formatMoney({ amountMinor: 1.5, currency: 'EUR' }, 'en')).toThrow(RangeError);
  });
});

describe('parseMajorToMinor', () => {
  it('parses without floating point error', () => {
    expect(parseMajorToMinor('0.29', 'EUR')).toBe(29);
    expect(parseMajorToMinor('1 500,50', 'GMD')).toBe(150050);
    expect(parseMajorToMinor('25.5', 'EUR')).toBe(2550);
  });
  it('rejects decimals for XOF', () => {
    expect(parseMajorToMinor('15000', 'XOF')).toBe(15000);
    expect(parseMajorToMinor('150.5', 'XOF')).toBeNull();
  });
  it('rejects garbage and too many decimals', () => {
    expect(parseMajorToMinor('abc', 'GMD')).toBeNull();
    expect(parseMajorToMinor('-5', 'GMD')).toBeNull();
    expect(parseMajorToMinor('1.234', 'EUR')).toBeNull();
  });
});

describe('feeFromBps', () => {
  it('rounds half up in integer math', () => {
    expect(feeFromBps(15000, 1000)).toBe(1500); // 10%
    expect(feeFromBps(105, 1000)).toBe(11); // 10.5 -> 11
    expect(feeFromBps(104, 1000)).toBe(10);
    expect(feeFromBps(0, 1000)).toBe(0);
  });
  it('validates bps', () => {
    expect(() => feeFromBps(100, 10001)).toThrow();
  });
});

describe('isCurrency', () => {
  it('accepts only supported codes', () => {
    expect(isCurrency('XOF')).toBe(true);
    expect(isCurrency('USD')).toBe(false);
    expect(isCurrency('toString')).toBe(false);
  });
});
