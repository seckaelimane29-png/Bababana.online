/**
 * Catalogue data access. Pages depend only on CatalogRepository, so the demo
 * implementation can be replaced by a Supabase-backed one (stage 2) without
 * touching UI code.
 */
import { isDemoMode } from '@/lib/config';
import * as demo from './demo-data';
import { filterCourses } from './filter';
import type { Category, Course, CourseFilters, CourseWithCreator, Creator } from './types';

export interface CatalogRepository {
  readonly isDemo: boolean;
  listCategories(): Promise<Category[]>;
  searchCourses(filters: CourseFilters): Promise<CourseWithCreator[]>;
  getCourse(slug: string): Promise<CourseWithCreator | null>;
  getCreator(username: string): Promise<Creator | null>;
  listCoursesByCreator(username: string): Promise<CourseWithCreator[]>;
  listFeaturedCourses(limit: number): Promise<CourseWithCreator[]>;
  listFeaturedCreators(limit: number): Promise<Creator[]>;
  listRelatedCourses(slug: string, limit: number): Promise<CourseWithCreator[]>;
  listAllCourseSlugs(): Promise<string[]>;
  listAllCreatorUsernames(): Promise<string[]>;
}

class InMemoryCatalog implements CatalogRepository {
  private creatorsByUsername: Map<string, Creator>;

  constructor(
    readonly isDemo: boolean,
    private categories: Category[],
    private courses: Course[],
    creators: Creator[],
  ) {
    this.creatorsByUsername = new Map(creators.map((c) => [c.username, c]));
  }

  private withCreator = (course: Course): CourseWithCreator[] => {
    const creator = this.creatorsByUsername.get(course.creatorUsername);
    return creator ? [{ ...course, creator }] : [];
  };

  async listCategories() {
    return this.categories;
  }
  async searchCourses(filters: CourseFilters) {
    return filterCourses(this.courses, filters, this.creatorsByUsername).flatMap(this.withCreator);
  }
  async getCourse(slug: string) {
    const course = this.courses.find((c) => c.slug === slug);
    return course ? (this.withCreator(course)[0] ?? null) : null;
  }
  async getCreator(username: string) {
    return this.creatorsByUsername.get(username) ?? null;
  }
  async listCoursesByCreator(username: string) {
    return this.courses.filter((c) => c.creatorUsername === username).flatMap(this.withCreator);
  }
  async listFeaturedCourses(limit: number) {
    return this.courses.filter((c) => c.prices.length > 0).slice(0, limit).flatMap(this.withCreator);
  }
  async listFeaturedCreators(limit: number) {
    return [...this.creatorsByUsername.values()].slice(0, limit);
  }
  async listRelatedCourses(slug: string, limit: number) {
    const course = this.courses.find((c) => c.slug === slug);
    if (!course) return [];
    const others = this.courses.filter((c) => c.slug !== slug);
    const ranked = [
      ...others.filter((c) => c.categorySlug === course.categorySlug),
      ...others.filter((c) => c.categorySlug !== course.categorySlug && c.language === course.language),
    ];
    return ranked.slice(0, limit).flatMap(this.withCreator);
  }
  async listAllCourseSlugs() {
    return this.courses.map((c) => c.slug);
  }
  async listAllCreatorUsernames() {
    return [...this.creatorsByUsername.keys()];
  }
}

/** Categories are platform reference data and are shown even without demo content. */
export function getCatalog(): CatalogRepository {
  return isDemoMode()
    ? new InMemoryCatalog(true, demo.categories, demo.courses, demo.creators)
    : new InMemoryCatalog(false, demo.categories, [], []);
}

export function totalMinutes(course: Course): number {
  return course.sections.reduce((sum, s) => sum + s.lessons.reduce((m, l) => m + l.durationMinutes, 0), 0);
}

export function lessonCount(course: Course): number {
  return course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
}

/**
 * Cache Components requires generateStaticParams to return at least one entry.
 * With an empty catalogue we return a placeholder that the page 404s on.
 */
export const PLACEHOLDER_PARAM = '__none__';
export function atLeastOne(values: string[]): string[] {
  return values.length ? values : [PLACEHOLDER_PARAM];
}
