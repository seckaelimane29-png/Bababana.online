import { isCurrency } from '@/lib/money';
import { COURSE_LANGUAGES, COURSE_LEVELS } from './types';
import type { Course, CourseFilters, CourseLanguage, CourseLevel, Creator } from './types';

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** Turn untrusted URL search params into validated filters; unknown values are dropped. */
export function parseFilters(params: RawParams): CourseFilters {
  const q = first(params.q)?.slice(0, 100);
  const category = first(params.category);
  const language = first(params.language);
  const level = first(params.level);
  const price = first(params.price);
  const currency = first(params.currency);
  return {
    q,
    category: category && /^[a-z0-9-]{1,40}$/.test(category) ? category : undefined,
    language: COURSE_LANGUAGES.includes(language as CourseLanguage) ? (language as CourseLanguage) : undefined,
    level: COURSE_LEVELS.includes(level as CourseLevel) ? (level as CourseLevel) : undefined,
    price: price === 'free' || price === 'paid' ? price : undefined,
    currency: isCurrency(currency) ? currency : undefined,
  };
}

const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function filterCourses(
  courses: Course[],
  filters: CourseFilters,
  creatorsByUsername: Map<string, Creator>,
): Course[] {
  const terms = filters.q ? normalize(filters.q).split(/\s+/).filter(Boolean) : [];
  return courses.filter((c) => {
    if (filters.category && c.categorySlug !== filters.category) return false;
    if (filters.language && c.language !== filters.language) return false;
    if (filters.level && c.level !== filters.level) return false;
    const isFree = c.prices.length === 0;
    if (filters.price === 'free' && !isFree) return false;
    if (filters.price === 'paid' && isFree) return false;
    if (filters.currency && !c.prices.some((p) => p.currency === filters.currency)) return false;
    if (terms.length) {
      const creator = creatorsByUsername.get(c.creatorUsername);
      const haystack = normalize(
        [c.title, c.subtitle, c.categorySlug, creator?.displayName ?? '', ...(creator?.expertise ?? [])].join(' '),
      );
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });
}
