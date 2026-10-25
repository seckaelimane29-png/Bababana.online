import type { Currency, Money } from '@/lib/money';

export type CourseLanguage = 'en' | 'fr' | 'wo';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type Country = 'GM' | 'SN';

export const COURSE_LANGUAGES: CourseLanguage[] = ['en', 'fr', 'wo'];
export const COURSE_LEVELS: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];

export interface Category {
  slug: string;
  name: { en: string; fr: string };
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  website?: string;
}

/** Creator-written content is shown as written; we never machine-translate it. */
export interface Creator {
  username: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  expertise: string[];
  languages: CourseLanguage[];
  socials: SocialLinks;
  isVerified: boolean;
  isDemo: boolean;
}

export interface Lesson {
  title: string;
  durationMinutes: number;
  isPreview: boolean;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  outcomes: string[];
  requirements: string[];
  categorySlug: string;
  language: CourseLanguage;
  level: CourseLevel;
  creatorUsername: string;
  /** One price per currency the creator sells in. Empty = free. No FX conversion. */
  prices: Money[];
  sections: Section[];
  coverHue: number; // generated cover art until real cover images exist
  isDemo: boolean;
}

export interface CourseFilters {
  q?: string;
  category?: string;
  language?: CourseLanguage;
  level?: CourseLevel;
  price?: 'free' | 'paid';
  currency?: Currency;
}

export interface CourseWithCreator extends Course {
  creator: Creator;
}
