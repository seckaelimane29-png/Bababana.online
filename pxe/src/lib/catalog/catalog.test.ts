import { describe, expect, it } from 'vitest';
import { courses, creators } from './demo-data';
import { filterCourses, parseFilters } from './filter';
import { isCheckoutOpen, availableProviders } from '@/lib/payments/providers';

const byUsername = new Map(creators.map((c) => [c.username, c]));
const slugs = (f: Parameters<typeof filterCourses>[1]) => filterCourses(courses, f, byUsername).map((c) => c.slug);

describe('parseFilters', () => {
  it('keeps valid values and drops unknown ones', () => {
    expect(parseFilters({ language: 'fr', level: 'expert', currency: 'USD', price: 'free', category: 'tech' })).toEqual({
      q: undefined,
      category: 'tech',
      language: 'fr',
      level: undefined,
      price: 'free',
      currency: undefined,
    });
  });
  it('rejects malformed categories and takes the first repeated value', () => {
    expect(parseFilters({ category: '../etc', q: ['a', 'b'] })).toMatchObject({ category: undefined, q: 'a' });
  });
});

describe('filterCourses', () => {
  it('filters by currency without converting', () => {
    const gmd = slugs({ currency: 'GMD' });
    expect(gmd.length).toBeGreaterThan(0);
    for (const s of gmd) expect(courses.find((c) => c.slug === s)!.prices.some((p) => p.currency === 'GMD')).toBe(true);
    expect(gmd).not.toContain('lancer-un-service-traiteur'); // XOF only
  });
  it('separates free and paid', () => {
    expect(slugs({ price: 'free' })).toEqual(['composting-basics']);
    expect(slugs({ price: 'paid' })).not.toContain('composting-basics');
  });
  it('searches title, instructor and expertise, accent-insensitive', () => {
    expect(slugs({ q: 'lamin' })).toEqual(['build-your-first-website', 'understanding-crypto-risks']);
    expect(slugs({ q: 'hygiene' })).toContain('lancer-un-service-traiteur');
    expect(slugs({ q: 'whatsapp' })).toContain('vendre-sur-instagram-et-whatsapp');
  });
  it('combines filters', () => {
    expect(slugs({ language: 'fr', level: 'intermediate' }).sort()).toEqual(
      ['lancer-un-service-traiteur', 'tresses-et-soins-devenir-pro'].sort(),
    );
  });
});

describe('demo data integrity', () => {
  it('every course belongs to a known creator and is marked demo', () => {
    for (const c of courses) {
      expect(byUsername.has(c.creatorUsername)).toBe(true);
      expect(c.isDemo).toBe(true);
      for (const p of c.prices) expect(Number.isSafeInteger(p.amountMinor) && p.amountMinor > 0).toBe(true);
      expect(new Set(c.prices.map((p) => p.currency)).size).toBe(c.prices.length);
    }
  });
});

describe('payments', () => {
  it('no provider is available until an adapter is implemented', () => {
    const env = { PAYDUNYA_MASTER_KEY: 'x', PAYDUNYA_PRIVATE_KEY: 'x', PAYDUNYA_TOKEN: 'x' };
    expect(availableProviders('XOF', env)).toEqual([]);
    expect(isCheckoutOpen(['XOF', 'GMD', 'EUR'], env)).toBe(false);
  });
});
